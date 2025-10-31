import { getSupabase } from '@/services/supabaseClient'

/**
 * Debug service to check marketplace data flow
 */
export async function debugMarketplaceData() {
  const supabase = getSupabase()

  if (!supabase) {
    console.error('❌ Supabase client not available')
    return
  }

  try {
    console.log('🔍 DEBUGGING MARKETPLACE DATA FLOW...')

    // 1. Check approved projects
    const { data: approvedProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, status')
      .eq('status', 'approved')

    console.log('📊 Approved Projects:', approvedProjects?.length || 0)
    if (projectsError) console.error('❌ Projects Error:', projectsError)

    // 2. Check project credits
    const { data: projectCredits, error: creditsError } = await supabase
      .from('project_credits')
      .select('id, project_id, total_credits, credits_available')

    console.log('💳 Project Credits:', projectCredits?.length || 0)
    if (creditsError) console.error('❌ Credits Error:', creditsError)

    // 3. Check credit listings
    const { data: creditListings, error: listingsError } = await supabase
      .from('credit_listings')
      .select('id, project_credit_id, quantity, status')
      .eq('status', 'active')

    console.log('🏪 Active Credit Listings:', creditListings?.length || 0)
    if (listingsError) console.error('❌ Listings Error:', listingsError)

    // 4. Check the full join
    const { data: fullData, error: fullError } = await supabase
      .from('credit_listings')
      .select(
        `
        *,
        project_credits(
          *,
          projects(
            id,
            title,
            status
          )
        )
      `,
      )
      .eq('status', 'active')

    console.log('🔗 Full Join Data:', fullData?.length || 0)
    if (fullError) {
      console.error('❌ Full Join Error:', fullError)
      console.error('Error details:', {
        message: fullError.message,
        details: fullError.details,
        hint: fullError.hint,
        code: fullError.code,
      })
    }

    return {
      approvedProjects: approvedProjects?.length || 0,
      projectCredits: projectCredits?.length || 0,
      creditListings: creditListings?.length || 0,
      fullJoinData: fullData?.length || 0,
      errors: {
        projects: projectsError,
        credits: creditsError,
        listings: listingsError,
        fullJoin: fullError,
      },
    }
  } catch (error) {
    console.error('❌ Debug service error:', error)
    return { error: error.message }
  }
}




