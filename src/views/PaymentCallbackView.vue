<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { processPaymentCallback } from '@/services/paymongoService'
import { realPaymentService } from '@/services/realPaymentService'

const router = useRouter()
const route = useRoute()
const store = useUserStore()

const loading = ref(true)
const success = ref(false)
const error = ref('')
const paymentDetails = ref(null)

onMounted(async () => {
  // Get session ID from URL or localStorage (PayMongo may not replace {CHECKOUT_SESSION_ID})
  console.log('🔍 Full route query:', route.query)
  console.log('🔍 Full route params:', route.params)
  
  let sessionId = route.query.session_id || route.query.checkout_session_id || route.params.sessionId || route.params.checkout_session_id
  
  // If URL doesn't have it or has placeholder, check localStorage
  if (!sessionId || sessionId === '{CHECKOUT_SESSION_ID}') {
    console.log('⚠️ Session ID not in URL, checking localStorage...')
    sessionId = localStorage.getItem('pending_purchase_session') || localStorage.getItem('wallet_topup_session')
    if (sessionId) {
      console.log('✅ Found session ID in localStorage:', sessionId)
    }
  }
  
  console.log('🔍 Final session ID:', sessionId)
  
  if (!sessionId || sessionId === '{CHECKOUT_SESSION_ID}') {
    error.value = 'No payment session found'
    loading.value = false
    return
  }

  try {
    // Process the payment callback
    const result = await processPaymentCallback(sessionId)
    
    if (result.success) {
      success.value = true
      paymentDetails.value = result.payment
      
      // Check if this was a wallet top-up or marketplace purchase
      const topUpSession = localStorage.getItem('wallet_topup_session')
      const wasTopUp = topUpSession && topUpSession === sessionId
      
      if (wasTopUp) {
        // Complete wallet top-up
        try {
          const userId = localStorage.getItem('wallet_topup_user_id') || store.session?.user?.id
          const topUpAmount = parseFloat(localStorage.getItem('wallet_topup_amount') || '0')
          
          console.log('💰 Completing wallet top-up:', { userId, amount: topUpAmount, sessionId })
          
          if (!userId) {
            throw new Error('User ID not found for wallet top-up')
          }
          
          // First, try to wait for webhook (if configured)
          // This ensures server-side processing happens first
          const { waitForWebhookTransaction } = await import('@/services/webhookService')
          const webhookStatus = await waitForWebhookTransaction(sessionId, 5, 1500)
          
          if (webhookStatus && webhookStatus.status === 'completed') {
            console.log('✅ Webhook processed payment, balance updated server-side')
            // Webhook already handled it, just refresh UI
          } else {
            // Fallback: Client-side processing (if webhook not configured or timed out)
            console.log('⚠️ Webhook not available, processing client-side...')
            
            // Confirm PayMongo payment (updates transaction status)
            await realPaymentService.confirmPayMongoPayment(sessionId)
            
            // Update wallet balance using walletService
            const { updateWalletBalance } = await import('@/services/walletService')
            await updateWalletBalance(userId, topUpAmount, 'topup')
            
            console.log('✅ Wallet top-up completed (client-side fallback)')
          }
        } catch (confirmError) {
          console.error('❌ Error completing wallet top-up:', confirmError)
          // Show error but don't fail the whole callback
          error.value = `Top-up may have failed: ${confirmError.message}`
        }
      } else {
        // Complete marketplace purchase from localStorage
        const pendingPurchase = localStorage.getItem('pending_purchase')
        if (pendingPurchase) {
          try {
            const purchaseData = JSON.parse(pendingPurchase)
            console.log('🛒 Completing marketplace purchase from callback...')
            
            // Import services needed to complete purchase
            const { getSupabase } = await import('@/services/supabaseClient')
            const { creditOwnershipService } = await import('@/services/creditOwnershipService')
            const supabase = getSupabase()
            
            const { listing, purchaseData: pd, totalCost, paymentResult } = purchaseData
            
            // CRITICAL: Use actual payment method detected from PayMongo, not the one from purchase data
            // This ensures card payments show as 'card' instead of 'gcash' or 'maya'
            const actualPaymentMethod = result.paymentMethod || result.payment?.payment_method || pd.paymentMethod || 'wallet'
            
            console.log('💳 Using payment method:', {
              from_paymongo: result.paymentMethod,
              from_payment_object: result.payment?.payment_method,
              from_purchase_data: pd.paymentMethod,
              final: actualPaymentMethod
            })
            
            // Get seller_id from listing or project owner
            // The listing might have seller_id directly, or we need to get it from the project
            let sellerId = listing.seller_id
            if (!sellerId && listing.project_credits?.project_id) {
              // Fetch project to get owner (seller)
              const { data: project } = await supabase
                .from('projects')
                .select('user_id')
                .eq('id', listing.project_credits.project_id)
                .single()
              if (project) {
                sellerId = project.user_id
              }
            }
            
            // If still no seller_id, try to get it from credit_listings table
            if (!sellerId && purchaseData.listingId) {
              const { data: listingData } = await supabase
                .from('credit_listings')
                .select('seller_id')
                .eq('id', purchaseData.listingId)
                .single()
              if (listingData) {
                sellerId = listingData.seller_id
              }
            }
            
            if (!sellerId) {
              console.warn('⚠️ Could not determine seller_id, purchase may fail')
            }
            
            // Create credit_purchases record
            // Note: Schema matches complete-ecolink-setup.sql - no currency or payment_reference columns
            const purchaseDataToInsert = {
              listing_id: purchaseData.listingId,
              buyer_id: store.session.user.id,
              seller_id: sellerId,
              credits_amount: pd.quantity,
              price_per_credit: listing.price_per_credit,
              total_amount: totalCost,
              payment_method: actualPaymentMethod, // Use detected payment method
              payment_status: 'completed', // Schema has both payment_status and status
              status: 'completed',
              completed_at: new Date().toISOString(), // Schema has completed_at field
            }
            
            const { data: purchase, error: purchaseError } = await supabase
              .from('credit_purchases')
              .insert(purchaseDataToInsert)
              .select()
              .single()
            
            // Handle purchase record creation error
            if (purchaseError) {
              console.error('❌ Error creating purchase record:', purchaseError)
              console.warn('⚠️ Purchase transaction may still be valid - payment was successful')
            }
            
            // Use purchase ID if available, otherwise use session ID as fallback
            const purchaseId = purchase?.id || paymentResult.sessionId || `purchase_${Date.now()}`
            
            // Add credits to portfolio (even if purchase record failed)
            try {
              await creditOwnershipService.addCreditsToPortfolio(
                store.session.user.id,
                listing.project_credits.project_id,
                pd.quantity,
                'purchased',
                purchaseId,
              )
              console.log('✅ Credits added to portfolio')
            } catch (ownershipError) {
              console.error('❌ Error adding credits to portfolio:', ownershipError)
              // This is critical - throw to prevent silent failure
              throw ownershipError
            }
            
            // Create credit_transactions record (needed for receipts)
            const { data: transaction, error: transactionError } = await supabase
              .from('credit_transactions')
              .insert({
                buyer_id: store.session.user.id,
                seller_id: sellerId,
                project_credit_id: listing.project_credits.id,
                listing_id: purchaseData.listingId,
                quantity: pd.quantity,
                price_per_credit: listing.price_per_credit,
                total_amount: totalCost,
                currency: listing.currency || 'PHP',
                payment_method: actualPaymentMethod, // Use detected payment method
                payment_reference: paymentResult.sessionId,
                status: 'completed',
                completed_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              })
              .select()
              .single()
            
            if (transactionError) {
              console.error('❌ Error creating credit_transaction:', transactionError)
              // Non-critical - purchase is still valid
            }
            
            // Generate receipt
            if (transaction) {
              const { generateReceipt } = await import('@/services/receiptService')
              try {
                await generateReceipt(transaction.id)
              } catch (receiptError) {
                console.error('Receipt generation failed:', receiptError)
              }
            }
            
            console.log('✅ Marketplace purchase completed successfully')
          } catch (purchaseError) {
            console.error('❌ Error completing marketplace purchase:', purchaseError)
            // Continue anyway - show success
          }
        }
      }
      
      const redirectPath = wasTopUp ? '/wallet' : '/marketplace'
      
      // Clean up localStorage
      localStorage.removeItem('pending_purchase')
      localStorage.removeItem('pending_purchase_session')
      localStorage.removeItem('wallet_topup_session')
      localStorage.removeItem('wallet_topup_amount')
      localStorage.removeItem('wallet_topup_user_id')
      
      // Redirect to appropriate page after 3 seconds
      setTimeout(() => {
        router.push(redirectPath)
      }, 3000)
    } else {
      throw new Error('Payment not completed')
    }
  } catch (err) {
    console.error('Payment callback error:', err)
    error.value = err.message || 'Payment verification failed'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="payment-callback-page">
    <div class="container">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <h2>Processing payment...</h2>
        <p>Please wait while we verify your payment</p>
      </div>

      <div v-else-if="success" class="success-container">
        <div class="success-icon">✅</div>
        <h2>Payment Successful!</h2>
        <p>Your payment has been confirmed</p>
        <div v-if="paymentDetails" class="payment-summary">
          <p><strong>Amount:</strong> ₱{{ paymentDetails.amount.toLocaleString() }}</p>
          <p><strong>Status:</strong> {{ paymentDetails.status }}</p>
        </div>
        <p class="redirect-message">Redirecting to marketplace...</p>
      </div>

      <div v-else class="error-container">
        <div class="error-icon">❌</div>
        <h2>Payment Verification Failed</h2>
        <p>{{ error }}</p>
        <button @click="router.push('/marketplace')" class="btn-primary">
          Return to Marketplace
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.container {
  max-width: 600px;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loading-container,
.success-container,
.error-container {
  padding: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f4f6;
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

p {
  margin: 0.5rem 0;
  color: #6b7280;
}

.payment-summary {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.redirect-message {
  font-style: italic;
  color: var(--primary-color);
}

.btn-primary {
  padding: 0.75rem 2rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-primary:hover {
  background: var(--primary-hover);
}
</style>

