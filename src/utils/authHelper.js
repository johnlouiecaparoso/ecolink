/**
 * Authentication helper utilities
 */

import { getSupabase } from '@/services/supabaseClient'

/**
 * Get the current authenticated user ID
 * Tries multiple methods to get the user ID, including user store
 * @returns {Promise<string|null>} User ID or null if not authenticated
 */
export async function getCurrentUserId() {
  try {
    // Method 1: Try to get from user store first (most reliable)
    try {
      // Try to access the user store directly
      const { useUserStore } = await import('@/store/userStore')
      const userStore = useUserStore()
      if (userStore.session?.user?.id) {
        console.log('Got user ID from user store:', userStore.session.user.id)
        return userStore.session.user.id
      }
    } catch (e) {
      console.log('Could not access user store:', e.message)
    }

    const supabase = getSupabase()
    if (!supabase) {
      console.warn('Supabase client not available')
      return null
    }

    // Method 2: Try to get user directly from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.id) {
      console.log('Got user ID from Supabase getUser:', user.id)
      return user.id
    }

    // Method 3: Try to get user from session
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session?.user?.id) {
      console.log('Got user ID from Supabase getSession:', sessionData.session.user.id)
      return sessionData.session.user.id
    }

    // Method 4: Check if there's a stored session in localStorage
    if (typeof window !== 'undefined') {
      try {
        const storage = window.localStorage
        if (storage) {
          const authData = storage.getItem('sb-fmngptolarydbgrtltnd-auth-token')
          if (authData) {
            try {
              const parsed = JSON.parse(authData)
              if (parsed?.currentSession?.user?.id) {
                console.log('Got user ID from localStorage:', parsed.currentSession.user.id)
                return parsed.currentSession.user.id
              }
            } catch (parseError) {
              console.warn('Failed to parse stored Supabase auth token:', parseError)
            }
          }
        }
      } catch (storageError) {
        console.debug('LocalStorage not accessible while retrieving user ID:', storageError.message)
      }
    }

    console.log('No user ID found from any method')
    return null
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if user is authenticated
 */
export async function isAuthenticated() {
  const userId = await getCurrentUserId()
  return !!userId
}

/**
 * Get current user with fallback methods
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser() {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return null
    }

    // Try to get user directly
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      return user
    }

    // Try to get user from session
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session?.user) {
      return sessionData.session.user
    }

    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
