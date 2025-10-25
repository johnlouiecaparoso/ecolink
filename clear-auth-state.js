// Nuclear option: Clear all authentication state
// Run this in your browser console while on the project page

console.log('🧹 Clearing all authentication state...')

// Clear localStorage
Object.keys(localStorage).forEach((key) => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('user')) {
    console.log('Removing:', key)
    localStorage.removeItem(key)
  }
})

// Clear sessionStorage
Object.keys(sessionStorage).forEach((key) => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('user')) {
    console.log('Removing:', key)
    sessionStorage.removeItem(key)
  }
})

// Clear cookies
document.cookie.split(';').forEach((cookie) => {
  const eqPos = cookie.indexOf('=')
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
  if (name.includes('supabase') || name.includes('auth')) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    console.log('Cleared cookie:', name)
  }
})

console.log('✅ All authentication state cleared. Please refresh the page and log in again.')









