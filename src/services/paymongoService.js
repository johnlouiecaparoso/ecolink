/**
 * PayMongo Service - Real Payment Integration
 * Integrates with PayMongo payment gateway for GCash, Maya, and Cards
 * 
 * NOTE: For production, set up Supabase Edge Functions to hide secret key
 * For now, we support direct API calls for development/testing
 */

import { getEnv } from '@/utils/env'

const PAYMONGO_CONFIG = {
  apiBaseUrl: 'https://api.paymongo.com/v1',
  publicKey: null,
  secretKey: null,
  isConfigured: false,
}

/**
 * Initialize PayMongo service
 */
export function initPayMongo() {
  try {
    PAYMONGO_CONFIG.publicKey = getEnv('VITE_PAYMONGO_PUBLIC_KEY', { optional: true })
    PAYMONGO_CONFIG.secretKey = getEnv('VITE_PAYMONGO_SECRET_KEY', { optional: true })
    PAYMONGO_CONFIG.isConfigured = !!(PAYMONGO_CONFIG.publicKey && PAYMONGO_CONFIG.secretKey)
    
    if (PAYMONGO_CONFIG.isConfigured) {
      console.log('✅ PayMongo service initialized')
      return true
    } else {
      console.warn('⚠️ PayMongo keys not configured, using mock mode')
      return false
    }
  } catch (error) {
    console.warn('⚠️ PayMongo initialization failed:', error)
    return false
  }
}

/**
 * Create a PayMongo Checkout Session
 * This returns a checkout URL that you redirect users to
 * 
 * @param {Object} sessionData - Checkout session details
 * @param {number} sessionData.amount - Amount in PHP (e.g., 100.00)
 * @param {string} sessionData.description - Payment description
 * @param {Object} sessionData.metadata - Additional metadata
 * @param {Array<string>} sessionData.paymentMethodTypes - Payment methods to enable
 * @returns {Promise<Object>} Checkout session with URL
 */
export async function createCheckoutSession(sessionData) {
  try {
    const { amount, description, metadata, paymentMethodTypes = ['card', 'gcash', 'paymaya'] } = sessionData
    
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    // If not configured, use mock mode
    if (!PAYMONGO_CONFIG.isConfigured) {
      console.warn('⚠️ PayMongo not configured, using mock checkout')
      return {
        success: true,
        sessionId: `mock_session_${Date.now()}`,
        checkoutUrl: `${window.location.origin}/payment/complete?mock=true&amount=${amount}`,
        amount: amount,
        currency: 'PHP',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      }
    }
    
    console.log('🔗 Creating PayMongo checkout session...')
    
    // Extract quantity and price per credit from metadata if available
    // metadata is already destructured from sessionData above
    const purchaseMetadata = metadata || {}
    const quantity = purchaseMetadata.quantity || 1
    const pricePerCredit = purchaseMetadata.price_per_credit || amount
    const projectTitle = purchaseMetadata.project_title || 'Carbon Credits'
    
    // Create detailed description with quantity and price info
    const detailedDescription = purchaseMetadata.quantity && purchaseMetadata.price_per_credit
      ? `${quantity} credit${quantity > 1 ? 's' : ''} @ ₱${pricePerCredit.toFixed(2)} each from ${projectTitle}`
      : (description || 'EcoLink Credit Purchase')
    
    // Create line items - show actual quantity and per-credit price if available
    const lineItems = purchaseMetadata.quantity && purchaseMetadata.price_per_credit
      ? [
          {
            name: `${projectTitle} - Carbon Credits`,
            quantity: quantity,
            amount: Math.round(pricePerCredit * 100), // Price per credit in centavos
            currency: 'PHP',
          }
        ]
      : [
          {
            name: description || 'EcoLink Carbon Credits',
            quantity: 1,
            amount: Math.round(amount * 100), // Total amount in centavos
            currency: 'PHP',
          }
        ]
    
    const checkoutData = {
      data: {
        attributes: {
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          description: detailedDescription,
          line_items: lineItems,
          payment_method_types: ['card', 'gcash', 'paymaya'],
          success_url: `${window.location.origin}/payment/callback`,
          cancel_url: `${window.location.origin}/marketplace?cancelled=true`,
        },
      },
    }
    
    console.log('📋 PayMongo checkout details:', {
      description: detailedDescription,
      quantity: quantity,
      price_per_credit: pricePerCredit,
      total_amount: amount,
      line_items: lineItems
    })
    
    // Call PayMongo API directly (secret key is in env, but should be in backend for production)
    if (!PAYMONGO_CONFIG.secretKey) {
      throw new Error('PayMongo secret key not configured. Please add VITE_PAYMONGO_SECRET_KEY to .env')
    }
    
    const response = await fetch(`${PAYMONGO_CONFIG.apiBaseUrl}/checkout_sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_CONFIG.secretKey + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ PayMongo checkout session error:', errorData)
      throw new Error(errorData.errors?.[0]?.detail || 'Failed to create checkout session')
    }
    
    const result = await response.json()
    
    console.log('✅ Checkout session created:', result.data.id)
    console.log('✅ Full session response:', JSON.stringify(result, null, 2))
    console.log('✅ Checkout URL:', result.data.attributes.checkout_url)
    
    return {
      success: true,
      sessionId: result.data.id,
      checkoutUrl: result.data.attributes.checkout_url,
      amount: amount,
      currency: 'PHP',
      expiresAt: result.data.attributes.expires_at,
    }
  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    throw error
  }
}

/**
 * Process a successful payment callback
 * This is called when user returns from PayMongo checkout
 * 
 * @param {string} sessionId - Checkout session ID
 * @returns {Promise<Object>} Payment result
 */
export async function processPaymentCallback(sessionId) {
  try {
    console.log('🔍 Processing payment callback for session:', sessionId)
    
    // If mock mode
    if (sessionId.startsWith('mock_')) {
      return {
        success: true,
        payment: {
          id: sessionId,
          amount: 0,
          currency: 'PHP',
          status: 'paid',
        },
        session: { id: sessionId },
      }
    }

    // If not configured, mock it
    if (!PAYMONGO_CONFIG.isConfigured) {
      console.warn('⚠️ PayMongo not configured, using mock payment callback')
      return {
        success: true,
        payment: {
          id: sessionId,
          amount: 0,
          currency: 'PHP',
          status: 'paid',
        },
        session: { id: sessionId },
      }
    }
    
    // Validate secret key
    if (!PAYMONGO_CONFIG.secretKey) {
      throw new Error('PayMongo secret key not configured')
    }
    
    // Retrieve the checkout session
    const sessionResponse = await fetch(`${PAYMONGO_CONFIG.apiBaseUrl}/checkout_sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_CONFIG.secretKey + ':')}`,
      },
    })
    
    if (!sessionResponse.ok) {
      throw new Error('Failed to retrieve checkout session')
    }
    
    const sessionData = await sessionResponse.json()
    
    console.log('✅ Session data retrieved:', JSON.stringify(sessionData, null, 2))
    console.log('✅ Payments array:', sessionData.data.attributes.payments)
    
    // payments is an array of payment objects, get the first one's id
    const paymentId = sessionData.data.attributes.payments?.[0]?.id || sessionData.data.attributes.payments?.[0]
    
    console.log('✅ Extracted payment ID:', paymentId, 'Type:', typeof paymentId)
    
    if (!paymentId) {
      console.error('❌ No payment found in session data')
      throw new Error('No payment found in session')
    }
    
    // Retrieve payment details
    const paymentResponse = await fetch(`${PAYMONGO_CONFIG.apiBaseUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_CONFIG.secretKey + ':')}`,
      },
    })
    
    if (!paymentResponse.ok) {
      throw new Error('Failed to retrieve payment')
    }
    
    const paymentData = await paymentResponse.json()
    
    // Extract the actual payment method used from PayMongo
    // PayMongo stores payment method in payment_data.attributes.source.type or payment_data.attributes.payment_method.type
    let actualPaymentMethod = 'unknown'
    
    // Check payment_method attribute first (newer API)
    if (paymentData.data?.attributes?.payment_method?.type) {
      actualPaymentMethod = paymentData.data.attributes.payment_method.type
    }
    // Check source attribute (older API)
    else if (paymentData.data?.attributes?.source?.type) {
      actualPaymentMethod = paymentData.data.attributes.source.type
    }
    // Check payment_method_details
    else if (paymentData.data?.attributes?.payment_method_details?.type) {
      actualPaymentMethod = paymentData.data.attributes.payment_method_details.type
    }
    
    // Normalize payment method names
    // PayMongo uses: 'card', 'gcash', 'paymaya', 'grab_pay', etc.
    // Map to our standard names
    const paymentMethodMap = {
      'card': 'card',
      'credit_card': 'card',
      'debit_card': 'card',
      'gcash': 'gcash',
      'paymaya': 'maya',
      'grab_pay': 'grab_pay',
    }
    
    actualPaymentMethod = paymentMethodMap[actualPaymentMethod] || actualPaymentMethod
    
    console.log('💳 Detected payment method from PayMongo:', {
      raw: paymentData.data?.attributes?.payment_method?.type || paymentData.data?.attributes?.source?.type,
      normalized: actualPaymentMethod,
      full_payment_data: paymentData.data?.attributes
    })
    
    const payment = {
      id: paymentData.data.id,
      amount: paymentData.data.attributes.amount / 100,
      currency: paymentData.data.attributes.currency,
      status: paymentData.data.attributes.status,
      description: paymentData.data.attributes.description,
      fee: paymentData.data.attributes.fee / 100,
      payment_method: actualPaymentMethod, // Include detected payment method
    }
    
    console.log('✅ Payment retrieved:', payment)
    
    return {
      success: payment.status === 'paid',
      payment: payment,
      session: sessionData.data,
      paymentMethod: actualPaymentMethod, // Also return separately for easy access
    }
  } catch (error) {
    console.error('❌ Error processing payment callback:', error)
    throw error
  }
}

/**
 * Get PayMongo public key for frontend
 */
export function getPayMongoPublicKey() {
  return PAYMONGO_CONFIG.publicKey
}

/**
 * Check if PayMongo is configured
 */
export function isPayMongoConfigured() {
  return PAYMONGO_CONFIG.isConfigured
}

/**
 * Format amount for display
 */
export function formatAmount(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

// Initialize on module load
initPayMongo()
