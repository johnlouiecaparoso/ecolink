// Comprehensive Authentication Fix
// Run this in your browser console to fix the authentication issue

console.log('🔧 Starting comprehensive authentication fix...')

// Step 1: Clear all authentication state
console.log('Step 1: Clearing all auth state...')
Object.keys(localStorage).forEach((key) => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('user')) {
    localStorage.removeItem(key)
    console.log('Cleared localStorage:', key)
  }
})

Object.keys(sessionStorage).forEach((key) => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('user')) {
    sessionStorage.removeItem(key)
    console.log('Cleared sessionStorage:', key)
  }
})

// Step 2: Test Supabase connection
console.log('Step 2: Testing Supabase connection...')
try {
  const { getSupabase } = await import('/src/services/supabaseClient.js')
  const supabase = getSupabase()

  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  console.log('✅ Supabase client loaded successfully')

  // Step 3: Test authentication methods
  console.log('Step 3: Testing authentication methods...')

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  console.log('getUser() result:', { user, userError })

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  console.log('getSession() result:', { session, sessionError })

  if (user) {
    console.log('✅ Real user found:', user.id, user.email)
  } else if (session?.user) {
    console.log('✅ Real session found:', session.user.id, session.user.email)
  } else {
    console.log('❌ No authenticated user found - you need to log in again')
  }
} catch (error) {
  console.error('❌ Error testing Supabase:', error)
}

console.log('🔧 Authentication fix complete. Please refresh the page and log in again.')









