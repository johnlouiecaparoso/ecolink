<template>
  <div class="receipt-view-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">My Receipts</h1>
            <p class="page-description">
              View and download purchase receipts for your carbon credit transactions
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="receipt-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading your receipts...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Unable to load receipts</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="loadReceipts">Try Again</button>
        </div>

        <!-- Receipts Content -->
        <div v-else>
          <!-- Empty State -->
          <div v-if="receipts.length === 0" class="empty-state">
            <div class="empty-icon">🧾</div>
            <h3>No receipts yet</h3>
            <p>Purchase carbon credits to receive receipts</p>
            <button class="btn btn-primary" @click="$router.push('/marketplace')">
              Browse Marketplace
            </button>
          </div>

          <!-- Receipts List -->
          <div v-else class="receipts-list">
            <div v-for="receipt in receipts" :key="receipt.id" class="receipt-card">
              <div class="receipt-header">
                <div class="receipt-icon">📄</div>
                <div class="receipt-info">
                  <h3 class="receipt-title">
                    {{ getProjectTitle(receipt) || 'Purchase Receipt' }}
                  </h3>
                  <p class="receipt-number">Receipt #{{ receipt.receipt_number || receipt.id }}</p>
                  <span class="receipt-date">{{
                    formatDate(receipt.issued_at || receipt.created_at)
                  }}</span>
                </div>
              </div>

              <div class="receipt-details">
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">#{{ receipt.transaction_id || receipt.id }}</span>
                </div>
                <div v-if="getProjectLocation(receipt)" class="detail-row">
                  <span class="detail-label">Project Location:</span>
                  <span class="detail-value">{{ getProjectLocation(receipt) }}</span>
                </div>
                <div v-if="getCreditsPurchased(receipt)" class="detail-row">
                  <span class="detail-label">Credits Purchased:</span>
                  <span class="detail-value">{{
                    getCreditsPurchased(receipt).toLocaleString()
                  }}</span>
                </div>
                <div v-if="getTotalAmount(receipt)" class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value">{{
                    formatCurrency(getTotalAmount(receipt), getCurrency(receipt))
                  }}</span>
                </div>
                <div v-if="getPaymentMethod(receipt)" class="detail-row">
                  <span class="detail-label">Payment Method:</span>
                  <span class="detail-value">{{ getPaymentMethod(receipt) }}</span>
                </div>
                <div v-if="getStatus(receipt)" class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value" :class="getStatus(receipt)">
                    {{ getStatus(receipt) === 'completed' ? 'Completed' : getStatus(receipt) }}
                  </span>
                </div>
              </div>

              <div class="receipt-actions">
                <button class="btn btn-primary btn-sm" @click="downloadReceipt(receipt)">
                  Download PDF
                </button>
                <button class="btn btn-outline btn-sm" @click="viewReceiptDetails(receipt)">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getUserReceipts, downloadReceipt as downloadReceiptFile } from '@/services/receiptService'

const router = useRouter()
const userStore = useUserStore()

// Data
const receipts = ref([])
const loading = ref(false)
const error = ref('')

// Methods
async function loadReceipts() {
  if (!userStore.session?.user?.id) {
    error.value = 'Please log in to view your receipts'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await getUserReceipts(userStore.session.user.id)
    receipts.value = data || []
    console.log('✅ Receipts loaded successfully')
  } catch (err) {
    console.error('❌ Error loading receipts:', err)
    error.value = 'Failed to load receipts. Please try again.'
  } finally {
    loading.value = false
  }
}

async function downloadReceipt(receipt) {
  try {
    await downloadReceiptFile(receipt.id)
    // In a real implementation, this would trigger a PDF download
    alert(`Downloading receipt ${receipt.receipt_number || receipt.id}`)
  } catch (err) {
    console.error('Error downloading receipt:', err)
    alert('Failed to download receipt. Please try again.')
  }
}

function viewReceiptDetails(receipt) {
  // Navigate to receipt details or show modal
  router.push({
    path: '/wallet',
    query: { receipt: receipt.id },
  })
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(amount, currency = 'PHP') {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Helper functions to extract data from nested receipt structure
function getProjectTitle(receipt) {
  return (
    receipt.project_title || receipt.credit_transactions?.project_credits?.projects?.title || null
  )
}

function getProjectLocation(receipt) {
  return (
    receipt.project_location ||
    receipt.credit_transactions?.project_credits?.projects?.location ||
    null
  )
}

function getCreditsPurchased(receipt) {
  return receipt.credits_purchased || receipt.credit_transactions?.quantity || null
}

function getTotalAmount(receipt) {
  return receipt.total_amount || receipt.credit_transactions?.total_amount || null
}

function getCurrency(receipt) {
  return receipt.currency || receipt.credit_transactions?.currency || 'PHP'
}

function getPaymentMethod(receipt) {
  return receipt.payment_method || receipt.credit_transactions?.payment_method || null
}

function getStatus(receipt) {
  return receipt.status || receipt.credit_transactions?.status || null
}

// Lifecycle
onMounted(() => {
  loadReceipts()
})
</script>

<style scoped>
.receipt-view-page {
  min-height: 100vh;
  background: var(--bg-primary, #ffffff);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Page Header */
.page-header {
  background: var(--primary-color, #10b981);
  padding: 2rem 0;
  border-bottom: none;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  text-align: center;
  width: 100%;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #fff;
  margin: 0;
}

/* Main Content */
.receipt-content {
  padding: 2rem 0;
}

/* Loading State */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color, #d1e7dd);
  border-top-color: var(--primary-color, #069e2d);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-muted, #718096);
  margin: 0 0 2rem 0;
}

/* Receipts List */
.receipts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.receipt-card {
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #d1e7dd);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.receipt-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.receipt-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light, #e8f5e8);
}

.receipt-icon {
  font-size: 2.5rem;
}

.receipt-info {
  flex: 1;
}

.receipt-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 0.25rem 0;
}

.receipt-number {
  display: block;
  color: var(--text-muted, #718096);
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.receipt-date {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--bg-secondary, #f8fdf8);
  color: var(--text-muted, #718096);
  border-radius: 0.375rem;
  font-size: 0.75rem;
}

.receipt-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light, #e8f5e8);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--text-muted, #718096);
  font-size: 0.875rem;
}

.detail-value {
  color: var(--text-primary, #1a1a1a);
  font-weight: 500;
  font-size: 0.875rem;
}

.detail-value.completed {
  color: var(--success-color, #069e2d);
}

.receipt-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color, #069e2d);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover, #058e3f);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color, #d1e7dd);
  color: var(--text-primary, #1a1a1a);
}

.btn-outline:hover {
  background: var(--bg-secondary, #f8fdf8);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted, #718096);
  border: none;
}

.btn-ghost:hover {
  color: var(--text-primary, #1a1a1a);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
