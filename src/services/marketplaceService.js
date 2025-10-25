import { getSupabase } from '@/services/supabaseClient'
import { logUserAction } from '@/services/auditService'
import { notifyCreditPurchased } from '@/services/emailService'
// import { realPaymentService } from '@/services/realPaymentService'
// Mock payment service for development
const realPaymentService = {
  processGCashPayment: async (data) => {
    console.log('Mock GCash payment:', data)
    return { success: true, transactionId: 'mock_gcash_' + Date.now() }
  },
  processMayaPayment: async (data) => {
    console.log('Mock Maya payment:', data)
    return { success: true, transactionId: 'mock_maya_' + Date.now() }
  },
}
import { creditOwnershipService } from '@/services/creditOwnershipService'

/**
 * Get all active marketplace listings with project details
 * Real data implementation with proper error handling
 */
export async function getMarketplaceListings(filters = {}) {
  const supabase = getSupabase()

  if (!supabase) {
    console.warn('Supabase client not initialized')
    return []
  }

  try {
    console.log('🔍 Fetching marketplace listings with filters:', filters)

    // Step 1: Get credit listings (this works reliably)
    const { data: listings, error: listingsError } = await supabase
      .from('credit_listings')
      .select('*')
      .eq('status', 'active')

    if (listingsError) {
      console.error('❌ Error fetching credit listings:', listingsError)
      throw listingsError
    }

    console.log('✅ Found', listings?.length || 0, 'credit listings')

    if (!listings || listings.length === 0) {
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

    // Step 3: Get projects for these credits
    const projectIds = credits?.map((c) => c.project_id).filter(Boolean) || []
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)
      .eq('status', 'approved') // Only approved projects

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      throw projectsError
    }

    console.log('✅ Found', projects?.length || 0, 'approved projects')

    // Step 4: Get seller names
    const sellerIds = [...new Set(listings.map((l) => l.seller_id).filter(Boolean))]
    const { data: sellers } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', sellerIds)

    const sellerMap = new Map(sellers?.map((seller) => [seller.id, seller.full_name]) || [])

    // Step 5: Combine the data and deduplicate by project_credit_id
    const projectCreditMap = new Map()

    listings.forEach((listing) => {
      const credit = credits?.find((c) => c.id === listing.project_credit_id)
      const project = projects?.find((p) => p.id === credit?.project_id)

      if (!credit || !project) {
        return // Skip if missing data
      }

      const key = listing.project_credit_id

      // If we already have this project_credit_id, keep the most recent listing
      if (
        !projectCreditMap.has(key) ||
        new Date(listing.created_at) > new Date(projectCreditMap.get(key).listed_at)
      ) {
        projectCreditMap.set(key, {
          listing_id: listing.id,
          project_id: project.id,
          project_title: project.title,
          project_description: project.description,
          category: project.category,
          location: project.location,
          vintage_year: credit.vintage_year,
          verification_standard: credit.verification_standard,
          available_quantity: listing.quantity,
          price_per_credit: listing.price_per_credit,
          currency: listing.currency,
          seller_id: listing.seller_id,
          seller_name: sellerMap.get(listing.seller_id) || 'Unknown Seller',
          listed_at: listing.created_at,
          project_image: project.project_image,
          image_name: project.image_name,
          image_type: project.image_type,
          estimated_credits: project.estimated_credits,
          credit_price: project.credit_price,
        })
      }
    })

    const transformedListings = Array.from(projectCreditMap.values())

    console.log('✅ Transformed', transformedListings.length, 'listings for marketplace')

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
    const { data, error } = await supabase
      .from('credit_ownership')
      .select(
        `
        *,
        project_credits(
          *,
          projects(
            id,
            title,
            description,
            category,
            location,
            project_image
          )
        )
      `,
      )
      .eq('user_id', userId)
      .eq('ownership_status', 'owned')

    if (error) {
      console.error('Error fetching user credit portfolio:', error)
      throw error
    }

    return data || []
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

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

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
    if (purchaseData.quantity > listing.quantity) {
      throw new Error('Not enough credits available in this listing')
    }

    if (purchaseData.quantity <= 0) {
      throw new Error('Invalid purchase quantity')
    }

    // Calculate total cost
    const totalCost = listing.price_per_credit * purchaseData.quantity

    console.log('💰 Purchase details:', {
      quantity: purchaseData.quantity,
      pricePerCredit: listing.price_per_credit,
      totalCost,
      currency: listing.currency,
    })

    // Process real payment
    let paymentResult
    if (purchaseData.paymentMethod === 'gcash') {
      paymentResult = await realPaymentService.processGCashPayment({
        amount: totalCost,
        currency: listing.currency,
        description: `Purchase ${purchaseData.quantity} credits from ${listing.project_credits.projects.title}`,
        userId: user.id,
      })
    } else if (purchaseData.paymentMethod === 'maya') {
      paymentResult = await realPaymentService.processMayaPayment({
        amount: totalCost,
        currency: listing.currency,
        description: `Purchase ${purchaseData.quantity} credits from ${listing.project_credits.projects.title}`,
        userId: user.id,
      })
    } else {
      throw new Error('Invalid payment method')
    }

    if (!paymentResult.success) {
      throw new Error('Payment processing failed')
    }

    // Create credit purchase transaction
    const { data: purchase, error: purchaseError } = await supabase
      .from('credit_purchases')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        credits_amount: purchaseData.quantity,
        price_per_credit: listing.price_per_credit,
        total_amount: totalCost,
        currency: listing.currency,
        payment_method: purchaseData.paymentMethod,
        payment_reference: paymentResult.transactionId,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('❌ Error creating purchase record:', purchaseError)
      throw new Error('Failed to record purchase')
    }

    // Add credits to user's portfolio using real service
    try {
      await creditOwnershipService.addCreditsToPortfolio(
        user.id,
        listing.project_credits.project_id,
        purchaseData.quantity,
        'purchased',
        purchase.id,
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

    // Log the purchase action
    await logUserAction(user.id, 'purchase_credits', {
      listing_id: listingId,
      quantity: purchaseData.quantity,
      total_cost: totalCost,
      payment_method: purchaseData.paymentMethod,
    })

    // Send notification email
    try {
      await notifyCreditPurchased(purchase.id, user.id)
    } catch (emailError) {
      console.warn('⚠️ Failed to send purchase notification:', emailError)
      // Continue - email failure shouldn't break purchase
    }

    console.log('✅ Credit purchase completed successfully')

    return {
      success: true,
      purchase_id: purchase.id,
      transaction_id: paymentResult.transactionId,
      credits_purchased: purchaseData.quantity,
      total_cost: totalCost,
      currency: listing.currency,
      message: `Successfully purchased ${purchaseData.quantity} credits`,
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
    console.log('💳 Processing payment:', paymentData)

    // Simulate payment processing
    // In production, this would integrate with real payment gateways
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate processing time

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      success: true,
      transactionId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      method: paymentData.method,
      status: 'completed',
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
    await logUserAction(userId, 'retire_credits', {
      project_id: projectId,
      quantity: quantity,
      reason: reason,
    })

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
