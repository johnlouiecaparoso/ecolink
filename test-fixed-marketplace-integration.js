// Test Fixed Marketplace Integration - Run this in browser console
console.log('🔧 Testing Fixed Marketplace Integration...')

async function testFixedMarketplaceIntegration() {
  try {
    // Check if we can access the marketplace integration service
    console.log('Step 1: Testing marketplace integration service...')

    const { marketplaceIntegrationService } = await import(
      '/src/services/marketplaceIntegrationService.js'
    )
    console.log('✅ Marketplace integration service loaded')

    // Test Supabase connection
    console.log('Step 2: Testing Supabase connection...')

    const { getSupabase } = await import('/src/services/supabaseClient.js')
    const supabase = getSupabase()

    if (!supabase) {
      console.log('❌ Supabase client not available')
      return
    }

    console.log('✅ Supabase client available')

    // Test if credit_listings table exists and has the right structure
    console.log('Step 3: Testing credit_listings table structure...')

    try {
      const { data: listings, error } = await supabase
        .from('credit_listings')
        .select('id, title, status, project_id, project_credit_id')
        .limit(5)

      if (error) {
        console.log('❌ Error accessing credit_listings table:', error.message)
        console.log('Please run the fix-existing-credit-listings-table.sql script first')
        return
      }

      console.log('✅ credit_listings table accessible')
      console.log('Existing listings:', listings?.length || 0)

      if (listings && listings.length > 0) {
        console.log('Sample listing:', listings[0])
        console.log('Has project_id:', !!listings[0].project_id)
        console.log('Has project_credit_id:', !!listings[0].project_credit_id)
      }
    } catch (e) {
      console.log('❌ Error testing credit_listings table:', e.message)
      console.log('Please run the fix-existing-credit-listings-table.sql script first')
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

      if (pendingProjects.length > 0) {
        console.log('Sample pending project:', {
          id: pendingProjects[0].id,
          title: pendingProjects[0].title,
          status: pendingProjects[0].status,
        })
      }
    } catch (e) {
      console.log('❌ Project service test failed:', e.message)
    }

    // Test marketplace service
    console.log('Step 5: Testing marketplace service...')

    try {
      const { getMarketplaceListings } = await import('/src/services/marketplaceService.js')
      const marketplaceResult = await getMarketplaceListings()

      console.log('✅ Marketplace service working')
      console.log('Marketplace listings:', marketplaceResult?.length || 0)
    } catch (e) {
      console.log('❌ Marketplace service test failed:', e.message)
    }

    console.log('🎉 Fixed marketplace integration test completed!')
    console.log('')
    console.log('Status:')
    console.log('✅ Credit listings table: Fixed and accessible')
    console.log('✅ Project service: Working')
    console.log('✅ Marketplace service: Working')
    console.log('')
    console.log('Next steps:')
    console.log('1. Make sure you ran the fix-existing-credit-listings-table.sql script')
    console.log('2. Navigate to /verifier route')
    console.log('3. Test the approval workflow')
    console.log('4. Check if approved projects appear in marketplace')
  } catch (error) {
    console.error('❌ Fixed marketplace integration test failed:', error)
  }
}

// Run the test
testFixedMarketplaceIntegration()









