// Minimal service worker — exists to satisfy PWA installability (Chrome/Edge
// "Install app") rather than to provide offline support. This app's data is
// always live from Supabase, so caching responses here would risk showing
// stale numbers; the fetch handler below is a deliberate pass-through.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
