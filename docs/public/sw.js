const CACHE_VERSION = 'ecolink-cache-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.startsWith(CACHE_VERSION)) {
            return caches.delete(cacheName)
          }
          return undefined
        }),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests for same-origin static assets
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) {
    return
  }

<<<<<<< HEAD:public/sw.js
  if (!url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    return
=======
  // Don't interfere with manifest.json - let browser handle it directly
  if (url.pathname.includes('/manifest.json')) {
    return
  }

  // Don't interfere with Google Fonts - let browser handle them directly
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    return
  }

  // Only intercept static assets (excluding fonts from external domains)
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/)) {
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
>>>>>>> 191b09e226eebf78c886c5d495f26a15031099cd:docs/public/sw.js
  }

  event.respondWith(
    fetch(request, { cache: 'no-store' }).catch(() => caches.match(request)),
  )
})
