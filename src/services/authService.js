import { getSupabase } from '@/services/supabaseClient'

export async function loginWithEmail({ email, password }) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(error.message || 'Invalid credentials or account not registered.')
  }
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
    throw new Error(error.message || 'Unable to register. Please try again.')
  }

  // Create profile if user was created successfully
  if (data.user) {
    try {
      await createUserProfile(data.user.id, { full_name: name })
    } catch (profileError) {
      console.warn('Failed to create profile:', profileError)
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
      role: 'user',
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
  try {
    await supabase.auth.signOut({ scope: 'global' })
  } catch (e) {
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
