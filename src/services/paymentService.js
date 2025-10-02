// Payment Service for GCash and Maya integration
import { getSupabase } from '@/services/supabaseClient'

export class PaymentService {
  constructor() {
    this.supabase = getSupabase()
  }

  /**
   * Process GCash payment
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.amount - Amount to pay
   * @param {number} paymentData.credits - Number of credits to purchase
   * @param {string} paymentData.userId - User ID
   * @returns {Promise<Object>} Payment result
   */
  async processGCashPayment(paymentData) {
    try {
      console.log('Processing GCash payment:', paymentData)

      // TODO: Integrate with actual GCash API
      // For now, simulate payment processing
      const paymentResult = await this.simulatePayment({
        ...paymentData,
        provider: 'gcash',
      })

      if (paymentResult.success) {
        // Record transaction in database
        await this.recordTransaction({
          ...paymentData,
          transactionId: paymentResult.transactionId,
          provider: 'gcash',
          status: 'completed',
        })
      }

      return paymentResult
    } catch (error) {
      console.error('GCash payment error:', error)
      throw new Error('GCash payment failed: ' + error.message)
    }
  }

  /**
   * Process Maya payment
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment result
   */
  async processMayaPayment(paymentData) {
    try {
      console.log('Processing Maya payment:', paymentData)

      // TODO: Integrate with actual Maya API
      // For now, simulate payment processing
      const paymentResult = await this.simulatePayment({
        ...paymentData,
        provider: 'maya',
      })

      if (paymentResult.success) {
        // Record transaction in database
        await this.recordTransaction({
          ...paymentData,
          transactionId: paymentResult.transactionId,
          provider: 'maya',
          status: 'completed',
        })
      }

      return paymentResult
    } catch (error) {
      console.error('Maya payment error:', error)
      throw new Error('Maya payment failed: ' + error.message)
    }
  }

  /**
   * Simulate payment processing (for development/testing)
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Simulated payment result
   */
  async simulatePayment(paymentData) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate 90% success rate
    const success = Math.random() > 0.1

    if (success) {
      return {
        success: true,
        transactionId: `${paymentData.provider.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: paymentData.amount,
        credits: paymentData.credits,
        provider: paymentData.provider,
        timestamp: new Date().toISOString(),
      }
    } else {
      throw new Error('Payment declined by provider')
    }
  }

  /**
   * Record transaction in database
   * @param {Object} transactionData - Transaction data
   */
  async recordTransaction(transactionData) {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .insert([
          {
            user_id: transactionData.userId,
            transaction_id: transactionData.transactionId,
            amount: transactionData.amount,
            credits_purchased: transactionData.credits,
            payment_provider: transactionData.provider,
            status: transactionData.status,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Transaction recording error:', error)
        throw error
      }

      console.log('Transaction recorded:', data)
      return data
    } catch (error) {
      console.error('Failed to record transaction:', error)
      // Don't throw here - payment was successful, just logging failed
    }
  }

  /**
   * Verify payment status
   * @param {string} transactionId - Transaction ID to verify
   * @returns {Promise<Object>} Payment verification result
   */
  async verifyPayment(transactionId) {
    try {
      // TODO: Implement actual payment verification with provider APIs

      // For now, check our database
      const { data, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()

      if (error) {
        throw new Error('Transaction not found')
      }

      return {
        verified: true,
        transaction: data,
        status: data.status,
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      return {
        verified: false,
        error: error.message,
      }
    }
  }

  /**
   * Get user transaction history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User transactions
   */
  async getUserTransactions(userId) {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch user transactions:', error)
      throw new Error('Failed to fetch transaction history')
    }
  }

  /**
   * Get supported payment methods
   * @returns {Array} Available payment methods
   */
  getSupportedPaymentMethods() {
    return [
      {
        id: 'gcash',
        name: 'GCash',
        icon: '💳',
        description: 'Pay with GCash mobile wallet',
        enabled: true,
      },
      {
        id: 'maya',
        name: 'Maya',
        icon: '📱',
        description: 'Pay with Maya (formerly PayMaya)',
        enabled: true,
      },
    ]
  }

  /**
   * Calculate total amount including fees
   * @param {number} credits - Number of credits
   * @param {number} pricePerCredit - Price per credit
   * @param {string} paymentMethod - Payment method
   * @returns {Object} Pricing breakdown
   */
  calculateTotal(credits, pricePerCredit, paymentMethod) {
    const subtotal = credits * pricePerCredit

    // Different fees for different payment methods
    const fees = {
      gcash: 0.02, // 2% fee
      maya: 0.025, // 2.5% fee
    }

    const feeRate = fees[paymentMethod] || 0.02
    const fee = subtotal * feeRate
    const total = subtotal + fee

    return {
      credits,
      pricePerCredit,
      subtotal: Math.round(subtotal * 100) / 100,
      fee: Math.round(fee * 100) / 100,
      feeRate: feeRate * 100, // Convert to percentage
      total: Math.round(total * 100) / 100,
      paymentMethod,
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()

// Export individual functions for easier importing
export const {
  processGCashPayment,
  processMayaPayment,
  verifyPayment,
  getUserTransactions,
  getSupportedPaymentMethods,
  calculateTotal,
} = paymentService
