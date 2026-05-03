const CACHE_NAME = "my-app-cache-v28";
const urlsToCache = [
  "/",
  "/index.html",
  "/logowide.png",
  "/logo192.png",
  "/logo256.png"
];

const cacheStaticAssets = async (cache) => {
  try {
    const response = await fetch("/asset-manifest.json");
    const assets = await response.json();
    const urls = Object.values(assets.files);
    console.log("Assets to cache:", urls);
    return cache.addAll(urls);
  } catch (error) {
    console.error("Failed to cache static assets:", error);
  }
};

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache).then(() => cacheStaticAssets(cache));
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "NEW_VERSION_AVAILABLE" });
        });
      })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Intercetta solo richieste GET
  if (request.method !== "GET") {
    return;
  }

  // Non intercettare API backend
  const isBackendApi =
    url.origin === "https://backend-mover.com" ||
    url.pathname.startsWith("/mover/");

  if (isBackendApi) {
    return;
  }

  // Non intercettare richieste non http/https
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Facoltativo: gestisci solo asset della tua origin
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return networkResponse;
        })
        .catch((error) => {
          console.error("Fetch failed in service worker:", error);
          return caches.match(request);
        });
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  console.log("Push event received:", data);

  const title = data.title || "Notifica";
  const options = {
    body: data.body,
    icon: "/logo192.png",
    badge: "/logo192.png",
    tag: data.tag,
    data: {
      url: data.url || "/"
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  );
});