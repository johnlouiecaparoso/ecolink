/**
 * Authentication Persistence Test
 * Run this in your browser console to test if authentication persists on refresh
 */

console.log('🔐 Testing Authentication Persistence...\n')

async function testAuthPersistence() {
  try {
    // Test 1: Check current authentication state
    console.log('1️⃣ Current Authentication State:')
    const { useUserStore } = await import('./src/store/userStore.js')
    const userStore = useUserStore()

    console.log(`   Loading: ${userStore.loading}`)
    console.log(`   Authenticated: ${userStore.isAuthenticated}`)
    console.log(`   User Email: ${userStore.session?.user?.email || 'None'}`)
    console.log(
      `   Session Expires: ${userStore.session?.expires_at ? new Date(userStore.session.expires_at * 1000).toLocaleString() : 'None'}`,
    )

    // Test 2: Check Supabase session
    console.log('\n2️⃣ Supabase Session Check:')
    const { getSupabase } = await import('./src/services/supabaseClient.js')
    const supabase = getSupabase()

    if (supabase) {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        console.log('   ❌ Supabase session error:', error.message)
      } else if (session) {
        console.log('   ✅ Supabase session exists')
        console.log(`   User: ${session.user.email}`)
        console.log(`   Expires: ${new Date(session.expires_at * 1000).toLocaleString()}`)
      } else {
        console.log('   ℹ️ No Supabase session')
      }
    } else {
      console.log('   ❌ Supabase client not available')
    }

    // Test 3: Check localStorage for auth tokens
    console.log('\n3️⃣ LocalStorage Check:')
    const authKeys = Object.keys(localStorage).filter(
      (key) => key.includes('supabase') || key.includes('auth') || key.includes('sb-'),
    )

    if (authKeys.length > 0) {
      console.log('   ✅ Auth tokens found in localStorage:')
      authKeys.forEach((key) => {
        const value = localStorage.getItem(key)
        console.log(`   • ${key}: ${value ? value.substring(0, 50) + '...' : 'empty'}`)
      })
    } else {
      console.log('   ⚠️ No auth tokens found in localStorage')
    }

    // Test 4: Simulate page refresh scenario
    console.log('\n4️⃣ Page Refresh Simulation:')
    console.log('   To test persistence:')
    console.log('   1. Refresh this page (F5 or Ctrl+R)')
    console.log('   2. Check if you stay logged in')
    console.log('   3. Run this test again after refresh')

    // Summary
    console.log('\n📋 Test Summary:')
    console.log('================')

    if (userStore.isAuthenticated && userStore.session) {
      console.log('✅ Authentication is working correctly')
      console.log('✅ Session should persist on page refresh')
    } else {
      console.log('⚠️ No active authentication found')
      console.log("ℹ️ This is normal if you're not logged in")
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Export for manual use
window.testAuthPersistence = testAuthPersistence

// Auto-run
testAuthPersistence()

















