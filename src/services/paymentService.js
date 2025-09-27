import { getSupabase } from '@/services/supabaseClient'

/**
 * Payment processing service for EcoLink platform
 * Handles real payment integration with multiple providers
 */

// Payment providers configuration
const PAYMENT_PROVIDERS = {
  PAYMONGO: {
    name: 'PayMongo',
    baseUrl: 'https://api.paymongo.com/v1',
    supportedMethods: ['card', 'gcash', 'grab_pay', 'paymaya'],
    currency: 'PHP',
  },
  STRIPE: {
    name: 'Stripe',
    baseUrl: 'https://api.stripe.com/v1',
    supportedMethods: ['card', 'bank_transfer'],
    currency: 'PHP',
  },
  PAYPAL: {
    name: 'PayPal',
    baseUrl: 'https://api.paypal.com/v2',
    supportedMethods: ['paypal', 'card'],
    currency: 'PHP',
  },
}

/**
 * Initialize payment session with provider
 */
export async function initializePayment(paymentData) {
  const { provider, amount, currency, description, metadata } = paymentData

  try {
    switch (provider) {
      case 'paymongo':
        return await initializePayMongoPayment(paymentData)
      case 'stripe':
        return await initializeStripePayment(paymentData)
      case 'paypal':
        return await initializePayPalPayment(paymentData)
      default:
        throw new Error(`Unsupported payment provider: ${provider}`)
    }
  } catch (error) {
    console.error('Error initializing payment:', error)
    throw new Error('Failed to initialize payment')
  }
}

/**
 * PayMongo payment integration (Philippines)
 */
async function initializePayMongoPayment(paymentData) {
  const { amount, currency, description, metadata } = paymentData

  try {
    // Create payment intent with PayMongo
    const response = await fetch('/api/payments/paymongo/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_PAYMONGO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to centavos
        currency: currency || 'PHP',
        description: description,
        metadata: metadata,
        payment_method_allowed: ['card', 'gcash', 'grab_pay', 'paymaya'],
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create PayMongo payment intent')
    }

    const data = await response.json()

    return {
      success: true,
      paymentIntentId: data.id,
      clientSecret: data.client_secret,
      provider: 'paymongo',
      amount: amount,
      currency: currency || 'PHP',
      status: 'requires_payment_method',
    }
  } catch (error) {
    console.error('PayMongo payment initialization error:', error)
    throw error
  }
}

/**
 * Stripe payment integration
 */
async function initializeStripePayment(paymentData) {
  const { amount, currency, description, metadata } = paymentData

  try {
    // Create payment intent with Stripe
    const response = await fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to centavos
        currency: currency || 'PHP',
        description: description,
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create Stripe payment intent')
    }

    const data = await response.json()

    return {
      success: true,
      paymentIntentId: data.id,
      clientSecret: data.client_secret,
      provider: 'stripe',
      amount: amount,
      currency: currency || 'PHP',
      status: 'requires_payment_method',
    }
  } catch (error) {
    console.error('Stripe payment initialization error:', error)
    throw error
  }
}

/**
 * PayPal payment integration
 */
async function initializePayPalPayment(paymentData) {
  const { amount, currency, description, metadata } = paymentData

  try {
    // Create PayPal order
    const response = await fetch('/api/payments/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency || 'PHP',
              value: amount.toString(),
            },
            description: description,
            custom_id: metadata?.transaction_id,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create PayPal order')
    }

    const data = await response.json()

    return {
      success: true,
      paymentIntentId: data.id,
      approvalUrl: data.links.find((link) => link.rel === 'approve')?.href,
      provider: 'paypal',
      amount: amount,
      currency: currency || 'PHP',
      status: 'requires_payment_method',
    }
  } catch (error) {
    console.error('PayPal payment initialization error:', error)
    throw error
  }
}

/**
 * Confirm payment with provider
 */
export async function confirmPayment(paymentIntentId, provider, paymentMethodData) {
  try {
    switch (provider) {
      case 'paymongo':
        return await confirmPayMongoPayment(paymentIntentId, paymentMethodData)
      case 'stripe':
        return await confirmStripePayment(paymentIntentId, paymentMethodData)
      case 'paypal':
        return await confirmPayPalPayment(paymentIntentId, paymentMethodData)
      default:
        throw new Error(`Unsupported payment provider: ${provider}`)
    }
  } catch (error) {
    console.error('Error confirming payment:', error)
    throw new Error('Failed to confirm payment')
  }
}

/**
 * Confirm PayMongo payment
 */
async function confirmPayMongoPayment(paymentIntentId, paymentMethodData) {
  try {
    const response = await fetch('/api/payments/paymongo/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_PAYMONGO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        payment_method: paymentMethodData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to confirm PayMongo payment')
    }

    const data = await response.json()

    return {
      success: true,
      paymentId: data.id,
      status: data.status,
      amount: data.amount / 100, // Convert from centavos
      currency: data.currency,
      provider: 'paymongo',
    }
  } catch (error) {
    console.error('PayMongo payment confirmation error:', error)
    throw error
  }
}

/**
 * Confirm Stripe payment
 */
async function confirmStripePayment(paymentIntentId, paymentMethodData) {
  try {
    const response = await fetch('/api/payments/stripe/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_STRIPE_SECRET_KEY}`,
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        payment_method: paymentMethodData,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to confirm Stripe payment')
    }

    const data = await response.json()

    return {
      success: true,
      paymentId: data.id,
      status: data.status,
      amount: data.amount / 100, // Convert from centavos
      currency: data.currency,
      provider: 'stripe',
    }
  } catch (error) {
    console.error('Stripe payment confirmation error:', error)
    throw error
  }
}

/**
 * Confirm PayPal payment
 */
async function confirmPayPalPayment(paymentIntentId, paymentMethodData) {
  try {
    const response = await fetch('/api/payments/paypal/capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_PAYPAL_CLIENT_ID}`,
      },
      body: JSON.stringify({
        order_id: paymentIntentId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to capture PayPal payment')
    }

    const data = await response.json()

    return {
      success: true,
      paymentId: data.id,
      status: data.status,
      amount: parseFloat(data.purchase_units[0].payments.captures[0].amount.value),
      currency: data.purchase_units[0].payments.captures[0].amount.currency_code,
      provider: 'paypal',
    }
  } catch (error) {
    console.error('PayPal payment confirmation error:', error)
    throw error
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId, provider) {
  try {
    const response = await fetch(`/api/payments/${provider}/status/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getProviderSecretKey(provider)}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get payment status')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting payment status:', error)
    throw error
  }
}

/**
 * Refund payment
 */
export async function refundPayment(paymentId, provider, amount = null) {
  try {
    const response = await fetch(`/api/payments/${provider}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getProviderSecretKey(provider)}`,
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount: amount,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refund payment')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error refunding payment:', error)
    throw error
  }
}

/**
 * Get supported payment methods for a provider
 */
export function getSupportedPaymentMethods(provider) {
  const providerConfig = PAYMENT_PROVIDERS[provider.toUpperCase()]
  return providerConfig ? providerConfig.supportedMethods : []
}

/**
 * Get all available payment providers
 */
export function getAvailableProviders() {
  return Object.keys(PAYMENT_PROVIDERS).map((key) => ({
    id: key.toLowerCase(),
    name: PAYMENT_PROVIDERS[key].name,
    supportedMethods: PAYMENT_PROVIDERS[key].supportedMethods,
    currency: PAYMENT_PROVIDERS[key].currency,
  }))
}

/**
 * Calculate payment fees
 */
export function calculatePaymentFees(amount, provider, paymentMethod) {
  const fees = {
    paymongo: {
      card: { fixed: 0, percentage: 0.035 }, // 3.5%
      gcash: { fixed: 0, percentage: 0.02 }, // 2%
      grab_pay: { fixed: 0, percentage: 0.02 }, // 2%
      paymaya: { fixed: 0, percentage: 0.02 }, // 2%
    },
    stripe: {
      card: { fixed: 0, percentage: 0.029 }, // 2.9%
      bank_transfer: { fixed: 0, percentage: 0.008 }, // 0.8%
    },
    paypal: {
      paypal: { fixed: 0, percentage: 0.034 }, // 3.4%
      card: { fixed: 0, percentage: 0.029 }, // 2.9%
    },
  }

  const providerFees = fees[provider.toLowerCase()]
  if (!providerFees || !providerFees[paymentMethod]) {
    return { fee: 0, total: amount }
  }

  const feeConfig = providerFees[paymentMethod]
  const fee = amount * feeConfig.percentage + feeConfig.fixed
  const total = amount + fee

  return {
    fee: Math.round(fee * 100) / 100,
    total: Math.round(total * 100) / 100,
    breakdown: {
      amount: amount,
      fee: Math.round(fee * 100) / 100,
      total: Math.round(total * 100) / 100,
    },
  }
}

/**
 * Get provider secret key
 */
function getProviderSecretKey(provider) {
  switch (provider.toLowerCase()) {
    case 'paymongo':
      return import.meta.env.VITE_PAYMONGO_SECRET_KEY
    case 'stripe':
      return import.meta.env.VITE_STRIPE_SECRET_KEY
    case 'paypal':
      return import.meta.env.VITE_PAYPAL_CLIENT_SECRET
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

/**
 * Create payment record in database
 */
export async function createPaymentRecord(paymentData) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: paymentData.userId,
        transaction_id: paymentData.transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        provider: paymentData.provider,
        payment_method: paymentData.paymentMethod,
        status: paymentData.status,
        payment_intent_id: paymentData.paymentIntentId,
        metadata: paymentData.metadata,
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create payment record')
    }

    return data
  } catch (error) {
    console.error('Error creating payment record:', error)
    throw error
  }
}

/**
 * Update payment record
 */
export async function updatePaymentRecord(paymentId, updates) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update payment record')
    }

    return data
  } catch (error) {
    console.error('Error updating payment record:', error)
    throw error
  }
}

/**
 * Get user payment history
 */
export async function getUserPaymentHistory(userId, limit = 50) {
  const supabase = getSupabase()

  try {
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        id,
        amount,
        currency,
        provider,
        payment_method,
        status,
        created_at,
        metadata
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error('Failed to fetch payment history')
    }

    return data || []
  } catch (error) {
    console.error('Error fetching payment history:', error)
    throw error
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStatistics() {
  const supabase = getSupabase()

  try {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, currency, provider, status, created_at')

    if (!payments) {
      return {
        totalPayments: 0,
        totalAmount: 0,
        successRate: 0,
        byProvider: {},
        byStatus: {},
        monthlyRevenue: [],
      }
    }

    const totalPayments = payments.length
    const successfulPayments = payments.filter((p) => p.status === 'succeeded')
    const totalAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0)
    const successRate = totalPayments > 0 ? (successfulPayments.length / totalPayments) * 100 : 0

    // Group by provider
    const byProvider = payments.reduce((acc, payment) => {
      acc[payment.provider] = (acc[payment.provider] || 0) + 1
      return acc
    }, {})

    // Group by status
    const byStatus = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1
      return acc
    }, {})

    // Monthly revenue
    const monthlyRevenue = successfulPayments.reduce((acc, payment) => {
      const date = new Date(payment.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!acc[monthKey]) {
        acc[monthKey] = 0
      }
      acc[monthKey] += payment.amount
      return acc
    }, {})

    const monthlyData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue),
      }))

    return {
      totalPayments,
      totalAmount: Math.round(totalAmount),
      successRate: Math.round(successRate),
      byProvider,
      byStatus,
      monthlyRevenue: monthlyData,
    }
  } catch (error) {
    console.error('Error fetching payment statistics:', error)
    throw error
  }
}


