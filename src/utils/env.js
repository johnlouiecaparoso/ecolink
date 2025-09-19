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
