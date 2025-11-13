// Clear browser cache script
if ('caches' in window) {
  caches.keys().then(function (names) {
    for (let name of names) {
      caches.delete(name)
    }
  })
}

// Clear localStorage and sessionStorage
if (typeof Storage !== 'undefined') {
  localStorage.clear()
  sessionStorage.clear()
}

// Force reload
window.location.reload(true)
