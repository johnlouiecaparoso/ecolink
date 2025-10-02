import { getSupabase } from '@/services/supabaseClient'

/**
 * Create a new user profile
 */
export async function createProfile(profileData) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  // Ensure required fields are present
  const profile = {
    id: profileData.id,
    full_name: profileData.full_name || 'User',
    email: profileData.email || '',
    company: profileData.company || '',
    location: profileData.location || '',
    bio: profileData.bio || '',
    role: profileData.role || 'general_user',
    kyc_level: profileData.kyc_level || 0,
    avatar_url: profileData.avatar_url || null,
    phone: profileData.phone || '',
    website: profileData.website || '',
  }

  const { data, error } = await supabase.from('profiles').insert([profile]).select().single()

  if (error) {
    console.error('Profile creation error:', error)
    throw new Error(error.message || 'Failed to create profile')
  }

  console.log('Profile created successfully:', data)
  return data
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  try {
    // First check if profile exists
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

    if (error) {
      // If profile doesn't exist (404), create one
      if (error.code === 'PGRST116') {
        console.log('No profile found, creating one for user:', userId)

        // Get user info from auth to populate initial profile
        const { data: authUser } = await supabase.auth.getUser()
        const userEmail = authUser?.user?.email || ''
        const userName =
          authUser?.user?.user_metadata?.name || authUser?.user?.email?.split('@')[0] || 'User'

        return await createProfile({
          id: userId,
          full_name: userName,
          email: userEmail,
          role: 'general_user',
          kyc_level: 0,
        })
      }

      console.error('Profile fetch error:', error)
      throw new Error(error.message || 'Failed to fetch profile')
    }

    console.log('Profile fetched successfully:', data)
    return data
  } catch (error) {
    console.error('Error in getProfile:', error)
    throw error
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  try {
    // Filter out undefined values and prepare update object
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value
      }
      return acc
    }, {})

    console.log('Updating profile for user:', userId, 'with data:', cleanUpdates)

    const { data, error } = await supabase
      .from('profiles')
      .update(cleanUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      throw new Error(error.message || 'Failed to update profile')
    }

    console.log('Profile updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error in updateProfile:', error)
    throw error
  }
}

/**
 * Get user initials from full name
 */
export function getUserInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'U'

  return fullName
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Validate profile data
 */
export function validateProfileData(profileData) {
  const errors = {}

  if (!profileData.full_name || profileData.full_name.trim().length < 2) {
    errors.full_name = 'Full name must be at least 2 characters'
  }

  if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (profileData.website && profileData.website.trim()) {
    try {
      new URL(profileData.website)
    } catch {
      errors.website = 'Please enter a valid website URL'
    }
  }

  if (profileData.bio && profileData.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
