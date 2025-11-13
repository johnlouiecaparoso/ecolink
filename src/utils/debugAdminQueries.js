/**
 * Debug utility to test admin queries directly
 * Run this in browser console: await debugAdminQueries()
 */
import { getSupabase } from '@/services/supabaseClient'

export async function debugAdminQueries() {
  console.log('🔍 Debugging Admin Queries...')
  console.log('='.repeat(60))

  const supabase = getSupabase()
  if (!supabase) {
    console.error('❌ Supabase client not available')
    return
  }

  try {
    // 1. Check authentication
    console.log('\n📋 Step 1: Checking authentication...')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Not authenticated:', authError)
      return { error: 'Not authenticated', details: authError }
    }

    console.log('✅ Authenticated as:', user.email)
    console.log('   User ID:', user.id)

    // 2. Check profile and role
    console.log('\n📋 Step 2: Checking profile and role...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Cannot fetch own profile:', profileError)
      return { error: 'Cannot fetch profile', details: profileError }
    }

    console.log('✅ Profile found:', profile)
    console.log('   Role:', profile.role)
    const isAdminInDb = ['admin', 'super_admin', 'Administrator', 'Admin'].includes(profile.role)
    console.log('   Is admin (by role):', isAdminInDb)

    // 3. Test is_admin function via RPC (if it supports calling it)
    console.log('\n📋 Step 3: Testing is_admin function...')
    // Note: We can't directly call the function, but RLS policies use it

    // 4. Test count query with detailed logging
    console.log('\n📋 Step 4: Testing profiles count query...')
    const countResult = await supabase.from('profiles').select('*', { count: 'exact', head: true })

    console.log('📊 Count query result:')
    console.log('   Count:', countResult.count)
    console.log('   Error:', countResult.error)
    if (countResult.error) {
      console.log('   Error code:', countResult.error.code)
      console.log('   Error message:', countResult.error.message)
      console.log('   Error details:', countResult.error.details)
      console.log('   Error hint:', countResult.error.hint)
    }

    // 5. Test select query
    console.log('\n📋 Step 5: Testing profiles select query...')
    const selectResult = await supabase.from('profiles').select('id, role, full_name').limit(10)

    console.log('📊 Select query result:')
    console.log('   Data length:', selectResult.data?.length || 0)
    console.log('   Error:', selectResult.error)
    if (selectResult.data) {
      console.log('   First 3 profiles:', selectResult.data.slice(0, 3))
    }

    // 6. Test if we can see all profiles by trying to select specific ones
    console.log('\n📋 Step 6: Testing specific profile access...')

    // Get all user IDs from auth.users (we'll try to query their profiles)
    // Try querying without filter first
    const allProfilesResult = await supabase.from('profiles').select('id')

    console.log('📊 All profiles query:')
    console.log('   Returned:', allProfilesResult.data?.length || 0, 'profiles')
    console.log('   Error:', allProfilesResult.error)

    // If we got 0 results but no error, RLS is filtering everything
    if (allProfilesResult.data && allProfilesResult.data.length === 0 && !allProfilesResult.error) {
      console.warn('⚠️ IMPORTANT: Query returned 0 rows with NO error!')
      console.warn('⚠️ This means RLS policies are filtering out all profiles')
      console.warn('⚠️ Even though you are authenticated, RLS thinks you cannot see any profiles')
      console.warn('⚠️ The is_admin() function might not be recognizing you as admin')
    }

    // 7. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY:')
    console.log('='.repeat(60))
    console.log('✅ Authenticated:', !!user)
    console.log('✅ Profile Role:', profile.role)
    console.log('✅ Is Admin (by role check):', isAdminInDb)
    console.log('✅ Count Query Result:', countResult.count ?? 'ERROR')
    console.log('✅ Select Query Result:', selectResult.data?.length ?? 'ERROR', 'profiles')

    const diagnosis = {
      authenticated: !!user,
      userEmail: user.email,
      userRole: profile.role,
      isAdminByRole: isAdminInDb,
      countResult: countResult.count,
      countError: countResult.error,
      selectResultCount: selectResult.data?.length || 0,
      selectError: selectResult.error,
    }

    if (countResult.count === 0 && !countResult.error) {
      console.error('\n❌ PROBLEM FOUND:')
      console.error('Count query returns 0 with no error - RLS is blocking!')
      console.error('Solutions:')
      console.error('1. Make sure is_admin() function exists in database')
      console.error('2. Make sure your role in profiles table is exactly "admin"')
      console.error('3. Run fix-admin-rls-policies.sql again')
      diagnosis.problem = 'RLS filtering all results'
    }

    if (countResult.error) {
      console.error('\n❌ PROBLEM FOUND:')
      console.error('Count query has error:', countResult.error.message)
      diagnosis.problem = countResult.error.message
    }

    return diagnosis
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return { error: error.message }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.debugAdminQueries = debugAdminQueries
}




























<<<<<<< HEAD

=======
>>>>>>> 191b09e226eebf78c886c5d495f26a15031099cd
