// Service Worker for Cache Busting
const CACHE_NAME = 'ecolink-v1.0.0-' + Date.now()
const CACHE_VERSION = '1.0.0'

// Force cache invalidation on every load
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Only intercept non-module requests to avoid interfering with Vue
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Don't interfere with module requests or main.js
  if (url.pathname.includes('/src/') || url.pathname.includes('main.js')) {
    return
  }

  // Only intercept static assets
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }).catch(() => {
        return caches.match(event.request)
      }),
    )
  }
})
