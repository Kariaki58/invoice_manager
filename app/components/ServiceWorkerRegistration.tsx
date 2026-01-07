'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Reload the page if the controller changes (e.g., skipWaiting() was called)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 1000 * 60 * 60); // Every hour

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New update available! Dispatch event for UI prompt
                    console.log('[PWA] New content is available; please refresh.');
                    window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: registration }));
                  } else {
                    // Content is cached for offline use
                    console.log('[PWA] Content is cached for offline use.');
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error('[PWA] Registration failed:', error);
        });
    }
  }, []);

  return null;
}
