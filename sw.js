const CACHE_NAME = 'geo-quiz-cache-v4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './data/countries.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
  './assets/mascot/koala-idle.svg',
  './assets/mascot/koala-happy.svg',
  './assets/mascot/koala-comfort.svg',
  './assets/mascot/koala-excited.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(APP_SHELL);
      const countries = await fetch('./data/countries.json').then((r) => r.json());
      const flagUrls = countries.map((c) => `./assets/flags/${c.code}.svg`);
      await cache.addAll(flagUrls);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
