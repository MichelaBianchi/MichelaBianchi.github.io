const CACHE_NAME = "my-app-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/static/css/main.css",
  "/static/js/main.js",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push event received:', data); // Aggiungi questo per il debug
  const title = data.title || 'Notifica'; // Usa un titolo di fallback se il titolo è undefined
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    tag: data.tag // Usa il tag per evitare notifiche duplicate
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
