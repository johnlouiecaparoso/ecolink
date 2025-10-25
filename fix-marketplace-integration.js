// Senior Developer Solution: Fix Marketplace Integration
// Ensure approved projects are properly displayed to users for purchase

// Update the marketplace service to properly query approved projects
export async function getMarketplaceListings(filters = {}) {
  const supabase = getSupabase()

  if (!supabase) {
    console.warn('Supabase client not initialized, using sample data')
    return getSampleMarketplaceListings(filters)
  }

  try {
    // Skip database calls if disabled
    if (!USE_DATABASE) {
      console.log('Database disabled, using sample data')
      return getSampleMarketplaceListings(filters)
    }

    // Get marketplace listings for APPROVED projects only
    let query = supabase
      .from('credit_listings')
      .select(
        `
        *,
        project_credits!inner(
          *,
          projects!inner(
            id,
            title,
            description,
            category,
            location,
            status
          )
        ),
        profiles!seller_id(full_name)
      `,
      )
      .eq('status', 'active')
      .eq('project_credits.projects.status', 'approved') // Only approved projects
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.category) {
      query = query.eq('project_credits.projects.category', filters.category)
    }
    if (filters.minPrice) {
      query = query.gte('price_per_credit', filters.minPrice)
    }
    if (filters.maxPrice) {
      query = query.lte('price_per_credit', filters.maxPrice)
    }
    if (filters.location) {
      query = query.ilike('project_credits.projects.location', `%${filters.location}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching marketplace listings:', error)
      throw error
    }

    // Transform data for frontend consumption
    const transformedListings = (data || []).map((listing) => ({
      id: listing.id,
      listing_id: listing.id,
      project_id: listing.project_credits.projects.id,
      project_title: listing.project_credits.projects.title,
      project_description: listing.project_credits.projects.description,
      project_category: listing.project_credits.projects.category,
      project_location: listing.project_credits.projects.location,
      project_status: listing.project_credits.projects.status,
      title: listing.title,
      description: listing.description,
      quantity: listing.quantity,
      available_quantity: listing.quantity,
      price_per_credit: listing.price_per_credit,
      currency: listing.currency,
      listing_type: listing.listing_type,
      status: listing.status,
      category: listing.category,
      location: listing.location,
      vintage_year: listing.vintage_year,
      verification_standard: listing.verification_standard,
      seller_name: listing.profiles.full_name,
      seller_id: listing.seller_id,
      total_credits: listing.project_credits.total_credits,
      credits_available: listing.project_credits.credits_available,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
    }))

    console.log(
      `✅ Loaded ${transformedListings.length} marketplace listings for approved projects`,
    )
    return transformedListings
  } catch (error) {
    console.error('Error fetching marketplace listings:', error)
    throw error
  }
}

// Update marketplace stats to reflect real data
export async function getMarketplaceStats() {
  const supabase = getSupabase()

  if (!supabase) {
    return {
      totalListings: 0,
      totalCredits: 0,
      averagePrice: 0,
      categories: [],
    }
  }

  try {
    // Get stats for approved projects only
    const { data: listings, error } = await supabase
      .from('credit_listings')
      .select(
        `
        quantity,
        price_per_credit,
        category,
        project_credits!inner(
          projects!inner(status)
        )
      `,
      )
      .eq('status', 'active')
      .eq('project_credits.projects.status', 'approved')

    if (error) {
      console.error('Error fetching marketplace stats:', error)
      return {
        totalListings: 0,
        totalCredits: 0,
        averagePrice: 0,
        categories: [],
      }
    }

    const totalListings = listings.length
    const totalCredits = listings.reduce((sum, listing) => sum + (listing.quantity || 0), 0)
    const totalValue = listings.reduce(
      (sum, listing) => sum + (listing.quantity || 0) * (listing.price_per_credit || 0),
      0,
    )
    const averagePrice = totalCredits > 0 ? totalValue / totalCredits : 0

    // Get category distribution
    const categoryCount = {}
    listings.forEach((listing) => {
      const category = listing.category || 'Other'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    const categories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return {
      totalListings,
      totalCredits,
      averagePrice: Math.round(averagePrice * 100) / 100,
      categories,
    }
  } catch (error) {
    console.error('Error calculating marketplace stats:', error)
    return {
      totalListings: 0,
      totalCredits: 0,
      averagePrice: 0,
      categories: [],
    }
  }
}

// Ensure the marketplace view properly loads real data
export function initializeMarketplace() {
  console.log('🛒 Initializing marketplace with real approved projects...')

  // Load marketplace data
  return Promise.all([getMarketplaceListings(), getMarketplaceStats()])
    .then(([listings, stats]) => {
      console.log(
        `✅ Marketplace initialized: ${listings.length} listings, ${stats.totalCredits} credits available`,
      )
      return { listings, stats }
    })
    .catch((error) => {
      console.error('❌ Failed to initialize marketplace:', error)
      throw error
    })
}






