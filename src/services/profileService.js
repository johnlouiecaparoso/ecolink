import { getSupabase } from '@/services/supabaseClient'

export async function createProfile(profileData) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase.from('profiles').insert([profileData]).select().single()

  if (error) {
    throw new Error(error.message || 'Failed to create profile')
  }
  return data
}

export async function getProfile(userId) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  // First check if profile exists
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId)

  if (error) {
    throw new Error(error.message || 'Failed to fetch profile')
  }

  // If no profile exists, create one
  if (!data || data.length === 0) {
    console.log('No profile found, creating one for user:', userId)
    return await createProfile({
      id: userId,
      full_name: 'User',
      role: 'user',
      kyc_level: 0,
    })
  }

  // If multiple profiles exist, return the first one
  if (data.length > 1) {
    console.warn('Multiple profiles found for user:', userId, 'returning first one')
  }

  return data[0]
}

export async function updateProfile(userId, updates) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to update profile')
  }
  return data
}
