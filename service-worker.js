const CACHE_NAME = "my-app-cache-v4";
const urlsToCache = [
  "/",
  "/index.html",
  "/logowide.png",
  "/logo192.png",
  "/logo256.png"
  // Aggiungi altre risorse statiche qui
];

// Funzione per aggiungere tutte le risorse della cartella static alla cache
const cacheStaticAssets = async (cache) => {
  try {
    const response = await fetch('/asset-manifest.json');
    const assets = await response.json();
    const urls = Object.values(assets.files);
    console.log('Assets to cache:', urls);
    return cache.addAll(urls);
  } catch (error) {
    console.error('Failed to cache static assets:', error);
  }
};

self.addEventListener("install", event => {
  self.skipWaiting(); // Forza l'attivazione immediata
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache).then(() => {
        return cacheStaticAssets(cache);
      });
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
    }).then(() => self.clients.claim()) // Prende subito il controllo delle pagine
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push event received:', data);
  const title = data.title || 'Notifica';
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: data.tag
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
