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

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (error) {
    throw new Error(error.message || 'Failed to fetch profile')
  }
  return data
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
