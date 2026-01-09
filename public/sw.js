// Service Worker for InvoiceNG PWA
// v2.0.0 - Senior PWA Engineer Refactor
const CACHE_NAME = 'invoiceng-v2';
const STATIC_CACHE = 'invoiceng-static-v2';
const IMAGE_CACHE = 'invoiceng-images-v2';

const URLS_TO_CACHE = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
];

// 1. Install Event - Immediate takeover
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[PWA] Precaching static assets');
      // Use addAll with error handling - cache each URL individually
      return Promise.allSettled(
        URLS_TO_CACHE.map(url => 
          cache.add(url).catch(err => {
            console.warn(`[PWA] Failed to cache ${url}:`, err);
            return null;
          })
        )
      );
    }).catch(err => {
      console.error('[PWA] Cache installation failed:', err);
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

  // Strategy A: Network-First for HTML/Navigation
  // This ensures users always get the latest build if they are online.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache if response is ok and cloneable
          if (response.ok && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy).catch(() => {
                // Ignore cache errors
              });
            }).catch(() => {
              // Ignore cache errors
            });
          }
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
          // Only cache if response is ok and cloneable
          if (networkResponse.ok && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, copy).catch(() => {
                // Ignore cache errors
              });
            }).catch(() => {
              // Ignore cache errors
            });
          }
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
          // Only cache if response is ok and cloneable
          if (networkResponse.ok && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, copy).catch(() => {
                // Ignore cache errors
              });
            }).catch(() => {
              // Ignore cache errors
            });
          }
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
