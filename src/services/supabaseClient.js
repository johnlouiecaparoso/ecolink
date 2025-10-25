import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/utils/env'

// Singleton pattern to prevent multiple instances
let supabase = null
let isInitializing = false

export function initSupabase() {
  // Return existing instance if already initialized
  if (supabase) {
    return supabase
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.warn('Supabase client initialization already in progress')
    return null
  }

  try {
    isInitializing = true
    const url = requireEnv('VITE_SUPABASE_URL')
    const key = requireEnv('VITE_SUPABASE_ANON_KEY')

    // Clear any stale tokens before initializing
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        Object.keys(window.localStorage).forEach((key) => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            window.localStorage.removeItem(key)
          }
        })
      } catch {
        // Ignore localStorage errors
      }
    }

    supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'ecolink-supabase-auth-token',
      },
    })

    // Add error handler for auth state changes
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log('Auth state changed:', event)
      }
    })

    console.log('✅ Supabase client initialized successfully')
    return supabase
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    supabase = null
    return null
  } finally {
    isInitializing = false
  }
}

export function getSupabase() {
  if (!supabase) {
    return initSupabase()
  }
  return supabase
}

// Reset function for testing
export function resetSupabase() {
  supabase = null
  isInitializing = false
}
