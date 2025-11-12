/**
 * Authentication Debug Test
 * Run this in your browser console to debug authentication issues
 */

console.log('🔐 Authentication Debug Test\n')

async function debugAuth() {
  try {
    // Test 1: Check Supabase session directly
    console.log('1️⃣ Direct Supabase Session Check:')
    const { getSupabase } = await import('./src/services/supabaseClient.js')
    const supabase = getSupabase()

    if (supabase) {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.log('   ❌ Supabase error:', error.message)
      } else if (session) {
        console.log('   ✅ Supabase session exists')
        console.log('   User:', session.user.email)
        console.log('   Expires:', new Date(session.expires_at * 1000).toLocaleString())
        console.log('   Access Token:', session.access_token ? 'Present' : 'Missing')
        console.log('   Refresh Token:', session.refresh_token ? 'Present' : 'Missing')
      } else {
        console.log('   ❌ No Supabase session')
      }
    } else {
      console.log('   ❌ Supabase client not available')
    }

    // Test 2: Check User Store
    console.log('\n2️⃣ User Store Check:')
    const { useUserStore } = await import('./src/store/userStore.js')
    const userStore = useUserStore()

    console.log('   Loading:', userStore.loading)
    console.log('   Authenticated:', userStore.isAuthenticated)
    console.log('   Has Session:', !!userStore.session)
    console.log('   User Email:', userStore.session?.user?.email || 'None')
    console.log('   Role:', userStore.role)

    // Test 3: Check localStorage
    console.log('\n3️⃣ LocalStorage Check:')
    const authKeys = Object.keys(localStorage).filter(
      (key) => key.includes('supabase') || key.includes('auth') || key.includes('sb-'),
    )

    if (authKeys.length > 0) {
      console.log('   ✅ Auth tokens found:')
      authKeys.forEach((key) => {
        const value = localStorage.getItem(key)
        console.log(`   • ${key}: ${value ? 'Present' : 'Empty'}`)
      })
    } else {
      console.log('   ❌ No auth tokens in localStorage')
    }

    // Test 4: Test session fetch
    console.log('\n4️⃣ Testing Session Fetch:')
    try {
      await userStore.fetchSession()
      console.log('   ✅ Session fetch completed')
      console.log('   Final state:', {
        loading: userStore.loading,
        authenticated: userStore.isAuthenticated,
        hasSession: !!userStore.session,
        userEmail: userStore.session?.user?.email,
      })
    } catch (error) {
      console.log('   ❌ Session fetch failed:', error.message)
    }

    // Test 5: Check current route
    console.log('\n5️⃣ Current Route Check:')
    const currentPath = window.location.pathname
    const currentHash = window.location.hash
    console.log('   Path:', currentPath)
    console.log('   Hash:', currentHash)
    console.log('   Full URL:', window.location.href)

    // Summary
    console.log('\n📋 Debug Summary:')
    console.log('================')

    const hasSupabaseSession = supabase && (await supabase.auth.getSession()).data.session
    const hasUserStoreSession = userStore.isAuthenticated

    if (hasSupabaseSession && hasUserStoreSession) {
      console.log('✅ Both Supabase and User Store have valid sessions')
      console.log('✅ Authentication should persist on refresh')
    } else if (hasSupabaseSession && !hasUserStoreSession) {
      console.log('⚠️ Supabase has session but User Store does not')
      console.log('⚠️ This might cause redirect issues')
    } else if (!hasSupabaseSession && hasUserStoreSession) {
      console.log('⚠️ User Store has session but Supabase does not')
      console.log('⚠️ This is unusual and might cause issues')
    } else {
      console.log('❌ No valid sessions found')
      console.log("ℹ️ This is normal if you're not logged in")
    }
  } catch (error) {
    console.error('❌ Debug test failed:', error)
  }
}

// Export for manual use
window.debugAuth = debugAuth

// Auto-run
debugAuth()

























