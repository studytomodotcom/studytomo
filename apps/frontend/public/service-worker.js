const CACHE_NAME = "studytomo-cache-v1";
const URLS_TO_CACHE = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// activate - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
});

// fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      // return cached or fetch
      return (
        resp ||
        fetch(event.request).catch(() =>
          // offline fallback - you can customize
          caches.match("/")
        )
      );
    })
  );
});
