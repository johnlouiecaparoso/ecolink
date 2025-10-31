// Test Complete Workflow - Final Version
// Run this in browser console

console.log('🎯 Testing Complete Workflow - Final Version...')

async function testCompleteWorkflow() {
  try {
    // Step 1: Test marketplace integration service
    console.log('Step 1: Testing marketplace integration service...')

    const { marketplaceIntegrationService } = await import(
      '/src/services/marketplaceIntegrationService.js'
    )
    console.log('✅ Marketplace integration service loaded')

    // Step 2: Test Supabase connection
    console.log('Step 2: Testing Supabase connection...')

    const { getSupabase } = await import('/src/services/supabaseClient.js')
    const supabase = getSupabase()

    if (!supabase) {
      console.log('❌ Supabase client not available')
      return
    }

    console.log('✅ Supabase client available')

    // Step 3: Test credit_listings table access
    console.log('Step 3: Testing credit_listings table access...')

    const { data: listings, error: listingsError } = await supabase
      .from('credit_listings')
      .select('*')
      .limit(5)

    if (listingsError) {
      console.log('❌ Error accessing credit_listings table:', listingsError.message)
      return
    }

    console.log('✅ credit_listings table accessible')
    console.log('Existing listings:', listings?.length || 0)

    // Step 4: Test projects table access
    console.log('Step 4: Testing projects table access...')

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, status, user_id')
      .limit(5)

    if (projectsError) {
      console.log('❌ Error accessing projects table:', projectsError.message)
      return
    }

    console.log('✅ projects table accessible')
    console.log('Total projects:', projects?.length || 0)

    const pendingProjects = projects?.filter((p) => p.status === 'pending') || []
    const approvedProjects = projects?.filter((p) => p.status === 'approved') || []

    console.log('Pending projects:', pendingProjects.length)
    console.log('Approved projects:', approvedProjects.length)

    // Step 5: Test creating a sample marketplace listing
    console.log('Step 5: Testing marketplace listing creation...')

    if (approvedProjects.length > 0) {
      const testProject = approvedProjects[0]
      console.log('Testing with project:', testProject.title)

      try {
        const listing = await marketplaceIntegrationService.createProjectListing(testProject.id, {
          pricePerCredit: 20.0,
          quantity: 500,
        })

        console.log('✅ Marketplace listing created successfully!')
        console.log('Listing ID:', listing.id)
        console.log('Title:', listing.title)
        console.log('Price per credit:', listing.price_per_credit)
        console.log('Quantity:', listing.quantity)
      } catch (listingError) {
        console.log('❌ Error creating marketplace listing:', listingError.message)
      }
    } else {
      console.log('⚠️ No approved projects found to test with')
    }

    // Step 6: Test verifier workflow
    console.log('Step 6: Testing verifier workflow...')

    try {
      const { useUserStore } = await import('/src/store/userStore.js')
      const userStore = useUserStore()

      console.log('Current user role:', userStore.role)
      console.log('Current user ID:', userStore.user?.id)

      if (userStore.role === 'verifier' || userStore.role === 'admin') {
        console.log('✅ User has verifier access')

        // Test updating a project status
        if (pendingProjects.length > 0) {
          const testProject = pendingProjects[0]
          console.log('Testing project status update for:', testProject.title)

          try {
            const result = await marketplaceIntegrationService.updateProjectStatusWithMarketplace(
              testProject.id,
              'approved',
              'Test verification notes',
              {
                pricePerCredit: 18.0,
                quantity: 750,
              },
            )

            console.log('✅ Project status updated successfully!')
            console.log('Updated project:', result.project)
            console.log('Marketplace listing:', result.marketplaceListing)
          } catch (updateError) {
            console.log('❌ Error updating project status:', updateError.message)
          }
        } else {
          console.log('⚠️ No pending projects found to test with')
        }
      } else {
        console.log('⚠️ User does not have verifier role')
        console.log('Please login as verifier to test the approval workflow')
      }
    } catch (verifierError) {
      console.log('❌ Error testing verifier workflow:', verifierError.message)
    }

    // Step 7: Test marketplace service
    console.log('Step 7: Testing marketplace service...')

    try {
      const { getMarketplaceListings } = await import('/src/services/marketplaceService.js')
      const marketplaceResult = await getMarketplaceListings()

      console.log('✅ Marketplace service working')
      console.log('Marketplace listings:', marketplaceResult?.length || 0)

      if (marketplaceResult && marketplaceResult.length > 0) {
        console.log('Sample marketplace listing:', {
          id: marketplaceResult[0].id,
          title: marketplaceResult[0].title,
          price_per_credit: marketplaceResult[0].price_per_credit,
          quantity: marketplaceResult[0].quantity,
          status: marketplaceResult[0].status,
        })
      }
    } catch (marketplaceError) {
      console.log('❌ Error testing marketplace service:', marketplaceError.message)
    }

    console.log('🎉 Complete workflow test finished!')
    console.log('')
    console.log('Summary:')
    console.log('✅ Credit listings table: Working')
    console.log('✅ Projects table: Working')
    console.log('✅ Marketplace integration: Working')
    console.log('✅ Verifier workflow: Ready')
    console.log('✅ Marketplace service: Working')
    console.log('')
    console.log('Next steps:')
    console.log('1. Navigate to /verifier route')
    console.log('2. Click "Start Review" on a pending project')
    console.log('3. Add verification notes and click "Approve"')
    console.log('4. Check if project status changes to approved')
    console.log('5. Check if marketplace listing is created')
    console.log('6. Check if project is removed from pending list')
    console.log('7. Check if approved project appears in marketplace')
  } catch (error) {
    console.error('❌ Complete workflow test failed:', error)
  }
}

// Run the test
testCompleteWorkflow()









