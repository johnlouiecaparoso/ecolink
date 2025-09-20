// Lightweight environment variable helper for Vite
// Usage: getEnv('VITE_API_BASE_URL')

export function getEnv(name, options = {}) {
  const { optional = false, fallback } = options
  const value = import.meta.env?.[name]
  if ((value === undefined || value === '') && !optional && fallback === undefined) {
    console.warn(`[env] Missing required env var ${name}. Set it in your .env file`)
  }
  return value ?? fallback
}

export function requireEnv(name) {
  const value = import.meta.env?.[name]
  if (value === undefined || value === '') {
    throw new Error(`[env] Required env var ${name} is not set. Add it to your .env`)
  }
  return value
}

// Utility function to clear all auth data
export function clearAuthData() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          window.localStorage.removeItem(key)
          console.log('Cleared auth key:', key)
        }
      })
      console.log('All auth data cleared')
    } catch (e) {
      console.error('Error clearing auth data:', e)
    }
  }
}
