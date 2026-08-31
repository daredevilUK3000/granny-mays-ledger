"use client";

import { useEffect } from "react";

/** Registers the pass-through service worker so the app is installable
 * (Chrome/Edge "Install app") — see public/sw.js for why it doesn't cache. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability is a nice-to-have, not a hard dependency —
        // fail silently rather than surface this to the user.
      });
    }
  }, []);

  return null;
}
