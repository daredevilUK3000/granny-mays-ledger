"use client";

import { useState } from "react";
import { dismissGrannyNote } from "@/lib/actions";
import type { GrannyNoteInstance } from "@/lib/data/granny-notes";

/**
 * A small dismissible nudge, styled to match the established "Granny
 * says:" treatment (GrannysMoneyCorner.tsx) rather than introducing a new
 * look. Shows at most one note at a time — the caller passes the
 * highest-priority active note for this page, if any.
 */
export function GrannysNote({ note }: { note: GrannyNoteInstance }) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, setPending] = useState(false);

  if (dismissed) return null;

  async function handleDismiss() {
    setPending(true);
    try {
      await dismissGrannyNote(note.triggerKey);
      setDismissed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg bg-plum-soft px-4 py-3 mb-8 flex items-start justify-between gap-4">
      <div>
        <p className="font-display text-lg text-plum">Granny says:</p>
        <p className="text-sm text-ink mt-0.5">{note.message}</p>
      </div>
      <button
        onClick={handleDismiss}
        disabled={pending}
        className="text-xs text-plum hover:underline shrink-0 disabled:opacity-50"
      >
        Dismiss
      </button>
    </div>
  );
}
