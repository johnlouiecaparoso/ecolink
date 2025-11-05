import { getSupabase } from '@/services/supabaseClient'
import { logUserAction, logSystemEvent } from '@/services/auditService'
import { sendWelcomeEmail } from '@/services/emailService'

export async function loginWithEmail({ email, password }) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // Log failed login attempt
    await logUserAction('LOGIN_FAILED', 'user', null, null, { email, error: error.message })
    throw new Error(error.message || 'Invalid credentials or account not registered.')
  }

  // Log successful login
  await logUserAction('LOGIN_SUCCESS', 'user', data.user?.id, null, { email })
  return data
}

export async function registerWithEmail({ name, email, password }) {
  const supabase = getSupabase()
  const redirectTo = typeof window !== 'undefined' ? window.location.origin + '/login' : undefined

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: redirectTo,
    },
  })
  if (error) {
    // Log failed registration attempt
    await logUserAction('REGISTRATION_FAILED', 'user', null, null, {
      email,
      error: error.message,
    })
    throw new Error(error.message || 'Unable to register. Please try again.')
  }

  // Log successful registration
  await logUserAction('REGISTRATION_SUCCESS', 'user', data.user?.id, null, { email, name })

  // Create profile if user was created successfully
  if (data.user) {
    try {
      await createUserProfile(data.user.id, { full_name: name })
      // Log profile creation
      await logUserAction('PROFILE_CREATED', 'profile', data.user.id, null, {
        full_name: name,
      })
    } catch (profileError) {
      console.warn('Failed to create profile:', profileError)
      // Log profile creation failure
      await logUserAction('PROFILE_CREATION_FAILED', 'profile', data.user.id, null, {
        error: profileError.message,
      })
      // Don't fail registration if profile creation fails
    }
  }

  return data
}

async function createUserProfile(userId, profileData) {
  const supabase = getSupabase()
  if (!supabase) return

  try {
    // Import and use the proper createProfile function to ensure all fields are included
    const { createProfile } = await import('@/services/profileService')

    // Get user email from auth
    const { data: authUser } = await supabase.auth.getUser()
    const userEmail = authUser?.user?.email || ''

    // Create complete profile with all fields using the proper service
    const profile = await createProfile({
      id: userId,
      full_name:
        profileData.full_name ||
        authUser?.user?.user_metadata?.name ||
        userEmail?.split('@')[0] ||
        'User',
      email: userEmail,
      role: profileData.role || 'general_user',
      kyc_level: 0,
      company: '',
      location: '',
      bio: '',
    })

    console.log('Profile created successfully during registration:', profile)

    // Send welcome email to new user
    try {
      await sendWelcomeEmail(userId)
      console.log('Welcome email sent to new user')
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail the registration if email sending fails
    }

    return profile
  } catch (error) {
    console.error('Profile creation error during registration:', error)
    throw error
  }
}

export async function getSession() {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      console.warn('Supabase client not available')
      return null
    }

    // Use getSession() which automatically handles localStorage restoration
    // Supabase's getSession() is synchronous for the stored session,
    // but we need to ensure the client is fully initialized
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session from Supabase:', error)
      return null
    }

    return data?.session || null
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function signOut() {
  const supabase = getSupabase()
  if (!supabase) return

  try {
    // Get current user before signing out (non-blocking with timeout)
    let user = null
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getUser timeout')), 2000)
      )
      const { data } = await Promise.race([
        supabase.auth.getUser(),
        timeoutPromise,
      ])
      user = data?.user
    } catch (e) {
      // Ignore getUser timeout/error - proceed with signOut anyway
      console.warn('Could not get user before signOut:', e.message)
    }

    // Sign out from Supabase (with timeout to prevent hanging)
    const signOutPromise = supabase.auth.signOut({ scope: 'global' })
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('signOut timeout')), 3000)
    )
    
    await Promise.race([signOutPromise, timeoutPromise])

    // Log successful logout (non-blocking)
    if (user?.id) {
      logUserAction('LOGOUT_SUCCESS', 'user', user.id, null, {}).catch(() => {
        // Ignore audit log errors
      })
    }
  } catch (e) {
    // Log failed logout (non-blocking)
    try {
      const { data } = await supabase.auth.getUser()
      if (data?.user?.id) {
        logUserAction('LOGOUT_FAILED', 'user', data.user.id, null, { error: e.message }).catch(() => {
          // Ignore audit log errors
        })
      }
    } catch (logError) {
      // Ignore - we're already in error handling
    }
  }

  // Clear any persisted Supabase auth tokens
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          window.localStorage.removeItem(key)
        }
      })
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}
