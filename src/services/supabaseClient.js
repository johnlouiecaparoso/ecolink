import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/utils/env'

let supabase

export function initSupabase() {
  try {
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
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

    // Add error handler for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log('Auth state changed:', event)
      }
    })

    return supabase
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    // Return a mock client to prevent app crash
    return null
  }
}

export function getSupabase() {
  if (!supabase) {
    return initSupabase()
  }
  return supabase
}
