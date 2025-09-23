import { getSupabase } from '@/services/supabaseClient'
import { logUserAction, logSystemEvent } from '@/services/auditService'

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
    await logUserAction('REGISTRATION_FAILED', 'user', null, null, { email, error: error.message })
    throw new Error(error.message || 'Unable to register. Please try again.')
  }

  // Log successful registration
  await logUserAction('REGISTRATION_SUCCESS', 'user', data.user?.id, null, { email, name })

  // Create profile if user was created successfully
  if (data.user) {
    try {
      await createUserProfile(data.user.id, { full_name: name })
      // Log profile creation
      await logUserAction('PROFILE_CREATED', 'profile', data.user.id, null, { full_name: name })
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

  const { error } = await supabase.from('profiles').insert([
    {
      id: userId,
      full_name: profileData.full_name,
      role: profileData.role || 'user',
      kyc_level: 0,
    },
  ])

  if (error) {
    console.error('Profile creation error:', error)
  }
}

export async function getSession() {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      console.warn('Supabase client not available')
      return null
    }
    const { data } = await supabase.auth.getSession()
    return data.session || null
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function signOut() {
  const supabase = getSupabase()

  // Get current user before signing out
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    await supabase.auth.signOut({ scope: 'global' })
    // Log successful logout
    await logUserAction('LOGOUT_SUCCESS', 'user', user?.id, null, {})
  } catch (e) {
    // Log failed logout
    await logUserAction('LOGOUT_FAILED', 'user', user?.id, null, { error: e.message })
    // ignore but continue clearing local state
  }
  try {
    // Clear any persisted Supabase auth tokens to avoid stale sessions after refresh
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          window.localStorage.removeItem(key)
        }
      })
    }
  } catch (e) {}
}
