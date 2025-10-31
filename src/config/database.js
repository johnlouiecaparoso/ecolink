/**
 * Database configuration
 * Production builds MUST use database (USE_DATABASE = true)
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'

// In production, database MUST be enabled
// In development, it can be disabled for testing with sample data
export const USE_DATABASE = isProduction ? true : true // Always true, but can change in dev

// Validate production configuration
if (isProduction && !USE_DATABASE) {
  console.error('⚠️ ERROR: Database must be enabled in production!')
  throw new Error('Database must be enabled in production mode')
}

// Warn if database disabled in production build
if (!isDevelopment && !USE_DATABASE) {
  console.warn('⚠️ WARNING: Database is disabled in production build!')
}
