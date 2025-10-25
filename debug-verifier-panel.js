// Debug Verifier Panel - Run this in browser console when logged in as verifier
console.log('🔍 Debugging Verifier Panel...')

async function debugVerifierPanel() {
  try {
    // 1. Check if user is logged in and has verifier role
    console.log('Step 1: Checking user authentication...')

    // Check user store
    if (typeof window !== 'undefined' && window.__VUE_APP__) {
      try {
        const { useUserStore } = await import('/src/store/userStore.js')
        const userStore = useUserStore()

        console.log('User Store State:', {
          isAuthenticated: userStore.isAuthenticated,
          user: userStore.user,
          profile: userStore.profile,
          role: userStore.role,
          permissions: userStore.permissions,
        })

        if (!userStore.isAuthenticated) {
          console.log('❌ User not authenticated')
          return
        }

        if (userStore.role !== 'verifier' && userStore.role !== 'admin') {
          console.log('❌ User does not have verifier role. Current role:', userStore.role)
          return
        }

        console.log('✅ User authenticated with verifier role')
      } catch (e) {
        console.log('❌ Could not access user store:', e.message)
        return
      }
    }

    // 2. Test Supabase connection
    console.log('Step 2: Testing Supabase connection...')

    try {
      const { getSupabase } = await import('/src/services/supabaseClient.js')
      const supabase = getSupabase()

      if (!supabase) {
        console.log('❌ Supabase client not available')
        return
      }

      console.log('✅ Supabase client available')

      // 3. Test direct database query
      console.log('Step 3: Testing direct database query...')

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.log('❌ Database query failed:', error)
        return
      }

      console.log('✅ Database query successful')
      console.log('Projects found:', projects?.length || 0)
      console.log('Projects data:', projects)

      // 4. Test project service
      console.log('Step 4: Testing project service...')

      try {
        const { getAllProjects } = await import('/src/services/projectService.js')
        const result = await getAllProjects()

        console.log('✅ Project service working')
        console.log('Service result:', result)
        console.log('Projects from service:', result.projects?.length || 0)
      } catch (serviceError) {
        console.log('❌ Project service failed:', serviceError)
      }
    } catch (e) {
      console.log('❌ Supabase test failed:', e.message)
    }
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run the debug
debugVerifierPanel()









