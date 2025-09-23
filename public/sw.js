// EcoLink Service Worker
const CACHE_NAME = 'ecolink-v1.0.1'
const STATIC_CACHE = 'ecolink-static-v1.0.1'
const DYNAMIC_CACHE = 'ecolink-dynamic-v1.0.1'

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  // Add your main CSS and JS files here
  '/dist/index.css',
  '/dist/index.js',
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Service Worker: Installation complete')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log('Service Worker: Activation complete')
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip Supabase API calls (let them go to network)
  if (url.hostname.includes('supabase.co')) {
    return
  }

  // Skip external resources
  if (url.origin !== location.origin) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache', request.url)
        return cachedResponse
      }

      // Otherwise fetch from network
      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache dynamic content
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })

          console.log('Service Worker: Caching new content', request.url)
          return response
        })
        .catch((error) => {
          console.error('Service Worker: Fetch failed', error)

          // Return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/index.html')
          }

          throw error
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions here
      handleBackgroundSync(),
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event)

  const options = {
    body: event.data ? event.data.text() : 'New notification from EcoLink',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/favicon.ico',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification('EcoLink', options))
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event)

  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'))
  }
})

// Helper function for background sync
async function handleBackgroundSync() {
  try {
    // Get pending offline actions from IndexedDB
    // Process them when back online
    console.log('Service Worker: Processing offline actions')

    // This would typically involve:
    // 1. Reading pending actions from IndexedDB
    // 2. Sending them to the server
    // 3. Updating local state
  } catch (error) {
    console.error('Service Worker: Background sync failed', error)
  }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
