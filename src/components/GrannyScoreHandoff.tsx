"use client";

import { useEffect } from "react";
import { claimGrannyScore } from "@/lib/actions";
import { GRANNY_STORAGE_KEY, type GrannyLocalState } from "@/components/GrannysMoneyCorner";

/**
 * Invisible bridge from the anonymous landing-page widget into a real
 * account. Runs once per dashboard load: if there's an unclaimed
 * Granny's Money Corner score sitting in localStorage, hand it to the
 * server and clear the key so it's never read (or re-claimed) again.
 * A no-op for anyone who never played, and for anyone already claimed.
 */
export function GrannyScoreHandoff() {
  useEffect(() => {
    const raw = window.localStorage.getItem(GRANNY_STORAGE_KEY);
    if (!raw) return;

    let state: GrannyLocalState;
    try {
      state = JSON.parse(raw);
    } catch {
      window.localStorage.removeItem(GRANNY_STORAGE_KEY);
      return;
    }

    if (!state.lastPlayedDate) {
      // Empty/never-played state — nothing worth claiming.
      window.localStorage.removeItem(GRANNY_STORAGE_KEY);
      return;
    }

    claimGrannyScore(state)
      .then(() => window.localStorage.removeItem(GRANNY_STORAGE_KEY))
      .catch(() => {
        // Leave it in localStorage — safe to retry the claim on a later visit.
      });
  }, []);

  return null;
}
