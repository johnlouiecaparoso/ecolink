/**
 * Diagnostic utility for Admin Dashboard
 * Run this from browser console to diagnose issues with data loading
 *
 * Usage in browser console:
 * import { diagnoseAdminDashboard } from '/src/utils/diagnoseAdminDashboard.js'
 * await diagnoseAdminDashboard()
 */

import { getSupabase, getSupabaseAsync } from '@/services/supabaseClient'

export async function diagnoseAdminDashboard() {
  console.log('🔍 Starting Admin Dashboard Diagnosis...')
  console.log('='.repeat(60))

  try {
    // Step 1: Check Supabase client
    let supabase = getSupabase()
    if (!supabase) {
      console.log('⚠️ Step 1: Supabase not initialized, trying to initialize...')
      supabase = await getSupabaseAsync()
    }

    if (!supabase) {
      console.error('❌ Step 1 FAILED: Supabase client is null')
      return { success: false, step: 1, error: 'Supabase client is null' }
    }
    console.log('✅ Step 1: Supabase client is available')

    // Step 2: Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('❌ Step 2 FAILED: User not authenticated', authError)
      return { success: false, step: 2, error: 'User not authenticated', details: authError }
    }
    console.log('✅ Step 2: User is authenticated:', user.email)

    // Step 3: Check user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('❌ Step 3 FAILED: Cannot fetch user profile', profileError)
      return { success: false, step: 3, error: 'Cannot fetch profile', details: profileError }
    }

    console.log('✅ Step 3: User profile found:', profile)

    const isAdmin = profile.role === 'admin' || profile.role === 'super_admin'
    if (!isAdmin) {
      console.warn('⚠️ Step 3 WARNING: User is not an admin. Current role:', profile.role)
      console.warn('⚠️ Admin dashboard may not work correctly without admin role')
    } else {
      console.log('✅ Step 3: User has admin role')
    }

    // Step 4: Test profiles query with count
    console.log('\n📊 Step 4: Testing profiles count query...')
    const profilesCountResult = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesCountResult.error) {
      console.error('❌ Step 4 FAILED: Profiles count query error:', profilesCountResult.error)
      console.error('   Error code:', profilesCountResult.error.code)
      console.error('   Error message:', profilesCountResult.error.message)
      console.error('   Error details:', profilesCountResult.error.details)
      console.error('   Error hint:', profilesCountResult.error.hint)
    } else {
      console.log('✅ Step 4: Profiles count query successful')
      console.log('   Total users in database:', profilesCountResult.count || 0)
    }

    // Step 5: Test profiles query with data
    console.log('\n📊 Step 5: Testing profiles select query...')
    const profilesDataResult = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .limit(10)

    if (profilesDataResult.error) {
      console.error('❌ Step 5 FAILED: Profiles select query error:', profilesDataResult.error)
    } else {
      console.log('✅ Step 5: Profiles select query successful')
      console.log('   Users fetched:', profilesDataResult.data?.length || 0)
      console.log('   Sample users:', profilesDataResult.data?.slice(0, 3))
    }

    // Step 6: Test projects query
    console.log('\n📊 Step 6: Testing projects count query...')
    const projectsCountResult = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    if (projectsCountResult.error) {
      console.error('❌ Step 6 FAILED: Projects count query error:', projectsCountResult.error)
    } else {
      console.log('✅ Step 6: Projects count query successful')
      console.log('   Total projects:', projectsCountResult.count || 0)
    }

    // Step 7: Test project_credits query
    console.log('\n📊 Step 7: Testing project_credits query...')
    const creditsResult = await supabase.from('project_credits').select('total_credits')

    if (creditsResult.error) {
      console.error('❌ Step 7 FAILED: Project credits query error:', creditsResult.error)
    } else {
      console.log('✅ Step 7: Project credits query successful')
      const totalCredits =
        creditsResult.data?.reduce(
          (sum, credit) => sum + (parseInt(credit.total_credits) || 0),
          0,
        ) || 0
      console.log('   Total credits:', totalCredits)
    }

    // Step 8: Check RLS policies
    console.log('\n📋 Step 8: Checking RLS policies...')
    const rlsCheckResult = await supabase
      .rpc('check_admin_access', {})
      .catch(() => ({ error: { message: 'RPC function not available' } }))

    if (rlsCheckResult.error) {
      console.warn('⚠️ Step 8: Cannot check RLS policies via RPC (this is normal)')
      console.log('   You may need to check RLS policies in Supabase dashboard')
    } else {
      console.log('✅ Step 8: RLS check completed')
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 DIAGNOSIS SUMMARY:')
    console.log('='.repeat(60))
    console.log('✅ Supabase Client:', supabase ? 'Available' : 'Not Available')
    console.log('✅ Authentication:', user ? `Yes (${user.email})` : 'No')
    console.log('✅ User Role:', profile?.role || 'Unknown')
    console.log('✅ Is Admin:', isAdmin ? 'Yes' : 'No')
    console.log('✅ Profiles Count:', profilesCountResult.count ?? 'Error')
    console.log('✅ Profiles Data:', profilesDataResult.data?.length ?? 'Error')
    console.log('✅ Projects Count:', projectsCountResult.count ?? 'Error')
    console.log(
      '✅ Project Credits:',
      creditsResult.data ? `${creditsResult.data.length} records` : 'Error',
    )

    const allSuccessful =
      supabase &&
      user &&
      profile &&
      !profilesCountResult.error &&
      !profilesDataResult.error &&
      !projectsCountResult.error

    if (allSuccessful) {
      console.log('\n✅ All checks passed! Admin dashboard should work.')
    } else {
      console.log('\n⚠️ Some checks failed. See details above.')
    }

    return {
      success: allSuccessful,
      results: {
        supabase: !!supabase,
        authenticated: !!user,
        userEmail: user?.email,
        userRole: profile?.role,
        isAdmin,
        profilesCount: profilesCountResult.count,
        profilesDataCount: profilesDataResult.data?.length,
        projectsCount: projectsCountResult.count,
        errors: {
          profilesCount: profilesCountResult.error,
          profilesData: profilesDataResult.error,
          projectsCount: projectsCountResult.error,
        },
      },
    }
  } catch (error) {
    console.error('❌ Diagnosis failed with exception:', error)
    return { success: false, error: error.message, stack: error.stack }
  }
}

// Also make it available as a simple async function that can be imported
export default diagnoseAdminDashboard

// Make it available globally for browser console access
// Users can access it via: window.diagnoseAdminDashboard()
if (typeof window !== 'undefined') {
  window.diagnoseAdminDashboard = diagnoseAdminDashboard
}
