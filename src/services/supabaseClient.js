import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/utils/env'

// Singleton pattern to prevent multiple instances
let supabase = null
let isInitializing = false

export async function initSupabase() {
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

    // DO NOT clear localStorage here - Supabase manages its own session storage
    // Clearing it would delete valid auth tokens on every page refresh!
    // Supabase's createClient will automatically handle session persistence

    // Check for session in old custom key format (backward compatibility)
    const oldSessionKey = 'ecolink-supabase-auth-token'
    let existingSession = null

    try {
      const oldSessionData = localStorage.getItem(oldSessionKey)
      if (oldSessionData) {
        try {
          existingSession = JSON.parse(oldSessionData)
          console.log('📦 Found session in old format, will migrate to default format')
        } catch (e) {
          console.warn('Could not parse old session data:', e)
        }
      }
    } catch (e) {
      // Ignore localStorage access errors
    }

    supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        // Use default Supabase storage key format: sb-<project-ref>-auth-token
        // This is more reliable and standard
      },
    })

    // If we found a session in the old format, restore it to the new format
    if (existingSession && existingSession.access_token) {
      try {
        // Set the session using Supabase's method
        const { data, error } = await supabase.auth.setSession({
          access_token: existingSession.access_token,
          refresh_token: existingSession.refresh_token,
        })

        if (!error && data.session) {
          console.log('✅ Successfully migrated session from old format')
          // Clear old session key
          localStorage.removeItem(oldSessionKey)
        } else {
          console.warn('⚠️ Could not restore session from old format:', error)
        }
      } catch (migrationError) {
        console.warn('Error migrating session:', migrationError)
      }
    }

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
  if (!supabase && !isInitializing) {
    // Start initialization but don't block
    initSupabase().catch((err) => {
      console.error('Error initializing Supabase:', err)
    })
  }
  // Return existing instance (might be null if still initializing)
  // Callers should check for null and retry if needed
  return supabase
}

// Async version for cases where you need to wait for initialization
export async function getSupabaseAsync() {
  if (!supabase) {
    return await initSupabase()
  }
  return supabase
}

// Reset function for testing
export function resetSupabase() {
  supabase = null
  isInitializing = false
}
