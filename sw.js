const CACHE_NAME = 'mech-guide-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Picture assets/college.jpg',
  './Picture assets/m3ml.jpg',
  './Picture assets/main.jpg',
  './Picture assets/registration.jpg',
  './Picture assets/annex.jpg',
  './Picture assets/hashem.jpg',
  './Picture assets/muneer.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
