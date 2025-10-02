import { getSupabase } from '@/services/supabaseClient'
import { generateCreditCertificate } from '@/services/certificateService'
import { logUserAction } from '@/services/auditService'
import { notifyCreditPurchased } from '@/services/emailService'
import { paymentService } from '@/services/paymentService'
import { USE_DATABASE } from '@/config/database'

/**
 * Get all active marketplace listings with project details
 */
export async function getMarketplaceListings(filters = {}) {
  // Skip database calls if disabled
  if (!USE_DATABASE) {
    console.log('Database disabled, using sample data for marketplace listings')
    return getSampleMarketplaceListings(filters)
  }

  const supabase = getSupabase()

  try {
    // Try to get from credit_listings with project details
    let query = supabase
      .from('credit_listings')
      .select(
        `
        *,
        project_credits!inner(
          *,
          projects!inner(
            title,
            description,
            category,
            location,
            status
          )
        ),
        seller:profiles!credit_listings_seller_id_fkey(full_name)
      `,
      )
      .eq('status', 'active')
      .order('listed_at', { ascending: false })

    const { data: listings, error } = await query

    if (error) {
      console.error('Error fetching marketplace listings:', error)

      // If tables don't exist, return sample data immediately
      if (error.message && error.message.includes('does not exist')) {
        console.warn('Database tables do not exist yet, returning sample data')
        return getSampleMarketplaceListings(filters)
      }

      // For any other error, also return sample data
      console.warn('Database error, falling back to sample data')
      return getSampleMarketplaceListings(filters)
    }

    // If no data returned, use sample data
    if (!listings || listings.length === 0) {
      console.warn('No listings found in database, returning sample data')
      return getSampleMarketplaceListings(filters)
    }

    // Transform the data to match the expected format
    const transformedListings = listings.map((listing) => ({
      listing_id: listing.id,
      project_id: listing.project_credits.projects.id,
      project_title: listing.project_credits.projects.title,
      project_description: listing.project_credits.projects.description,
      category: listing.project_credits.projects.category,
      location: listing.project_credits.projects.location,
      vintage_year: listing.project_credits.vintage_year,
      verification_standard: listing.project_credits.verification_standard,
      available_quantity: listing.quantity,
      price_per_credit: listing.price_per_credit,
      currency: listing.currency,
      seller_name: listing.seller.full_name,
      listed_at: listing.listed_at,
    }))

    // Apply filters to transformed data
    return applyFiltersToListings(transformedListings, filters)
  } catch (error) {
    console.error('Error in getMarketplaceListings:', error)
    // Always return sample data as fallback for better UX
    return getSampleMarketplaceListings(filters)
  }
}

/**
 * Apply filters to listings array
 */
function applyFiltersToListings(listings, filters) {
  let filtered = [...listings]

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
        listing.project_title.toLowerCase().includes(searchTerm) ||
        listing.project_description.toLowerCase().includes(searchTerm) ||
        listing.location.toLowerCase().includes(searchTerm),
    )
  }

  return filtered
}

/**
 * Get sample marketplace listings for demo purposes
 */
function getSampleMarketplaceListings(filters = {}) {
  const sampleListings = [
    {
      listing_id: 'demo-1',
      project_id: 'proj-1',
      project_title: 'Amazon Rainforest Protection Initiative',
      project_description:
        'Protecting 10,000 hectares of primary rainforest in the Amazon basin through community-based conservation efforts. This project prevents deforestation and supports local indigenous communities.',
      category: 'Forestry',
      location: 'Brazil',
      vintage_year: 2024,
      verification_standard: 'VCS',
      available_quantity: 5000,
      price_per_credit: 15.5,
      currency: 'USD',
      seller_name: 'Rainforest Conservation Trust',
      listed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      project_image:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      co_benefits: ['Biodiversity protection', 'Community development', 'Water conservation'],
      certification_status: 'Verified',
    },
    {
      listing_id: 'demo-2',
      project_id: 'proj-2',
      project_title: 'Solar Power Plant - Kenya',
      project_description:
        'Construction and operation of a 50MW solar photovoltaic power plant in Kenya.',
      category: 'Renewable Energy',
      location: 'Kenya',
      vintage_year: 2024,
      verification_standard: 'Gold Standard',
      available_quantity: 3000,
      price_per_credit: 22.0,
      currency: 'USD',
      seller_name: 'Clean Energy Kenya',
      listed_at: new Date().toISOString(),
    },
    {
      listing_id: 'demo-3',
      project_id: 'proj-3',
      project_title: 'Mangrove Restoration - Philippines',
      project_description: 'Restoration of degraded mangrove ecosystems in the Philippines.',
      category: 'Blue Carbon',
      location: 'Philippines',
      vintage_year: 2024,
      verification_standard: 'VCS',
      available_quantity: 2000,
      price_per_credit: 18.75,
      currency: 'USD',
      seller_name: 'Ocean Conservation PH',
      listed_at: new Date().toISOString(),
    },
    {
      listing_id: 'demo-4',
      project_id: 'proj-4',
      project_title: 'Energy Efficiency - India',
      project_description:
        'LED lighting replacement program across 100,000 households in rural India. This project reduces electricity consumption and improves living conditions.',
      category: 'Energy Efficiency',
      location: 'India',
      vintage_year: 2024,
      verification_standard: 'Gold Standard',
      available_quantity: 4000,
      price_per_credit: 12.25,
      currency: 'USD',
      seller_name: 'Sustainable India Foundation',
      listed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      project_image:
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      co_benefits: ['Energy savings', 'Cost reduction', 'Improved lighting'],
      certification_status: 'Verified',
    },
    {
      listing_id: 'demo-5',
      project_id: 'proj-5',
      project_title: 'Wind Farm - Scotland',
      project_description:
        "Offshore wind energy project generating 200MW of clean electricity for Scotland. This project contributes to the UK's net-zero targets.",
      category: 'Renewable Energy',
      location: 'Scotland',
      vintage_year: 2024,
      verification_standard: 'VCS',
      available_quantity: 8000,
      price_per_credit: 14.5,
      currency: 'USD',
      seller_name: 'Scottish Wind Energy Co.',
      listed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      project_image:
        'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
      co_benefits: ['Clean energy', 'Job creation', 'Energy security'],
      certification_status: 'Verified',
    },
    {
      listing_id: 'demo-6',
      project_id: 'proj-6',
      project_title: 'Reforestation - Indonesia',
      project_description:
        'Large-scale reforestation project planting 1 million trees across degraded lands in Indonesia. This project restores ecosystems and sequesters carbon.',
      category: 'Forestry',
      location: 'Indonesia',
      vintage_year: 2024,
      verification_standard: 'VCS',
      available_quantity: 6000,
      price_per_credit: 16.8,
      currency: 'USD',
      seller_name: 'Indonesian Forest Alliance',
      listed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      project_image:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      co_benefits: ['Ecosystem restoration', 'Biodiversity', 'Soil protection'],
      certification_status: 'Verified',
    },
    {
      listing_id: 'demo-7',
      project_id: 'proj-7',
      project_title: 'Biogas - Vietnam',
      project_description:
        'Community biogas digesters converting agricultural waste to clean cooking fuel. This project reduces methane emissions and improves air quality.',
      category: 'Waste Management',
      location: 'Vietnam',
      vintage_year: 2024,
      verification_standard: 'Gold Standard',
      available_quantity: 2500,
      price_per_credit: 11.2,
      currency: 'USD',
      seller_name: 'Vietnam Green Energy',
      listed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      project_image:
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      co_benefits: ['Waste reduction', 'Clean cooking', 'Health improvement'],
      certification_status: 'Verified',
    },
    {
      listing_id: 'demo-8',
      project_id: 'proj-8',
      project_title: 'Hydroelectric - Nepal',
      project_description:
        'Small-scale hydroelectric project providing renewable energy to remote mountain communities in Nepal. This project supports sustainable development.',
      category: 'Renewable Energy',
      location: 'Nepal',
      vintage_year: 2024,
      verification_standard: 'Gold Standard',
      available_quantity: 1500,
      price_per_credit: 13.75,
      currency: 'USD',
      seller_name: 'Himalayan Power Co.',
      listed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      project_image:
        'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
      co_benefits: ['Clean energy', 'Community development', 'Water management'],
      certification_status: 'Verified',
    },
    {
      listing_id: 'demo-9',
      project_id: 'proj-9',
      project_title: 'Wind Farm Development - Mexico',
      project_description:
        'Construction of a 100MW wind farm in Oaxaca, Mexico to replace fossil fuel electricity generation.',
      category: 'Renewable Energy',
      location: 'Mexico',
      vintage_year: 2024,
      verification_standard: 'VCS',
      available_quantity: 6000,
      price_per_credit: 19.5,
      currency: 'USD',
      seller_name: 'Green Energy Mexico',
      listed_at: new Date().toISOString(),
    },
    {
      listing_id: 'demo-6',
      project_id: 'proj-6',
      project_title: 'Forest Conservation - Indonesia',
      project_description:
        'Protection of 15,000 hectares of tropical forest in Sumatra to prevent deforestation.',
      category: 'Forestry',
      location: 'Indonesia',
      vintage_year: 2024,
      verification_standard: 'Gold Standard',
      available_quantity: 8000,
      price_per_credit: 16.75,
      currency: 'USD',
      seller_name: 'Sumatra Forest Trust',
      listed_at: new Date().toISOString(),
    },
    {
      listing_id: 'demo-7',
      project_id: 'proj-7',
      project_title: 'Biogas Production - Vietnam',
      project_description:
        'Installation of biogas digesters in rural communities to replace traditional cooking fuels.',
      category: 'Energy Efficiency',
      location: 'Vietnam',
      vintage_year: 2024,
      verification_standard: 'Gold Standard',
      available_quantity: 3500,
      price_per_credit: 14.25,
      currency: 'USD',
      seller_name: 'Clean Cooking Vietnam',
      listed_at: new Date().toISOString(),
    },
    {
      listing_id: 'demo-8',
      project_id: 'proj-8',
      project_title: 'Seagrass Restoration - Australia',
      project_description:
        'Restoration of seagrass meadows along the Great Barrier Reef to sequester carbon and protect marine life.',
      category: 'Blue Carbon',
      location: 'Australia',
      vintage_year: 2024,
      verification_standard: 'VCS',
      available_quantity: 2500,
      price_per_credit: 24.5,
      currency: 'USD',
      seller_name: 'Marine Conservation Australia',
      listed_at: new Date().toISOString(),
    },
  ]

  return applyFiltersToListings(sampleListings, filters)
}

/**
 * Get a specific marketplace listing by ID
 */
export async function getMarketplaceListing(listingId) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('listing_id', listingId)
      .single()

    if (error) {
      console.error('Error fetching marketplace listing:', error)
      throw new Error('Failed to fetch marketplace listing')
    }

    return data
  } catch (error) {
    console.error('Error in getMarketplaceListing:', error)
    throw error
  }
}

/**
 * Create a new credit listing
 */
export async function createCreditListing(listingData) {
  const supabase = getSupabase()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('credit_listings')
      .insert({
        project_credit_id: listingData.projectCreditId,
        seller_id: user.id,
        quantity: listingData.quantity,
        price_per_credit: listingData.pricePerCredit,
        currency: listingData.currency || 'USD',
        listing_type: 'sell',
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating credit listing:', error)
      throw new Error('Failed to create credit listing')
    }

    // Log the action
    await logUserAction('CREDIT_LISTING_CREATED', 'credit_listing', user.id, data.id, {
      quantity: listingData.quantity,
      price_per_credit: listingData.pricePerCredit,
      currency: listingData.currency,
    })

    return data
  } catch (error) {
    console.error('Error in createCreditListing:', error)
    throw error
  }
}

/**
 * Purchase credits from a listing
 */
export async function purchaseCredits(listingId, purchaseData) {
  const supabase = getSupabase()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if this is a demo listing
    if (listingId.startsWith('demo-')) {
      return handleDemoPurchase(listingId, purchaseData, user.id)
    }

    // Get the listing details
    const { data: listing, error: listingError } = await supabase
      .from('credit_listings')
      .select(
        `
        *,
        project_credits!inner(*)
      `,
      )
      .eq('id', listingId)
      .eq('status', 'active')
      .single()

    if (listingError || !listing) {
      throw new Error('Listing not found or no longer available')
    }

    // Validate purchase quantity
    if (purchaseData.quantity > listing.quantity) {
      throw new Error('Insufficient credits available')
    }

    if (purchaseData.quantity <= 0) {
      throw new Error('Invalid purchase quantity')
    }

    // Calculate total amount and platform fee
    const totalAmount = purchaseData.quantity * listing.price_per_credit
    const platformFeePercentage = 2.5 // 2.5% platform fee
    const platformFee = totalAmount * (platformFeePercentage / 100)

    // Create credit transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        project_credit_id: listing.project_credit_id,
        quantity: purchaseData.quantity,
        price_per_credit: listing.price_per_credit,
        total_amount: totalAmount,
        currency: listing.currency,
        payment_method: purchaseData.paymentMethod || 'wallet',
        payment_reference: purchaseData.paymentReference,
        status: 'pending',
        platform_fee_percentage: platformFeePercentage,
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating credit transaction:', transactionError)
      throw new Error('Failed to create transaction')
    }

    // Log the action
    await logUserAction(
      'CREDIT_PURCHASE_INITIATED',
      'credit_transaction',
      user.id,
      transaction.id,
      {
        listing_id: listingId,
        quantity: purchaseData.quantity,
        total_amount: totalAmount,
        currency: listing.currency,
      },
    )

    // Create payment record if payment data is provided
    let paymentRecord = null
    if (purchaseData.paymentData) {
      try {
        paymentRecord = await paymentService.recordTransaction({
          userId: user.id,
          transactionId: transaction.id,
          amount: totalAmount,
          credits: purchaseData.quantity,
          provider: purchaseData.paymentData.provider,
          status: 'pending',
        })
      } catch (paymentError) {
        console.error('Error creating payment record:', paymentError)
        // Don't fail the transaction if payment record creation fails
      }
    }

    // If no payment data provided, simulate successful payment (for testing)
    if (!purchaseData.paymentData) {
      await completeCreditTransaction(transaction.id)
    }

    return {
      transaction,
      paymentRecord,
      requiresPayment: !!purchaseData.paymentData,
    }
  } catch (error) {
    console.error('Error in purchaseCredits:', error)
    throw error
  }
}

/**
 * Handle demo purchases (for testing without database)
 */
function handleDemoPurchase(listingId, purchaseData, userId) {
  // Get demo listing data
  const demoListings = getSampleMarketplaceListings()
  const listing = demoListings.find((l) => l.listing_id === listingId)

  if (!listing) {
    throw new Error('Demo listing not found')
  }

  // Validate purchase quantity
  if (purchaseData.quantity > listing.available_quantity) {
    throw new Error('Insufficient credits available')
  }

  if (purchaseData.quantity <= 0) {
    throw new Error('Invalid purchase quantity')
  }

  // Calculate total amount and platform fee
  const totalAmount = purchaseData.quantity * listing.price_per_credit * 1.025 // Include 2.5% platform fee
  const platformFeePercentage = 2.5

  // Create mock transaction
  const transaction = {
    id: `demo_tx_${Date.now()}`,
    listing_id: listingId,
    buyer_id: userId,
    seller_id: 'demo_seller',
    project_credit_id: 'demo_credit',
    quantity: purchaseData.quantity,
    price_per_credit: listing.price_per_credit,
    total_amount: totalAmount,
    currency: listing.currency,
    payment_method: purchaseData.paymentMethod || 'demo',
    status: 'completed',
    platform_fee_percentage: platformFeePercentage,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    project_credits: {
      projects: {
        title: listing.project_title,
        category: listing.category,
        location: listing.location,
      },
    },
  }

  console.log('Demo purchase completed:', transaction)

  return {
    transaction,
    paymentRecord: null,
    requiresPayment: false,
  }
}

/**
 * Complete a credit transaction (called after successful payment)
 */
export async function completeCreditTransaction(transactionId) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single()

    if (error) {
      console.error('Error completing credit transaction:', error)
      throw new Error('Failed to complete transaction')
    }

    // Generate certificate for the credit purchase
    try {
      await generateCreditCertificate(transactionId, 'purchase')
      console.log('Certificate generated successfully for transaction:', transactionId)
    } catch (certError) {
      console.error('Error generating certificate:', certError)
      // Don't fail the entire operation if certificate generation fails
    }

    // Send credit purchase notification email
    try {
      await notifyCreditPurchased(transactionId, data.buyer_id)
      console.log('Credit purchase notification sent')
    } catch (emailError) {
      console.error('Error sending credit purchase notification:', emailError)
      // Don't fail the entire operation if email sending fails
    }

    // Log the action
    await logUserAction(
      'CREDIT_PURCHASE_COMPLETED',
      'credit_transaction',
      data.buyer_id,
      transactionId,
      {
        quantity: data.quantity,
        total_amount: data.total_amount,
      },
    )

    return data
  } catch (error) {
    console.error('Error in completeCreditTransaction:', error)
    throw error
  }
}

/**
 * Get user's credit portfolio
 */
export async function getUserCreditPortfolio(userId) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('user_credit_portfolio')
      .select('*')
      .eq('user_id', userId)
      .eq('ownership_status', 'owned')
      .order('purchase_date', { ascending: false })

    if (error) {
      console.error('Error fetching user credit portfolio:', error)
      throw new Error('Failed to fetch credit portfolio')
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserCreditPortfolio:', error)
    throw error
  }
}

/**
 * Get user's credit transactions (both as buyer and seller)
 */
export async function getUserCreditTransactions(userId) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select(
        `
        *,
        project_credits!inner(
          *,
          projects!inner(title, category, location)
        )
      `,
      )
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user credit transactions:', error)
      throw new Error('Failed to fetch credit transactions')
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserCreditTransactions:', error)
    throw error
  }
}

/**
 * Retire credits (mark as retired for carbon offset)
 */
export async function retireCredits(ownershipId, retirementData) {
  const supabase = getSupabase()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Verify ownership
    const { data: ownership, error: ownershipError } = await supabase
      .from('credit_ownership')
      .select('*')
      .eq('id', ownershipId)
      .eq('user_id', user.id)
      .eq('status', 'owned')
      .single()

    if (ownershipError || !ownership) {
      throw new Error('Credit ownership not found')
    }

    // Update ownership status to retired
    const { data, error } = await supabase
      .from('credit_ownership')
      .update({
        status: 'retired',
        retired_at: new Date().toISOString(),
        retirement_reason: retirementData.reason || 'Carbon offset',
      })
      .eq('id', ownershipId)
      .select()
      .single()

    if (error) {
      console.error('Error retiring credits:', error)
      throw new Error('Failed to retire credits')
    }

    // Log the action
    await logUserAction('CREDITS_RETIRED', 'credit_ownership', user.id, ownershipId, {
      quantity: ownership.quantity,
      retirement_reason: retirementData.reason,
    })

    return data
  } catch (error) {
    console.error('Error in retireCredits:', error)
    throw error
  }
}

/**
 * Get marketplace statistics
 */
export async function getMarketplaceStats() {
  const supabase = getSupabase()

  try {
    // Get total active listings
    const { count: totalListings } = await supabase
      .from('credit_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get total credits available
    const { data: creditsData } = await supabase
      .from('credit_listings')
      .select('quantity, price_per_credit')
      .eq('status', 'active')

    const totalCreditsAvailable =
      creditsData?.reduce((sum, listing) => sum + parseFloat(listing.quantity), 0) || 0
    const totalMarketValue =
      creditsData?.reduce(
        (sum, listing) => sum + parseFloat(listing.quantity) * parseFloat(listing.price_per_credit),
        0,
      ) || 0

    // Get recent transactions count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentTransactions } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', thirtyDaysAgo.toISOString())

    return {
      totalListings: totalListings || 0,
      totalCreditsAvailable,
      totalMarketValue,
      recentTransactions: recentTransactions || 0,
    }
  } catch (error) {
    console.error('Error in getMarketplaceStats:', error)
    // Return sample stats as fallback
    return {
      totalListings: 8,
      totalCreditsAvailable: 35000,
      totalMarketValue: 650000,
      recentTransactions: 24,
    }
  }
}
