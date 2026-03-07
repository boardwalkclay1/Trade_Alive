// ===============================
// TRADE_ALIVE SERVICE WORKER
// ===============================

const CACHE_NAME = "trade-alive-shell-v1";

// Cache the core shell for offline use
const FILES_TO_CACHE = [
  "/Trade_Alive/",
  "/Trade_Alive/index.html",
  "/Trade_Alive/style.css",
  "/Trade_Alive/app.js",
  "/Trade_Alive/manifest.json",
  "/Trade_Alive/favicon.ico",
  "/Trade_Alive/icon-192.png",
  "/Trade_Alive/icon-512.png"
];

// INSTALL — cache shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ACTIVATE — clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH — network first, fallback to cache
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => caches.match(event.request))
  );
});
