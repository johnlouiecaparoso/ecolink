// NUCLEAR OPTION: Force Real Authentication
// Run this in your browser console to completely reset authentication

console.log('🚀 NUCLEAR AUTHENTICATION FIX - Starting...')

// Step 1: Clear EVERYTHING
console.log('Step 1: Clearing all storage...')
localStorage.clear()
sessionStorage.clear()

// Clear all cookies
document.cookie.split(';').forEach((cookie) => {
  const eqPos = cookie.indexOf('=')
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
})

console.log('✅ All storage cleared')

// Step 2: Force page reload to reset all state
console.log('Step 2: Reloading page to reset all state...')
window.location.reload()









