// Debug Loading Issue - Run this in browser console
// This will help identify what's causing the pages to get stuck loading

console.log('🔍 Debugging EcoLink Loading Issue...')

// 1. Check User Store State
const checkUserStore = () => {
  try {
    const userStore = window.useUserStore?.() || null
    console.log('📊 User Store State:', {
      loading: userStore?.loading,
      session: userStore?.session ? 'exists' : 'null',
      profile: userStore?.profile ? 'exists' : 'null',
      role: userStore?.role,
      isAuthenticated: userStore?.isAuthenticated,
    })
    return userStore
  } catch (error) {
    console.error('❌ Error accessing user store:', error)
    return null
  }
}

// 2. Check Supabase Connection
const checkSupabase = async () => {
  try {
    const supabase = window.getSupabase?.()
    if (!supabase) {
      console.log('❌ Supabase client not available')
      return false
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    console.log('🔐 Supabase Session:', session ? 'exists' : 'null')

    if (session?.user?.id) {
      console.log('👤 User ID:', session.user.id)

      // Test profile fetch
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.log('❌ Profile fetch error:', error.message)
          console.log('💡 This is likely the cause of the loading issue!')

          // Check if profiles table exists and has required columns
          const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'profiles' })
            .catch(() => null)

          if (columnsError) {
            console.log('📋 Cannot check table structure, but error suggests schema issue')
          }
        } else {
          console.log('✅ Profile loaded successfully:', data)
        }
      } catch (profileError) {
        console.log('❌ Profile fetch failed:', profileError.message)
      }
    }

    return true
  } catch (error) {
    console.error('❌ Supabase check failed:', error)
    return false
  }
}

// 3. Check Router State
const checkRouter = () => {
  try {
    const router = window.$router || window.useRouter?.()
    console.log('🧭 Current Route:', window.location.pathname)
    console.log('🔄 Router Ready:', !!router)
  } catch (error) {
    console.error('❌ Router check failed:', error)
  }
}

// 4. Force Clear Loading State
const forceFixLoading = () => {
  console.log('🔧 Attempting to fix loading state...')

  try {
    const userStore = window.useUserStore?.()
    if (userStore) {
      userStore.loading = false
      console.log('✅ Set user store loading to false')
    }
  } catch (error) {
    console.error('❌ Could not fix loading state:', error)
  }
}

// 5. Run Full Diagnostic
const runDiagnostic = async () => {
  console.log('🚀 Starting full diagnostic...')

  const userStore = checkUserStore()
  checkRouter()
  await checkSupabase()

  if (userStore?.loading) {
    console.log('⚠️ User store is stuck in loading state!')
    console.log('💡 Recommendation: Run forceFixLoading() or refresh the page')
  }

  console.log('✅ Diagnostic complete!')
}

// 6. Quick Fix Function
const quickFix = async () => {
  console.log('🔧 Applying quick fix...')

  // Force clear loading
  forceFixLoading()

  // Clear any cached data
  if (typeof localStorage !== 'undefined') {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key)
        console.log('🗑️ Cleared:', key)
      }
    })
  }

  // Force reload after 2 seconds
  setTimeout(() => {
    console.log('🔄 Reloading page...')
    window.location.reload()
  }, 2000)
}

// Make functions available globally
window.debugEcoLink = {
  checkUserStore,
  checkSupabase,
  checkRouter,
  forceFixLoading,
  runDiagnostic,
  quickFix,
}

console.log('🎯 Debug tools loaded! Available commands:')
console.log('• debugEcoLink.runDiagnostic() - Full diagnostic')
console.log('• debugEcoLink.quickFix() - Apply quick fix')
console.log('• debugEcoLink.forceFixLoading() - Force clear loading state')

// Auto-run diagnostic
runDiagnostic()
