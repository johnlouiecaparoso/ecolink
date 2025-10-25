import { getSupabase } from '@/services/supabaseClient'
import { logUserAction } from '@/services/auditService'

/**
 * Payment service for handling transactions
 */
export class PaymentService {
  constructor() {
    this.supabase = getSupabase()
  }

  /**
   * Record a payment transaction
   */
  async recordTransaction(transactionData) {
    const supabase = getSupabase()

    if (!supabase) {
      console.warn('Supabase client not available')
      return null
    }

    try {
      const { data: payment, error } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: transactionData.userId,
          type: transactionData.type || 'purchase',
          amount: transactionData.amount,
          currency: transactionData.currency || 'USD',
          description: transactionData.description,
          reference_id: transactionData.transactionId,
          status: transactionData.status || 'pending',
        })
        .select()
        .single()

      if (error) {
        console.error('Error recording payment:', error)
        throw new Error('Failed to record payment')
      }

      // Log the action
      await logUserAction('PAYMENT_RECORDED', 'payment', transactionData.userId, payment.id, {
        amount: transactionData.amount,
        type: transactionData.type,
        status: transactionData.status,
      })

      return payment
    } catch (error) {
      console.error('Error in recordTransaction:', error)
      throw error
    }
  }

  /**
   * Process payment
   */
  async processPayment(paymentData) {
    try {
      // Simulate payment processing
      console.log('Processing payment:', paymentData)

      // In a real implementation, this would integrate with payment providers
      // like Stripe, PayPal, etc.

      const paymentResult = {
        success: true,
        transactionId: `pay_${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'completed',
      }

      return paymentResult
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(userId) {
    const supabase = getSupabase()

    if (!supabase) {
      console.warn('Supabase client not available')
      return []
    }

    try {
      const { data: payments, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching payments:', error)
        return []
      }

      return payments || []
    } catch (error) {
      console.error('Error in getUserPayments:', error)
      return []
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(transactionId, amount, reason) {
    const supabase = getSupabase()

    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    try {
      // Get original transaction
      const { data: originalTransaction, error: fetchError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('reference_id', transactionId)
        .single()

      if (fetchError || !originalTransaction) {
        throw new Error('Original transaction not found')
      }

      // Create refund transaction
      const { data: refund, error: refundError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: originalTransaction.user_id,
          type: 'refund',
          amount: amount,
          currency: originalTransaction.currency,
          description: `Refund: ${reason}`,
          reference_id: transactionId,
          status: 'completed',
        })
        .select()
        .single()

      if (refundError) {
        throw new Error('Failed to process refund')
      }

      // Log the action
      await logUserAction('PAYMENT_REFUNDED', 'payment', originalTransaction.user_id, refund.id, {
        original_transaction_id: transactionId,
        refund_amount: amount,
        reason: reason,
      })

      return refund
    } catch (error) {
      console.error('Error in refundPayment:', error)
      throw error
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
