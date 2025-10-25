// Test Marketplace Integration - Run this in browser console
console.log('🛒 Testing Marketplace Integration...')

async function testMarketplaceIntegration() {
  try {
    // Check if we can access the marketplace integration service
    console.log('Step 1: Testing marketplace integration service...')

    const { marketplaceIntegrationService } = await import(
      '/src/services/marketplaceIntegrationService.js'
    )
    console.log('✅ Marketplace integration service loaded')

    // Check if we can access the service methods
    if (typeof marketplaceIntegrationService.createProjectListing === 'function') {
      console.log('✅ createProjectListing method available')
    } else {
      console.log('❌ createProjectListing method missing')
    }

    if (typeof marketplaceIntegrationService.updateProjectStatusWithMarketplace === 'function') {
      console.log('✅ updateProjectStatusWithMarketplace method available')
    } else {
      console.log('❌ updateProjectStatusWithMarketplace method missing')
    }

    // Test Supabase connection
    console.log('Step 2: Testing Supabase connection...')

    const { getSupabase } = await import('/src/services/supabaseClient.js')
    const supabase = getSupabase()

    if (!supabase) {
      console.log('❌ Supabase client not available')
      return
    }

    console.log('✅ Supabase client available')

    // Test if credit_listings table exists
    console.log('Step 3: Testing credit_listings table...')

    try {
      const { data: listings, error } = await supabase
        .from('credit_listings')
        .select('id, title, status')
        .limit(5)

      if (error) {
        console.log('❌ Error accessing credit_listings table:', error.message)
        console.log('Please run the fix-credit-listings-table.sql script first')
        return
      }

      console.log('✅ credit_listings table accessible')
      console.log('Existing listings:', listings?.length || 0)
    } catch (e) {
      console.log('❌ Error testing credit_listings table:', e.message)
      console.log('Please run the fix-credit-listings-table.sql script first')
      return
    }

    // Test project service
    console.log('Step 4: Testing project service...')

    try {
      const { getAllProjects } = await import('/src/services/projectService.js')
      const result = await getAllProjects()

      console.log('✅ Project service working')
      console.log('Total projects:', result.projects?.length || 0)

      const pendingProjects = result.projects?.filter((p) => p.status === 'pending') || []
      const approvedProjects = result.projects?.filter((p) => p.status === 'approved') || []

      console.log('Pending projects:', pendingProjects.length)
      console.log('Approved projects:', approvedProjects.length)
    } catch (e) {
      console.log('❌ Project service test failed:', e.message)
    }

    console.log('🎉 Marketplace integration test completed!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Make sure you ran the fix-credit-listings-table.sql script')
    console.log('2. Navigate to /verifier route')
    console.log('3. Test the approval workflow')
    console.log('4. Check if approved projects appear in marketplace')
  } catch (error) {
    console.error('❌ Marketplace integration test failed:', error)
  }
}

// Run the test
testMarketplaceIntegration()









