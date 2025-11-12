/**
 * Force clear all caches and reload - Emergency cache clearing
 * Use this when experiencing caching issues
 */

console.log('🧹 Force clearing all caches...')

// Clear all service worker caches
if ('caches' in window) {
  caches.keys().then(function (names) {
    console.log('📦 Found caches:', names)
    for (let name of names) {
      console.log('🗑️ Deleting cache:', name)
      caches.delete(name)
    }
    console.log('✅ All caches cleared')
  })
}

// Unregister service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      console.log('🔄 Unregistering service worker:', registration.scope)
      registration.unregister()
    }
    console.log('✅ Service workers unregistered')
  })
}

// Clear all storage
if (typeof Storage !== 'undefined') {
  console.log('🧽 Clearing localStorage and sessionStorage')
  localStorage.clear()
  sessionStorage.clear()
  console.log('✅ Storage cleared')
}

// Clear IndexedDB if present
if ('indexedDB' in window) {
  console.log('🗄️ Clearing IndexedDB')
  // This is a more aggressive approach - you might want to be more selective
  indexedDB
    .databases()
    .then((databases) => {
      databases.forEach((db) => {
        console.log('🗑️ Deleting database:', db.name)
        indexedDB.deleteDatabase(db.name)
      })
    })
    .catch((err) => console.log('IndexedDB clear error:', err))
}

console.log('🔄 Forcing hard reload in 2 seconds...')

// Force hard reload after clearing
setTimeout(() => {
  window.location.reload(true)
}, 2000)
