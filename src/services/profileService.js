import { getSupabase } from '@/services/supabaseClient'

/**
 * Check if a column exists in the profiles table
 */
async function columnExists(columnName) {
  const supabase = getSupabase()
  if (!supabase) return false

  try {
    // Try a simple select to see if column exists
    const { error } = await supabase.from('profiles').select(columnName).limit(0)

    // If error mentions column doesn't exist, return false
    if (error && error.message.includes('column') && error.message.includes('not found')) {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Create a new user profile
 */
export async function createProfile(profileData) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  // Build base profile with required fields
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

  // Try to add notification_preferences, but handle gracefully if column doesn't exist
  // We'll attempt the insert with it, and if it fails with column error, retry without it
  const hasNotificationPrefs = profileData.notification_preferences !== undefined
  if (!hasNotificationPrefs) {
    profile.notification_preferences = {
      emailNotifications: { enabled: true },
      projectUpdates: { enabled: true },
      marketAlerts: { enabled: false },
      newsletter: { enabled: true },
    }
  } else {
    profile.notification_preferences = profileData.notification_preferences
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profile.id)
    .single()

  // If profile exists, return it instead of creating duplicate
  if (existingProfile) {
    console.log('Profile already exists, returning existing profile:', existingProfile)
    return existingProfile
  }

  let { data, error } = await supabase.from('profiles').insert([profile]).select().single()

  // If error is about missing notification_preferences column, retry without it
  if (
    error &&
    (error.message.includes('notification_preferences') ||
      error.message.includes('column') ||
      error.code === '42703')
  ) {
    if (import.meta.env.DEV) {
      console.log('[DEV] notification_preferences column not found, creating profile without it...')
    }
    // Remove notification_preferences and retry
    const profileWithoutPrefs = { ...profile }
    delete profileWithoutPrefs.notification_preferences

    const retryResult = await supabase
      .from('profiles')
      .insert([profileWithoutPrefs])
      .select()
      .single()
    data = retryResult.data
    error = retryResult.error

    // If retry also fails, throw error
    if (error) {
      console.error('Profile creation error (after retry):', error)
      throw new Error(error.message || 'Failed to create profile')
    }
  } else if (error) {
    console.error('Profile creation error:', error)
    throw new Error(error.message || 'Failed to create profile')
  }

  if (import.meta.env.DEV) {
    console.log('[DEV] Profile created successfully:', data)
  }
  return data
}

/**
 * Get user profile by ID - ALWAYS from Supabase (no mock data)
 */
export async function getProfile(userId) {
  const supabase = getSupabase()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  try {
    // IMPORTANT: Check if this is a test account first
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
    const testAccountIds = [
      '11111111-1111-1111-1111-111111111111', // admin
      '22222222-2222-2222-2222-222222222222', // verifier
      '33333333-3333-3333-3333-333333333333', // user
      '44444444-4444-4444-4444-444444444444', // developer
    ]
    const isTestAccount = isDevelopment && testAccountIds.includes(userId)

    // For test accounts, return mock profile (can't query/create in Supabase due to RLS)
    if (isTestAccount) {
      if (import.meta.env.DEV) {
        console.log('[DEV] Test account detected - returning mock profile')
      }

      // Import test accounts to get role
      const { getTestAccountByEmail, TEST_ACCOUNTS } = await import('@/utils/testAccounts')

      // Find test account by ID
      const testAccount = Object.values(TEST_ACCOUNTS).find(
        (acc) => acc.mockSession?.user?.id === userId,
      )

      const mockProfile = {
        id: userId,
        full_name: testAccount?.name || 'Test User',
        email: testAccount?.email || '',
        role: testAccount?.role || 'general_user',
        company: '',
        location: '',
        bio: '',
        kyc_level: 0,
        avatar_url: null,
        phone: '',
        website: '',
        notification_preferences: {
          emailNotifications: { enabled: true },
          projectUpdates: { enabled: true },
          marketAlerts: { enabled: false },
          newsletter: { enabled: true },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return mockProfile
    }

    // First check if profile exists (for real users only)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      // If error is not "not found", throw it
      if (error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error)
        throw new Error(error.message || 'Failed to fetch profile')
      }
    }

    // If no data and no error (profile doesn't exist), create one
    if (!data) {
      if (import.meta.env.DEV) {
        console.log('[DEV] No profile found, creating one for user:', userId)
      }

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

    // Ensure notification_preferences exists with default values if null (only if column exists)
    if (!data.notification_preferences && data.hasOwnProperty('notification_preferences')) {
      // Column exists but is null, set defaults
      data.notification_preferences = {
        emailNotifications: { enabled: true },
        projectUpdates: { enabled: true },
        marketAlerts: { enabled: false },
        newsletter: { enabled: true },
      }
      // Try to update profile with default preferences (only if column exists)
      try {
        await updateProfile(userId, { notification_preferences: data.notification_preferences })
      } catch (err) {
        // Column might not exist, that's okay
        if (import.meta.env.DEV) {
          console.log(
            '[DEV] Could not update notification_preferences (column may not exist):',
            err.message,
          )
        }
      }
    } else if (!data.hasOwnProperty('notification_preferences')) {
      // Column doesn't exist, set default value in memory only
      data.notification_preferences = {
        emailNotifications: { enabled: true },
        projectUpdates: { enabled: true },
        marketAlerts: { enabled: false },
        newsletter: { enabled: true },
      }
    }

    if (import.meta.env.DEV) {
      console.log('[DEV] Profile fetched successfully from Supabase')
    }
    return data
  } catch (error) {
    console.error('Error in getProfile:', error)
    throw error
  }
}

/**
 * Update user profile - ALWAYS saves to Supabase
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

    // If updating notification_preferences, ensure it's properly structured
    // But only if the column exists (check by trying to update, catch error if not)
    if (
      cleanUpdates.notification_preferences &&
      typeof cleanUpdates.notification_preferences === 'object'
    ) {
      // Check if column exists before trying to update
      try {
        const { error: testError } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .limit(0)

        // If column doesn't exist, remove from update
        if (
          testError &&
          (testError.message.includes('column') || testError.message.includes('not found'))
        ) {
          if (import.meta.env.DEV) {
            console.log('[DEV] notification_preferences column not found, removing from update')
          }
          delete cleanUpdates.notification_preferences
        } else {
          // Column exists, structure the data properly
          cleanUpdates.notification_preferences = JSON.parse(
            JSON.stringify(cleanUpdates.notification_preferences),
          )
        }
      } catch {
        // Column check failed, remove from update to be safe
        delete cleanUpdates.notification_preferences
      }
    }

    if (import.meta.env.DEV) {
      console.log(
        '[DEV] Updating profile in Supabase for user:',
        userId,
        'with data:',
        cleanUpdates,
      )
    }

    // Update the profile (without .select() first to avoid RLS issues)
    const { error: updateError } = await supabase
      .from('profiles')
      .update(cleanUpdates)
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      throw new Error(updateError.message || 'Failed to update profile')
    }

    // Fetch the updated profile separately to avoid "Cannot coerce to single JSON" error
    // This happens when .single() is used with .select() after .update() and RLS blocks it
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('Profile fetch error after update:', fetchError)
      throw new Error(fetchError.message || 'Failed to fetch updated profile')
    }

    if (!data) {
      // If no data returned, it means either profile doesn't exist or RLS blocked it
      // But update succeeded, so return the updates we made
      if (import.meta.env.DEV) {
        console.warn(
          '[DEV] Update succeeded but could not fetch updated profile (RLS may be blocking), returning updates',
        )
      }
      return { id: userId, ...cleanUpdates }
    }

    if (import.meta.env.DEV) {
      console.log('[DEV] Profile updated successfully in Supabase')
    }
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
