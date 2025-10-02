/**
 * Service Worker for caching and offline support
 */

const CACHE_NAME = 'ecolink-v2-2024-10-02'
const STATIC_CACHE = 'ecolink-static-v2-2024-10-02'
const DYNAMIC_CACHE = 'ecolink-dynamic-v2-2024-10-02'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add critical CSS and JS files here
]

// API endpoints to cache
const API_CACHE_PATTERNS = [/\/api\/marketplace/, /\/api\/analytics/, /\/api\/user/]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached')
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log('Service Worker activated')
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

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  event.respondWith(handleRequest(request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // Handle static assets
  if (isStaticAsset(url)) {
    return handleStaticAsset(request)
  }

  // Handle API requests
  if (isApiRequest(url)) {
    return handleApiRequest(request)
  }

  // Handle images
  if (isImageRequest(url)) {
    return handleImageRequest(request)
  }

  // Default: try cache first, then network
  return tryCacheFirst(request)
}

function isStaticAsset(url) {
  return (
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json')
  )
}

function isApiRequest(url) {
  return (
    url.pathname.startsWith('/api/') ||
    API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))
  )
}

function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)
}

async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch from network
    const networkResponse = await fetch(request)

    // Cache the response
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())

    return networkResponse
  } catch (error) {
    console.error('Error handling static asset:', error)
    return new Response('Offline - Static asset not available', { status: 503 })
  }
}

async function handleApiRequest(request) {
  try {
    // Try cache first for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        // Check if cache is still fresh (less than 5 minutes old)
        const cacheTime = cachedResponse.headers.get('sw-cache-time')
        if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
          return cachedResponse
        }
      }
    }

    // Fetch from network
    const networkResponse = await fetch(request)

    // Cache successful GET responses
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      const responseToCache = networkResponse.clone()
      responseToCache.headers.set('sw-cache-time', Date.now().toString())
      cache.put(request, responseToCache)
    }

    return networkResponse
  } catch (error) {
    console.error('Error handling API request:', error)

    // Return cached response if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    return new Response('Offline - API not available', { status: 503 })
  }
}

async function handleImageRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch from network
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Error handling image request:', error)
    return new Response('Offline - Image not available', { status: 503 })
  }
}

async function tryCacheFirst(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fetch from network
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('Error in tryCacheFirst:', error)
    return new Response('Offline - Resource not available', { status: 503 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Sync offline actions when connection is restored
  console.log('Performing background sync...')

  // This would sync any offline actions like form submissions
  // For now, just log that sync occurred
  return Promise.resolve()
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)

  const options = {
    body: event.data ? event.data.text() : 'New notification from EcoLink',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icon-72x72.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-72x72.png',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification('EcoLink', options))
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'))
  }
})
