// Force refresh certificate service - Run this in browser console
console.log('🔄 Force refreshing certificate service...')

// Clear module cache
if (typeof window !== 'undefined') {
  // Clear any cached modules
  delete window.__VUE_APP__

  // Force reload the page
  console.log('🔄 Reloading page to clear cache...')
  window.location.reload(true)
} else {
  console.log('❌ Not in browser environment')
}









