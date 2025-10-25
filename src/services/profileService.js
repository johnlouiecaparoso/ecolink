import { getSupabase } from '@/services/supabaseClient'
import { TEST_ACCOUNTS } from '@/utils/testAccounts'

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
 * Check if a user ID is a test account
 */
function isTestAccount(userId) {
  return Object.values(TEST_ACCOUNTS).some((account) => account.mockSession.user.id === userId)
}

/**
 * Get test account profile data
 */
function getTestAccountProfile(userId) {
  const testAccount = Object.values(TEST_ACCOUNTS).find(
    (account) => account.mockSession.user.id === userId,
  )

  if (!testAccount) return null

  return {
    id: userId,
    full_name: testAccount.name,
    email: testAccount.email,
    role: testAccount.role,
    company:
      testAccount.role === 'admin'
        ? 'EcoLink Admin'
        : testAccount.role === 'verifier'
          ? 'EcoLink Verification'
          : 'Caraga State University',
    location:
      testAccount.role === 'admin'
        ? 'San Francisco, CA'
        : testAccount.role === 'verifier'
          ? 'New York, NY'
          : 'Butuan City',
    bio:
      testAccount.role === 'admin'
        ? 'System administrator with full access to all features.'
        : testAccount.role === 'verifier'
          ? 'Certified verifier responsible for project validation.'
          : 'Regular user exploring carbon credit marketplace.',
    kyc_level: testAccount.role === 'admin' ? 3 : testAccount.role === 'verifier' ? 2 : 1,
    avatar_url: null,
    phone: '',
    website: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId) {
  // Check if this is a test account first
  if (isTestAccount(userId)) {
    console.log('Using test account profile for user:', userId)
    return getTestAccountProfile(userId)
  }

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
  // Check if this is a test account first
  if (isTestAccount(userId)) {
    console.log('Updating test account profile for user:', userId)
    // For test accounts, we'll just return the updated profile data
    // In a real app, you might want to store this in localStorage or sessionStorage
    const currentProfile = getTestAccountProfile(userId)
    const updatedProfile = { ...currentProfile, ...updates, updated_at: new Date().toISOString() }
    return updatedProfile
  }

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
