import { getSupabase } from '@/services/supabaseClient'
import { generateCreditCertificate } from '@/services/certificateService'
import { logUserAction } from '@/services/auditService'
import { notifyCreditPurchased } from '@/services/emailService'
import { createPaymentRecord, updatePaymentRecord } from '@/services/paymentService'

/**
 * Get all active marketplace listings with project details
 */
export async function getMarketplaceListings(filters = {}) {
  const supabase = getSupabase()

  try {
    // First try to use the view
    let query = supabase
      .from('marketplace_listings')
      .select('*')
      .order('listed_at', { ascending: false })

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    if (filters.country) {
      query = query.ilike('location', `%${filters.country}%`)
    }

    if (filters.minPrice) {
      query = query.gte('price_per_credit', filters.minPrice)
    }

    if (filters.maxPrice) {
      query = query.lte('price_per_credit', filters.maxPrice)
    }

    if (filters.search) {
      query = query.or(
        `project_title.ilike.%${filters.search}%,project_description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`,
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching marketplace listings:', error)
      console.error('Full error details:', JSON.stringify(error, null, 2))

      // If the view doesn't exist, return empty array
      if (error.message && error.message.includes('does not exist')) {
        console.warn('marketplace_listings view does not exist yet, returning empty array')
        return []
      }

      throw new Error(`Failed to fetch marketplace listings: ${error.message || 'Unknown error'}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getMarketplaceListings:', error)
    throw error
  }
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
        paymentRecord = await createPaymentRecord({
          userId: user.id,
          transactionId: transaction.id,
          amount: totalAmount,
          currency: listing.currency,
          provider: purchaseData.paymentData.provider,
          paymentMethod: purchaseData.paymentData.paymentMethod,
          status: 'pending',
          paymentIntentId: purchaseData.paymentData.paymentIntentId,
          metadata: {
            credits: purchaseData.quantity,
            listing_id: listingId,
            project_title: listing.project_credits?.projects?.title || 'Unknown Project',
          },
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
    throw error
  }
}
