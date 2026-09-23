const CACHE_NAME = 'mech-guide-v2';

// All critical assets to cache for offline availability
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Picture assets/RTL.png',
  './Picture assets/college.jpg',
  './Picture assets/main.jpg',
  './Picture assets/registration.jpg',
  './Picture assets/annex.jpg',
  './Picture assets/hashem.jpg',
  './Picture assets/muneer.jpg',
  './Picture assets/m3ml.jpg'
];

// Install Event - Caching Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell and assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Cleaning Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate with Cache Fallback Strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Fetch fresh copy from network in the background to update cache
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Check if valid response
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.log('[Service Worker] Network request failed, serving from cache only:', err);
          });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
      .catch(() => {
        // Offline fallback for navigation requests to HTML
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});
