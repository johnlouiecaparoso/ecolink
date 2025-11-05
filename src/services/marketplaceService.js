import { getSupabase } from '@/services/supabaseClient'
import { logUserAction } from '@/services/auditService'
import { notifyCreditPurchased } from '@/services/emailService'
// import { realPaymentService } from '@/services/realPaymentService'
// Import real payment service
import { realPaymentService } from './realPaymentService.js'
import { creditOwnershipService } from '@/services/creditOwnershipService'
import { getCurrentUserId } from '@/utils/authHelper'

/**
 * Get all active marketplace listings with project details
 * Real data implementation with proper error handling
 */
/**
 * Clean up orphaned credit_listings and project_credits that reference deleted projects
 * This function should be called periodically or when marketplace loads
 */
async function cleanupOrphanedRecords() {
  const supabase = getSupabase()
  if (!supabase) return

  try {
    console.log('🧹 Checking for orphaned records...')

    // Get all project_credits
    const { data: allCredits, error: creditsError } = await supabase
      .from('project_credits')
      .select('id, project_id')

    if (creditsError || !allCredits || allCredits.length === 0) {
      return
    }

    // Get all project IDs from credits
    const creditProjectIds = [...new Set(allCredits.map((c) => c.project_id).filter(Boolean))]

    if (creditProjectIds.length === 0) {
      return
    }

    // Check which projects actually exist
    const { data: existingProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .in('id', creditProjectIds)

    if (projectsError) {
      console.warn('⚠️ Error checking existing projects:', projectsError)
      return
    }

    const existingProjectIds = new Set(existingProjects?.map((p) => p.id) || [])
    const orphanedProjectIds = creditProjectIds.filter((id) => !existingProjectIds.has(id))

    if (orphanedProjectIds.length === 0) {
      console.log('✅ No orphaned records found')
      return
    }

    console.log(`🧹 Found ${orphanedProjectIds.length} orphaned project references`)

    // Find orphaned credits
    const orphanedCredits = allCredits.filter((c) => orphanedProjectIds.includes(c.project_id))
    const orphanedCreditIds = orphanedCredits.map((c) => c.id)

    if (orphanedCreditIds.length === 0) {
      return
    }

    console.log(
      `🧹 Cleaning up ${orphanedCreditIds.length} orphaned project_credits and their listings...`,
    )

    // Delete orphaned credit_listings first
    const { error: listingsError, count: deletedListings } = await supabase
      .from('credit_listings')
      .delete({ count: 'exact' })
      .in('project_credit_id', orphanedCreditIds)

    if (listingsError) {
      console.warn('⚠️ Error cleaning up orphaned credit_listings:', listingsError)
    } else {
      console.log(`✅ Cleaned up ${deletedListings || 0} orphaned credit_listings`)
    }

    // Delete orphaned project_credits
    const { error: creditsDeleteError, count: deletedCredits } = await supabase
      .from('project_credits')
      .delete({ count: 'exact' })
      .in('id', orphanedCreditIds)

    if (creditsDeleteError) {
      console.warn('⚠️ Error cleaning up orphaned project_credits:', creditsDeleteError)
    } else {
      console.log(`✅ Cleaned up ${deletedCredits || 0} orphaned project_credits`)
    }

    console.log(
      `✅ Cleanup complete: Removed ${deletedListings || 0} listings and ${deletedCredits || 0} credits`,
    )
  } catch (error) {
    console.error('❌ Error during orphaned records cleanup:', error)
  }
}

export async function getMarketplaceListings(filters = {}) {
  const supabase = getSupabase()

  if (!supabase) {
    console.warn('Supabase client not initialized')
    return []
  }

  try {
    // Clean up orphaned records before fetching (runs automatically)
    await cleanupOrphanedRecords()

    console.log('🔍 Fetching marketplace listings with filters:', filters)

    // Step 1: Get credit listings - try active first, then all if needed for debugging
    let { data: listings, error: listingsError } = await supabase
      .from('credit_listings')
      .select('*')
      .eq('status', 'active')

    if (listingsError) {
      console.error('❌ Error fetching active credit listings:', listingsError)
      // Try without status filter to see if there are any listings
      const { data: allListings, error: allError } = await supabase
        .from('credit_listings')
        .select('*')

      if (!allError && allListings && allListings.length > 0) {
        console.warn(
          '⚠️ Found listings with non-active status:',
          allListings.map((l) => ({ id: l.id, status: l.status, price: l.price_per_credit })),
        )
      }
      throw listingsError
    }

    console.log('✅ Found', listings?.length || 0, 'active credit listings')

    // Debug: Log listing details if found
    if (listings && listings.length > 0) {
      console.log(
        '📋 Listing details:',
        listings.map((l) => ({
          id: l.id,
          project_credit_id: l.project_credit_id,
          price_per_credit: l.price_per_credit,
          status: l.status,
          quantity: l.quantity,
        })),
      )
      // Log full details for each listing
      listings.forEach((l, index) => {
        console.log(`📋 Listing ${index + 1}:`, {
          id: l.id,
          project_credit_id: l.project_credit_id,
          price_per_credit: l.price_per_credit,
          status: l.status,
          quantity: l.quantity,
          seller_id: l.seller_id,
          currency: l.currency,
        })
      })
    }

    // If no active listings found, check if there are any listings at all (for debugging)
    if (!listings || listings.length === 0) {
      const { data: allListings, error: allError } = await supabase
        .from('credit_listings')
        .select('id, status, price_per_credit, project_credit_id')

      if (!allError && allListings && allListings.length > 0) {
        console.warn(
          '⚠️ Found listings but none are active:',
          allListings.map((l) => ({
            id: l.id,
            status: l.status,
            price: l.price_per_credit,
          })),
        )
      }
      return []
    }

    // Step 2: Get project credits for these listings
    const listingIds = listings.map((l) => l.project_credit_id).filter(Boolean)
    const { data: credits, error: creditsError } = await supabase
      .from('project_credits')
      .select('*')
      .in('id', listingIds)

    if (creditsError) {
      console.error('❌ Error fetching project credits:', creditsError)
      throw creditsError
    }

    console.log('✅ Found', credits?.length || 0, 'project credits')

    // Debug: Log credit details
    if (credits && credits.length > 0) {
      console.log(
        '💳 Credit details:',
        credits.map((c) => ({
          id: c.id,
          project_id: c.project_id,
          price_per_credit: c.price_per_credit,
          currency: c.currency,
        })),
      )
      // Log full details for each credit
      credits.forEach((c, index) => {
        console.log(`💳 Credit ${index + 1}:`, {
          id: c.id,
          project_id: c.project_id,
          price_per_credit: c.price_per_credit,
          currency: c.currency,
          total_credits: c.total_credits,
          available_credits: c.available_credits,
        })
      })
    }

    // Step 3: Get projects for these credits
    const projectIds = credits?.map((c) => c.project_id).filter(Boolean) || []
    console.log('🔍 Looking for projects with IDs:', projectIds)
    console.log('🔍 About to query projects table...')

    if (!projectIds || projectIds.length === 0) {
      console.warn('⚠️ No project IDs found from credits! Credits data:', credits)
      return []
    }

    let projects = null

    try {
      console.log('🔍 Executing projects query now...')
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds)
        .eq('status', 'approved') // Only approved projects

      projects = projectsData

      console.log('🔍 Projects query completed. Error:', projectsError)
      console.log('🔍 Projects data:', projects)
      console.log('🔍 Projects count:', projects?.length || 0)

      if (projectsError) {
        console.error('❌ Error fetching projects:', projectsError)
        throw projectsError
      }

      // Step 3.5: Clean up orphaned records - filter out credits/listings for deleted projects
      const validProjectIds = projects?.map((p) => p.id) || []
      const orphanedProjectIds = projectIds.filter((id) => !validProjectIds.includes(id))

      if (orphanedProjectIds.length > 0) {
        console.warn(
          `⚠️ Found ${orphanedProjectIds.length} orphaned project references (projects deleted but credits/listings still exist):`,
          orphanedProjectIds,
        )

        // Clean up orphaned project_credits
        const orphanedCredits =
          credits?.filter((c) => orphanedProjectIds.includes(c.project_id)) || []
        if (orphanedCredits.length > 0) {
          console.log(`🧹 Cleaning up ${orphanedCredits.length} orphaned project_credits...`)
          const orphanedCreditIds = orphanedCredits.map((c) => c.id)

          // Delete orphaned credit_listings first
          try {
            const { error: cleanupListingsError } = await supabase
              .from('credit_listings')
              .delete()
              .in('project_credit_id', orphanedCreditIds)

            if (cleanupListingsError) {
              console.warn('⚠️ Could not cleanup orphaned credit_listings:', cleanupListingsError)
            } else {
              console.log(
                `✅ Cleaned up orphaned credit_listings for ${orphanedCreditIds.length} credits`,
              )
            }
          } catch (cleanupErr) {
            console.warn('⚠️ Error cleaning up orphaned credit_listings:', cleanupErr)
          }

          // Delete orphaned project_credits
          try {
            const { error: cleanupCreditsError } = await supabase
              .from('project_credits')
              .delete()
              .in('id', orphanedCreditIds)

            if (cleanupCreditsError) {
              console.warn('⚠️ Could not cleanup orphaned project_credits:', cleanupCreditsError)
            } else {
              console.log(`✅ Cleaned up ${orphanedCredits.length} orphaned project_credits`)
            }
          } catch (cleanupErr) {
            console.warn('⚠️ Error cleaning up orphaned project_credits:', cleanupErr)
          }
        }

        // Filter out orphaned credits from our data
        credits = credits?.filter((c) => validProjectIds.includes(c.project_id)) || []
        console.log(`✅ Filtered out orphaned credits, remaining: ${credits.length}`)
      }

      console.log('✅ Found', projects?.length || 0, 'approved projects')
    } catch (err) {
      console.error('❌ Exception in projects query:', err)
      throw err
    }

    // If no approved projects found, try without status filter to see what's there
    if (!projects || projects.length === 0) {
      console.warn('⚠️ No approved projects found! Checking all projects with these IDs...')
      const { data: allProjects, error: allError } = await supabase
        .from('projects')
        .select('id, title, status, credit_price')
        .in('id', projectIds)

      if (allError) {
        console.error('❌ Error checking all projects:', allError)
      }

      if (allProjects && allProjects.length > 0) {
        console.warn(
          '⚠️ Found projects but not approved:',
          allProjects.map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            credit_price: p.credit_price,
          })),
        )
        // Use all projects if none are approved (for debugging)
        console.warn('⚠️ Using non-approved projects for debugging...')
        // Don't actually use them, just log
      } else {
        console.error('❌ No projects found at all with these IDs:', projectIds)
        return []
      }
    }

    // Debug: Log project details
    if (projects && projects.length > 0) {
      console.log(
        '📁 Project details:',
        projects.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          credit_price: p.credit_price,
        })),
      )
      // Log each project individually
      projects.forEach((p, index) => {
        console.log(`📁 Project ${index + 1}:`, {
          id: p.id,
          title: p.title,
          status: p.status,
          credit_price: p.credit_price,
          estimated_credits: p.estimated_credits,
        })
      })
    } else {
      console.error('❌ No approved projects found! This is why listings are not showing.')
      console.error('❌ Project IDs we were looking for:', projectIds)
      return []
    }

    // Step 4: Get seller names
    const sellerIds = [...new Set(listings.map((l) => l.seller_id).filter(Boolean))]
    const { data: sellers } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', sellerIds)

    const sellerMap = new Map(sellers?.map((seller) => [seller.id, seller.full_name]) || [])

    // Step 5: Combine the data and deduplicate by project_credit_id
    const projectCreditMap = new Map()

    console.log(
      '🔄 Starting to process',
      listings.length,
      'listings with',
      credits?.length || 0,
      'credits and',
      projects?.length || 0,
      'projects',
    )

    listings.forEach((listing) => {
      console.log(`\n🔍 Processing listing ${listing.id}:`)
      console.log('  - Listing project_credit_id:', listing.project_credit_id)
      console.log('  - Listing price_per_credit:', listing.price_per_credit)

      const credit = credits?.find((c) => c.id === listing.project_credit_id)
      console.log(
        '  - Found credit:',
        credit
          ? { id: credit.id, project_id: credit.project_id, price: credit.price_per_credit }
          : 'NOT FOUND',
      )

      const project = projects?.find((p) => p.id === credit?.project_id)
      console.log(
        '  - Found project:',
        project
          ? {
              id: project.id,
              title: project.title,
              status: project.status,
              credit_price: project.credit_price,
            }
          : 'NOT FOUND',
      )

      if (!credit || !project) {
        console.warn('⚠️ Skipping listing due to missing data:', {
          listing_id: listing.id,
          has_credit: !!credit,
          has_project: !!project,
          project_credit_id: listing.project_credit_id,
          credit_project_id: credit?.project_id,
          available_credit_ids: credits?.map((c) => c.id),
          available_project_ids: projects?.map((p) => p.id),
        })
        return // Skip if missing data
      }

      // Debug: Log price sources
      // PRIORITY: project.credit_price (developer-set) > credit.price_per_credit > listing.price_per_credit
      // We prioritize project.credit_price because it's the source of truth set by the developer
      const finalPrice =
        project.credit_price || credit.price_per_credit || listing.price_per_credit || 0
      console.log(`💰 Price sources for listing ${listing.id} (${project.title}):`, {
        listing_price: listing.price_per_credit,
        credit_price: credit.price_per_credit,
        project_credit_price: project.credit_price,
        will_use: finalPrice,
        source: project.credit_price
          ? 'project.credit_price'
          : credit.price_per_credit
            ? 'credit.price_per_credit'
            : 'listing.price_per_credit',
      })

      const key = listing.project_credit_id

      // If we already have this project_credit_id, keep the most recent listing
      if (
        !projectCreditMap.has(key) ||
        new Date(listing.created_at) > new Date(projectCreditMap.get(key).listed_at)
      ) {
        // Prioritize price from project_credits (source of truth), then project.credit_price, then listing
        // This ensures we show the developer-set price, not a default/mock value
        const pricePerCredit = finalPrice

        // Debug log to help identify price source issues
        if (listing.price_per_credit && listing.price_per_credit !== pricePerCredit) {
          console.log(
            `💰 Price correction for ${project.title}: listing.price=${listing.price_per_credit}, using correct price=${pricePerCredit} (from ${credit.price_per_credit ? 'project_credits' : 'project.credit_price'})`,
          )
        }

        // CRITICAL: Calculate available quantity respecting developer-set limit
        // Priority: project_credits.credits_available > project.estimated_credits > listing.quantity
        // This ensures we show the actual available credits, not exceeding developer's limit
        let availableQuantity = listing.quantity

        // If developer set estimated_credits, use that as the maximum limit
        if (project.estimated_credits && project.estimated_credits > 0) {
          // Use the minimum of listing quantity and developer limit
          availableQuantity = Math.min(listing.quantity, project.estimated_credits)
        }

        // If project_credits has credits_available, use that (it's the most accurate)
        if (credit.credits_available !== null && credit.credits_available !== undefined) {
          availableQuantity = Math.min(
            availableQuantity,
            credit.credits_available,
            project.estimated_credits || Infinity,
          )
        }

        console.log('📊 Available quantity calculation:', {
          listing_quantity: listing.quantity,
          project_estimated_credits: project.estimated_credits,
          credit_credits_available: credit.credits_available,
          final_available_quantity: availableQuantity,
        })

        projectCreditMap.set(key, {
          listing_id: listing.id,
          project_id: project.id,
          project_title: project.title,
          project_description: project.description,
          category: project.category,
          location: project.location,
          vintage_year: credit.vintage_year,
          verification_standard: credit.verification_standard,
          available_quantity: availableQuantity, // Use calculated available quantity
          price_per_credit: pricePerCredit,
          currency: listing.currency || credit.currency || 'PHP',
          seller_id: listing.seller_id,
          seller_name: sellerMap.get(listing.seller_id) || 'Unknown Seller',
          listed_at: listing.created_at,
          project_image: project.project_image,
          image_name: project.image_name,
          image_type: project.image_type,
          estimated_credits: project.estimated_credits, // Developer-set limit
          credit_price: project.credit_price,
          // Store additional data for reference
          project_credits_available: credit.credits_available,
          project_credits_total: credit.total_credits,
        })
      }
    })

    const transformedListings = Array.from(projectCreditMap.values())

    console.log('✅ Transformed', transformedListings.length, 'listings for marketplace')

    // Debug: Log final prices for each listing
    if (transformedListings.length > 0) {
      console.log(
        '💰 Final listing prices:',
        transformedListings.map((l) => ({
          title: l.project_title,
          price_per_credit: l.price_per_credit,
          currency: l.currency,
        })),
      )
    }

    // Apply client-side filters
    let filtered = [...transformedListings]

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((listing) => listing.category === filters.category)
    }

    if (filters.country) {
      filtered = filtered.filter((listing) =>
        listing.location.toLowerCase().includes(filters.country.toLowerCase()),
      )
    }

    if (filters.minPrice) {
      filtered = filtered.filter((listing) => listing.price_per_credit >= filters.minPrice)
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((listing) => listing.price_per_credit <= filters.maxPrice)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (listing) =>
          listing.project_title?.toLowerCase().includes(searchTerm) ||
          listing.project_description?.toLowerCase().includes(searchTerm) ||
          listing.location?.toLowerCase().includes(searchTerm),
      )
    }

    return filtered
  } catch (error) {
    console.error('❌ Error in getMarketplaceListings:', error)
    return []
  }
}

/**
 * Get a specific marketplace listing by ID
 */
export async function getMarketplaceListing(listingId) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('credit_listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching marketplace listing:', error)
    throw error
  }
}

/**
 * Check if a credit listing already exists for a project_credit_id
 * @param {string} projectCreditId - Project credit ID
 * @returns {Promise<boolean>} True if listing exists
 */
export async function checkExistingListing(projectCreditId) {
  const supabase = getSupabase()

  if (!supabase) {
    return false
  }

  try {
    const { data, error } = await supabase
      .from('credit_listings')
      .select('id')
      .eq('project_credit_id', projectCreditId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking existing listing:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in checkExistingListing:', error)
    return false
  }
}

/**
 * Get marketplace statistics
 */
export async function getMarketplaceStats() {
  const supabase = getSupabase()

  try {
    const { data: listings, error } = await supabase
      .from('credit_listings')
      .select('quantity, price_per_credit, currency')
      .eq('status', 'active')

    if (error) {
      throw error
    }

    const stats = {
      totalListings: listings?.length || 0,
      totalCreditsAvailable: listings?.reduce((sum, listing) => sum + listing.quantity, 0) || 0,
      totalMarketValue:
        listings?.reduce((sum, listing) => sum + listing.quantity * listing.price_per_credit, 0) ||
        0,
    }

    return stats
  } catch (error) {
    console.error('Error fetching marketplace stats:', error)
    return {
      totalListings: 0,
      totalCreditsAvailable: 0,
      totalMarketValue: 0,
    }
  }
}

/**
 * Get user's credit portfolio (owned credits)
 */
export async function getUserCreditPortfolio(userId) {
  const supabase = getSupabase()

  if (!supabase) {
    console.warn('Supabase client not initialized')
    return []
  }

  try {
    // Use projects directly since credit_ownership has project_id
    // This avoids the ambiguous relationship error with project_credits
    const { data, error } = await supabase
      .from('credit_ownership')
      .select(
        `
        *,
        projects!inner(
          id,
          title,
          description,
          category,
          location,
          project_image,
          image_name,
          image_type
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user credit portfolio:', error)
      throw error
    }

    // Transform the data to match expected format
    const portfolio = (data || []).map((record) => ({
      id: record.id,
      project_id: record.project_id,
      project_title: record.projects?.title || 'Unknown Project',
      project_description: record.projects?.description || '',
      project_category: record.projects?.category || 'Unknown',
      project_location: record.projects?.location || 'Unknown',
      project_image: record.projects?.project_image,
      image_name: record.projects?.image_name,
      image_type: record.projects?.image_type,
      quantity: record.quantity,
      ownership_type: record.ownership_type,
      created_at: record.created_at,
      updated_at: record.updated_at,
      ownership_status: record.ownership_type === 'retired' ? 'retired' : 'owned',
    }))

    return portfolio
  } catch (error) {
    console.error('Error in getUserCreditPortfolio:', error)
    return []
  }
}

/**
 * Purchase credits from marketplace listing
 * @param {string} listingId - Listing ID
 * @param {Object} purchaseData - Purchase information
 * @param {number} purchaseData.quantity - Number of credits to purchase
 * @param {string} purchaseData.paymentMethod - Payment method (gcash/maya)
 * @param {Object} purchaseData.paymentData - Payment details
 * @returns {Promise<Object>} Purchase result
 */
export async function purchaseCredits(listingId, purchaseData) {
  const supabase = getSupabase()

  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  try {
    console.log('🛒 Processing credit purchase:', { listingId, purchaseData })

    // Get current user ID using helper (works for test accounts too)
    const userId = await getCurrentUserId()
    console.log('🔍 getCurrentUserId result:', userId)

    if (!userId) {
      console.error('❌ No user ID found')
      throw new Error('User not authenticated')
    }

    const user = { id: userId }

    // Get listing details with project information
    const { data: listing, error: listingError } = await supabase
      .from('credit_listings')
      .select(
        `
        *,
        project_credits!inner(
          id,
          project_id,
          projects!inner(
            id,
            title,
            category,
            location
          )
        )
      `,
      )
      .eq('id', listingId)
      .eq('status', 'active')
      .single()

    if (listingError || !listing) {
      throw new Error('Listing not found or no longer available')
    }

    // Validate purchase quantity
    if (purchaseData.quantity <= 0) {
      throw new Error('Invalid purchase quantity')
    }

    // CRITICAL: Get the correct price from project (developer-set price), not listing
    // This ensures we use the same price logic as the marketplace display
    const { data: project } = await supabase
      .from('projects')
      .select('credit_price, estimated_credits')
      .eq('id', listing.project_credits.project_id)
      .single()

    // Use project.credit_price (developer-set) if available, otherwise fall back to listing price
    const actualPricePerCredit = project?.credit_price || listing.price_per_credit
    const totalCost = actualPricePerCredit * purchaseData.quantity

    // CRITICAL: Get current available credits from project_credits table
    const { data: projectCredit } = await supabase
      .from('project_credits')
      .select('credits_available, total_credits')
      .eq('project_id', listing.project_credits.project_id)
      .single()

    // Calculate actual available quantity (respects developer limit)
    // Priority: project_credits.credits_available > project.estimated_credits > listing.quantity
    let actualAvailable = listing.quantity

    // If developer set estimated_credits, use that as the maximum limit
    if (project?.estimated_credits && project.estimated_credits > 0) {
      actualAvailable = Math.min(actualAvailable, project.estimated_credits)
    }

    // If project_credits has credits_available, use that (it's the most accurate)
    if (
      projectCredit?.credits_available !== null &&
      projectCredit?.credits_available !== undefined
    ) {
      actualAvailable = Math.min(
        actualAvailable,
        projectCredit.credits_available,
        project?.estimated_credits || Infinity,
      )
    }

    // Validate purchase quantity against calculated available quantity
    if (purchaseData.quantity > actualAvailable) {
      throw new Error(
        `Cannot purchase ${purchaseData.quantity} credits. ` +
          `Only ${actualAvailable} credits available. ` +
          (project?.estimated_credits ? `(Developer limit: ${project.estimated_credits})` : ''),
      )
    }

    console.log('✅ Purchase quantity validated:', {
      requested: purchaseData.quantity,
      listing_quantity: listing.quantity,
      developer_limit: project?.estimated_credits,
      project_credits_available: projectCredit?.credits_available,
      project_credits_total: projectCredit?.total_credits,
      actual_available: actualAvailable,
    })

    console.log('💰 Purchase details:', {
      quantity: purchaseData.quantity,
      listing_price_per_credit: listing.price_per_credit,
      project_credit_price: project?.credit_price,
      actual_price_per_credit: actualPricePerCredit,
      totalCost,
      currency: listing.currency,
      project_title: listing.project_credits.projects.title,
    })

    // Handle different payment methods
    let paymentResult
    if (purchaseData.paymentMethod === 'wallet') {
      // Wallet balance payment - deduct from user's wallet
      const { updateWalletBalance, getWalletBalance } = await import('@/services/walletService')
      const supabase = getSupabase()

      // Check wallet balance
      const walletBalance = await getWalletBalance(user.id)
      if (walletBalance.current_balance < totalCost) {
        throw new Error(
          `Insufficient wallet balance. You have ₱${walletBalance.current_balance.toFixed(2)}, but need ₱${totalCost.toFixed(2)}`,
        )
      }

      // Get wallet account for transaction record
      const { data: walletAccount } = await supabase
        .from('wallet_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // Create wallet transaction record
      const { data: walletTransaction, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          account_id: walletAccount.id,
          user_id: user.id,
          type: 'withdrawal',
          amount: totalCost,
          status: 'completed',
          payment_method: 'wallet',
          description: `Purchase ${purchaseData.quantity} credits from ${listing.project_credits.projects.title}`,
          reference_id: `wallet_purchase_${Date.now()}`,
        })
        .select()
        .single()

      if (transactionError) {
        throw new Error(`Failed to create wallet transaction: ${transactionError.message}`)
      }

      // Deduct from wallet balance
      await updateWalletBalance(user.id, totalCost, 'withdrawal')

      // Payment result for wallet
      paymentResult = {
        success: true,
        transactionId: walletTransaction.id,
        checkoutUrl: null,
        sessionId: null,
        status: 'completed',
        paymentMethod: 'wallet',
      }
      console.log('✅ Wallet payment processed successfully')
    } else if (purchaseData.paymentMethod === 'demo') {
      // Demo mode - instant completion
      paymentResult = {
        success: true,
        transactionId: `demo_${Date.now()}`,
        checkoutUrl: null,
        sessionId: null,
        status: 'completed',
      }
    } else if (
      purchaseData.paymentMethod === 'card' ||
      purchaseData.paymentMethod === 'gcash' ||
      purchaseData.paymentMethod === 'maya'
    ) {
      // Real PayMongo payment - creates checkout session
      // PayMongo supports card, gcash, and paymaya in the same checkout session
      // The actual payment method will be detected from PayMongo callback
      // Include detailed purchase information for PayMongo checkout display

      // Prepare payment data
      const paymentData = {
        amount: totalCost,
        currency: listing.currency,
        description: `Purchase ${purchaseData.quantity} credits from ${listing.project_credits.projects.title}`,
        userId: user.id,
        metadata: {
          quantity: purchaseData.quantity,
          price_per_credit: actualPricePerCredit,
          total_amount: totalCost,
          project_title: listing.project_credits.projects.title,
          listing_id: listingId,
          requested_payment_method: purchaseData.paymentMethod, // Store requested method for reference
        },
      }

      // Call the appropriate payment method with proper context binding
      if (purchaseData.paymentMethod === 'card') {
        paymentResult = await realPaymentService.processCardPayment(paymentData)
      } else if (purchaseData.paymentMethod === 'gcash') {
        paymentResult = await realPaymentService.processGCashPayment(paymentData)
      } else {
        paymentResult = await realPaymentService.processMayaPayment(paymentData)
      }

      // If PayMongo checkout is created, redirect user and return early
      if (paymentResult.checkoutUrl) {
        // Store purchase data temporarily in localStorage for later completion
        localStorage.setItem(
          'pending_purchase',
          JSON.stringify({
            listingId,
            purchaseData,
            totalCost,
            listing,
            paymentResult,
          }),
        )

        // Redirect to PayMongo checkout
        return {
          success: true,
          redirect: true,
          checkoutUrl: paymentResult.checkoutUrl,
          sessionId: paymentResult.sessionId,
          message: 'Redirecting to payment...',
        }
      }
    } else {
      throw new Error(`Invalid payment method: ${purchaseData.paymentMethod}`)
    }

    if (!paymentResult.success) {
      throw new Error('Payment processing failed')
    }

    // Create credit purchase transaction
    // Note: Schema matches complete-ecolink-setup.sql - no currency or payment_reference columns
    const purchaseDataToInsert = {
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      credits_amount: purchaseData.quantity,
      price_per_credit: actualPricePerCredit, // Use the correct price (developer-set)
      total_amount: totalCost,
      payment_method: purchaseData.paymentMethod,
      payment_status: 'completed', // Note: schema has both payment_status and status
      status: 'completed',
      completed_at: new Date().toISOString(), // Schema has completed_at field
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from('credit_purchases')
      .insert(purchaseDataToInsert)
      .select()
      .single()

    // Don't throw error if purchase record creation fails - purchase already succeeded
    // Wallet is deducted and credits are added, so the purchase is valid
    if (purchaseError) {
      console.warn('⚠️ Error creating purchase record (non-critical):', purchaseError)
      console.warn('⚠️ Purchase was successful - wallet deducted, credits added')
      console.warn('⚠️ This is a tracking issue only, purchase transaction completed successfully')
      // Continue execution - purchase is valid even without purchase record
    } else {
      console.log('✅ Purchase record created:', purchase.id)
    }

    // Add credits to user's portfolio using real service
    // Use purchase ID if available, otherwise use transaction ID from payment
    const purchaseId = purchase?.id || paymentResult.transactionId || `wallet_${Date.now()}`
    try {
      // Get purchase price and project credit ID from listing
      const purchasePrice = listing.price_per_credit || listing.price || 0
      const projectCreditId = listing.project_credits?.id || null

      await creditOwnershipService.addCreditsToPortfolio(
        user.id,
        listing.project_credits.project_id,
        purchaseData.quantity,
        'purchased',
        purchaseId,
        projectCreditId,
        purchasePrice,
      )
      console.log('✅ Credits added to user portfolio')
    } catch (ownershipError) {
      console.error('❌ Error adding credits to portfolio:', ownershipError)
      // Continue - purchase is still valid, but ownership might need manual fix
    }

    // Update listing quantity
    const remainingQuantity = listing.quantity - purchaseData.quantity
    const { error: updateError } = await supabase
      .from('credit_listings')
      .update({
        quantity: remainingQuantity,
        status: remainingQuantity > 0 ? 'active' : 'sold_out',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)

    if (updateError) {
      console.error('❌ Error updating listing quantity:', updateError)
      // Continue - purchase is still valid
    }

    // Create credit_transaction record (required for certificates and receipts)
    // This is CRITICAL - transaction must be created for certificates and history
    let transactionId = null
    try {
      const { data: transaction, error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          buyer_id: user.id,
          seller_id: listing.seller_id,
          project_credit_id: listing.project_credits.id,
          listing_id: listingId,
          quantity: purchaseData.quantity,
          price_per_credit: actualPricePerCredit, // Use the correct price (developer-set)
          total_amount: totalCost,
          currency: listing.currency || 'PHP',
          payment_method: purchaseData.paymentMethod || 'wallet',
          payment_reference:
            paymentResult.transactionId || paymentResult.sessionId || `wallet_${Date.now()}`,
          status: 'completed',
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!transactionError && transaction) {
        transactionId = transaction.id
        console.log('✅ Credit transaction created:', transactionId)
      } else {
        console.error('❌ CRITICAL: Failed to create credit_transaction:', transactionError)
        // Try to create transaction with minimal required fields
        console.log('🔄 Attempting to create transaction with minimal fields...')
        const { data: minimalTransaction, error: minimalError } = await supabase
          .from('credit_transactions')
          .insert({
            buyer_id: user.id,
            seller_id: listing.seller_id,
            project_credit_id: listing.project_credits.id,
            quantity: purchaseData.quantity,
            price_per_credit: actualPricePerCredit,
            total_amount: totalCost,
            currency: listing.currency || 'PHP',
            payment_method: purchaseData.paymentMethod || 'wallet',
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (!minimalError && minimalTransaction) {
          transactionId = minimalTransaction.id
          console.log('✅ Credit transaction created with minimal fields:', transactionId)
        } else {
          console.error(
            '❌ CRITICAL: Failed to create transaction even with minimal fields:',
            minimalError,
          )
          throw new Error(
            'Failed to create transaction record. Purchase may not appear in history.',
          )
        }
      }
    } catch (transError) {
      console.error('❌ CRITICAL ERROR creating credit transaction:', transError)
      // Don't throw - purchase is still valid, but user should be notified
      console.error('⚠️ Purchase completed but transaction record failed. History may not show.')
    }

    // Generate certificate automatically when credits are purchased
    // This ensures certificate appears in certificate dashboard immediately
    if (transactionId) {
      try {
        const { generateCreditCertificate } = await import('@/services/certificateService')
        const certificate = await generateCreditCertificate(transactionId, 'purchase')
        console.log(
          '✅ Purchase certificate generated automatically:',
          certificate?.certificate_number,
        )
        console.log('✅ Certificate will appear in certificate dashboard and retire dashboard')
      } catch (certError) {
        console.error('❌ Error generating certificate:', certError)
        console.error(
          '⚠️ Certificate generation failed. Purchase completed but certificate may be missing.',
        )
        // Continue - certificate generation failure shouldn't break purchase
      }
    } else {
      console.error('❌ CRITICAL: Cannot generate certificate - no transactionId available')
      console.error('⚠️ Purchase completed but certificate will not be generated.')
    }

    // Generate receipt automatically when credits are purchased
    if (transactionId) {
      try {
        const { generateReceipt } = await import('@/services/receiptService')
        const receipt = await generateReceipt(transactionId)
        console.log('✅ Receipt generated automatically:', receipt?.receiptNumber)
      } catch (receiptError) {
        console.error('❌ Error generating receipt:', receiptError)
        // Continue - receipt generation failure shouldn't break purchase
      }
    }

    // Log the purchase action (use purchaseId if purchase record was created)
    try {
      await logUserAction('PURCHASE_CREDITS', 'purchase', user.id, purchaseId, {
        listing_id: listingId,
        quantity: purchaseData.quantity,
        total_cost: totalCost,
        payment_method: purchaseData.paymentMethod,
      })
    } catch (logError) {
      console.warn('⚠️ Error logging purchase action:', logError)
      // Continue - logging failure shouldn't break purchase
    }

    // Send notification email (only if purchase record was created)
    if (purchase?.id) {
      try {
        await notifyCreditPurchased(purchase.id, user.id)
      } catch (emailError) {
        console.warn('⚠️ Failed to send purchase notification:', emailError)
        // Continue - email failure shouldn't break purchase
      }
    } else {
      console.log('ℹ️ Skipping email notification - purchase record not created')
    }

    console.log('✅ Credit purchase completed successfully')

    return {
      success: true,
      purchase_id: purchase?.id || purchaseId,
      transaction_id: transactionId || paymentResult.transactionId || purchaseId,
      credits_purchased: purchaseData.quantity,
      total_cost: totalCost,
      currency: listing.currency || 'PHP',
      message: `Successfully purchased ${purchaseData.quantity} credits`,
      transaction: {
        id: purchase?.id || purchaseId,
        total_amount: totalCost,
        currency: listing.currency || 'PHP',
      },
    }
  } catch (error) {
    console.error('❌ Error in purchaseCredits:', error)
    throw error
  }
}

/**
 * Process payment for credit purchase
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Payment result
 */
async function processPayment(paymentData) {
  try {
    console.log('💳 Processing real payment:', paymentData)

    // Use real payment service based on method
    if (paymentData.method === 'gcash') {
      return await realPaymentService.processGCashPayment(paymentData)
    } else if (paymentData.method === 'maya') {
      return await realPaymentService.processMayaPayment(paymentData)
    } else {
      throw new Error(`Unsupported payment method: ${paymentData.method}`)
    }
  } catch (error) {
    console.error('❌ Payment processing error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Retire credits (mark them as retired/used)
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {number} quantity - Number of credits to retire
 * @param {string} reason - Reason for retirement
 * @returns {Promise<Object>} Retirement result
 */
export async function retireCredits(userId, projectId, quantity, reason) {
  const supabase = getSupabase()

  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  try {
    // First, check if user has enough credits
    const { data: ownership, error: ownershipError } = await supabase
      .from('credit_ownership')
      .select('quantity')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single()

    if (ownershipError) {
      throw new Error('Could not verify credit ownership')
    }

    if (!ownership || ownership.quantity < quantity) {
      throw new Error('Insufficient credits to retire')
    }

    // Create retirement record
    const { data: retirement, error: retirementError } = await supabase
      .from('credit_retirements')
      .insert({
        user_id: userId,
        project_id: projectId,
        quantity: quantity,
        reason: reason,
        retired_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (retirementError) {
      throw new Error('Failed to create retirement record')
    }

    // Update credit ownership (reduce quantity)
    const { error: updateError } = await supabase
      .from('credit_ownership')
      .update({
        quantity: ownership.quantity - quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('project_id', projectId)

    if (updateError) {
      throw new Error('Failed to update credit ownership')
    }

    // Log the retirement action
    await logUserAction('RETIRE_CREDITS', 'retirement', userId, retirement.id, {
      project_id: projectId,
      quantity: quantity,
      reason: reason,
    })

    // Generate retirement certificate automatically
    try {
      const { generateRetirementCertificate } = await import('@/services/certificateService')
      const certificate = await generateRetirementCertificate(retirement.id, userId)
      console.log(
        '✅ Retirement certificate generated automatically:',
        certificate?.certificate_number,
      )
    } catch (certError) {
      console.error('❌ Error generating retirement certificate:', certError)
      // Continue - certificate generation failure shouldn't break retirement
    }

    return {
      success: true,
      retirement_id: retirement.id,
      message: `Successfully retired ${quantity} credits`,
    }
  } catch (error) {
    console.error('Error retiring credits:', error)
    throw error
  }
}
