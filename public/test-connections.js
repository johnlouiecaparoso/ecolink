/**
 * Browser-based Dashboard Connection Test
 * Run this in the browser console to test dashboard connections
 */

console.log('🔍 Starting Dashboard Connection Analysis...\n')

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables...')
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

let envStatus = '✅ All required environment variables found'
requiredEnvVars.forEach((varName) => {
  const value = import.meta.env[varName]
  if (!value || value === 'your_supabase_project_url' || value === 'your_supabase_anon_key') {
    envStatus = '❌ Missing or invalid environment variables'
    console.log(`   ❌ ${varName}: ${value || 'NOT SET'}`)
  } else {
    console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`)
  }
})
console.log(`   ${envStatus}\n`)

// Test 2: Supabase Connection
console.log('2️⃣ Testing Supabase Connection...')
async function testSupabaseConnection() {
  try {
    // Import Supabase client dynamically
    const { getSupabase } = await import('./src/services/supabaseClient.js')
    const supabase = getSupabase()

    if (!supabase) {
      console.log('   ❌ Supabase client not initialized')
      return false
    }

    console.log('   ✅ Supabase client initialized')

    // Test auth session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    if (sessionError) {
      console.log('   ⚠️ Session error:', sessionError.message)
    } else if (session) {
      console.log('   ✅ User session active:', session.user.email)
    } else {
      console.log('   ℹ️ No active session (user not logged in)')
    }

    // Test database connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      console.log('   ❌ Database connection failed:', error.message)
      return false
    }

    console.log('   ✅ Database connection successful')
    return true
  } catch (error) {
    console.log('   ❌ Supabase test failed:', error.message)
    return false
  }
}

// Test 3: Project Service
console.log('3️⃣ Testing Project Service...')
async function testProjectService() {
  try {
    const { projectService } = await import('./src/services/projectService.js')

    // Test getting project stats
    const stats = await projectService.getProjectStats()
    console.log('   ✅ Project service working')
    console.log(`   📊 Project stats: ${stats.total} total projects`)
    return true
  } catch (error) {
    console.log('   ❌ Project service failed:', error.message)
    return false
  }
}

// Test 4: Wallet Service
console.log('4️⃣ Testing Wallet Service...')
async function testWalletService() {
  try {
    const { getWalletBalance } = await import('./src/services/walletService.js')

    const wallet = await getWalletBalance()
    console.log('   ✅ Wallet service working')
    console.log(`   💰 Wallet balance: $${wallet.current_balance}`)
    return true
  } catch (error) {
    console.log('   ❌ Wallet service failed:', error.message)
    return false
  }
}

// Test 5: Marketplace Service
console.log('5️⃣ Testing Marketplace Service...')
async function testMarketplaceService() {
  try {
    const { getMarketplaceListings } = await import('./src/services/marketplaceService.js')

    const listings = await getMarketplaceListings()
    console.log('   ✅ Marketplace service working')
    console.log(`   🛒 Found ${listings.length} marketplace listings`)
    return true
  } catch (error) {
    console.log('   ❌ Marketplace service failed:', error.message)
    return false
  }
}

// Test 6: User Store
console.log('6️⃣ Testing User Store...')
async function testUserStore() {
  try {
    const { useUserStore } = await import('./src/store/userStore.js')
    const userStore = useUserStore()

    console.log('   ✅ User store initialized')
    console.log(`   👤 User authenticated: ${userStore.isAuthenticated}`)
    console.log(`   🎭 User role: ${userStore.role || 'none'}`)
    return true
  } catch (error) {
    console.log('   ❌ User store failed:', error.message)
    return false
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    supabase: await testSupabaseConnection(),
    projects: await testProjectService(),
    wallet: await testWalletService(),
    marketplace: await testMarketplaceService(),
    userStore: await testUserStore(),
  }

  console.log('\n📋 Connection Test Summary:')
  console.log('========================')

  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(Boolean).length

  Object.entries(results).forEach(([service, passed]) => {
    const status = passed ? '✅' : '❌'
    console.log(`${status} ${service}: ${passed ? 'Connected' : 'Failed'}`)
  })

  console.log(`\n🎯 Overall Status: ${passedTests}/${totalTests} services connected`)

  if (passedTests === totalTests) {
    console.log('🎉 All dashboard connections are working!')
  } else {
    console.log('⚠️ Some connections need attention. Check the errors above.')
  }

  return results
}

// Export for use in browser console
window.testDashboardConnections = runAllTests

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runAllTests()
}







