// Service Worker for InvoiceNG PWA
// v2.0.0 - Senior PWA Engineer Refactor
const CACHE_NAME = 'invoiceng-v2';
const STATIC_CACHE = 'invoiceng-static-v2';
const IMAGE_CACHE = 'invoiceng-images-v2';

const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/globals.css',
];

// 1. Install Event - Immediate takeover
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[PWA] Precaching static assets');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// 2. Activate Event - Cache cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, STATIC_CACHE, IMAGE_CACHE].includes(cacheName)) {
              console.log('[PWA] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
    ])
  );
});

// 3. Fetch Event - Intelligent Caching Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy A: Network-First for HTML/Navigation
  // This ensures users always get the latest build if they are online.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Strategy B: Stale-While-Revalidate for JS/CSS/Static Assets
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, networkResponse.clone()));
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy C: Cache-First with Network Fallback for Images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(IMAGE_CACHE).then((cache) => cache.put(request, copy));
          return networkResponse;
        });
      })
    );
    return;
  }
});

// 4. Update Handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
