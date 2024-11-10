self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('app-cache').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/styles.css',
          '/app.js',
          '/icon-192x192.png',
          '/icon-512x512.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  
  self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon,
      badge: data.badge
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  