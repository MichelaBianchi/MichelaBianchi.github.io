self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('app-cache').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/css/styles.css', // Corrected path
          '/js/main.xyz', // Corrected path
          '/js/bundle.js' // Corrected path
        ]).catch(error => {
          console.error('Failed to cache resources during install:', error);
        });
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
          console.error('Fetch failed:', error);
          throw error;
        });
      }).catch(error => {
        console.error('Cache match failed:', error);
        throw error;
      })
    );
  });
  
  self.addEventListener('push', event => {
    console.log('Push event received:', event);
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon,
      badge: data.badge
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options).catch(error => {
        console.error('Notification failed:', error);
      })
    );
  });
  