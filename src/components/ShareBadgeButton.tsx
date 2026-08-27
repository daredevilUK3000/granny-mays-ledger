"use client";

import { useState } from "react";

/**
 * Opt-in only — nothing is shared unless this is clicked. Tries the
 * native share sheet (best on mobile) and falls back to a plain
 * download everywhere else. The image itself (badge-card/route.tsx)
 * carries no score, no £ amounts, no stat bars — just the badge.
 */
export function ShareBadgeButton({
  badgeId,
  label = "Share this badge",
  className = "",
}: {
  badgeId: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/badge-card?id=${encodeURIComponent(badgeId)}`);
      const blob = await res.blob();
      const file = new File([blob], `granny-badge-${badgeId}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Granny May's Ledger" });
      } else {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = `granny-badge-${badgeId}.png`;
        a.click();
        URL.revokeObjectURL(objectUrl);
      }
    } catch {
      // Share is a nice-to-have, not a critical path — fail quietly.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={handleShare} disabled={busy} className={className}>
      {busy ? "Preparing…" : label}
    </button>
  );
}
