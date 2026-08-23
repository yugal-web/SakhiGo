/*
  SakhiGo service worker.
  Caches the static app shell so the SOS button, saved guardians,
  and helpline numbers still load with no signal.
  Live features (geolocation, nearby-places lookup, SMS/WhatsApp links)
  still need a connection when actually used.
*/

const CACHE_NAME = "sakhigo-shell-v1";

const APP_SHELL = ["./", "./index.html", "./style.css", "./script.js", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Never intercept third-party APIs (Overpass, Maps, WhatsApp, fonts) —
  // those always need a live network round trip.
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    }),
  );
});
