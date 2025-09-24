// Cache clearing script for EcoLink
// This script helps clear browser cache and service worker cache

console.log('EcoLink Cache Clear Script')

// Clear browser cache
if ('caches' in window) {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      console.log('Deleting cache:', cacheName)
      caches.delete(cacheName)
    })
  })
}

// Clear service worker cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      console.log('Unregistering service worker:', registration.scope)
      registration.unregister()
    })
  })
}

// Force reload
setTimeout(() => {
  window.location.reload(true)
}, 1000)
