<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getWalletBalance, getTransactions } from '@/services/walletService'
import TopUp from '@/components/wallet/TopUp.vue'
import Withdraw from '@/components/wallet/Withdraw.vue'

const router = useRouter()
const store = useUserStore()

const walletBalance = ref({ current_balance: 0, currency: 'PHP' })
const transactions = ref([])
const loading = ref(false)
const showTopUp = ref(false)
const showWithdraw = ref(false)
const error = ref('')

async function loadWalletData() {
  if (!store.session?.user?.id) return

  loading.value = true
  try {
    const [balance, transactionHistory] = await Promise.all([
      getWalletBalance(store.session.user.id),
      getTransactions(store.session.user.id),
    ])

    walletBalance.value = balance
    transactions.value = transactionHistory
  } catch (err) {
    console.error('Error loading wallet data:', err)
    error.value = 'Failed to load wallet data'
  } finally {
    loading.value = false
  }
}

function showTopUpModal() {
  showTopUp.value = true
}

function showWithdrawModal() {
  showWithdraw.value = true
}

function onTopUpSuccess() {
  showTopUp.value = false
  loadWalletData() // Reload wallet data
}

function onWithdrawSuccess() {
  showWithdraw.value = false
  loadWalletData() // Reload wallet data
}

function onTopUpCancel() {
  showTopUp.value = false
}

function onWithdrawCancel() {
  showWithdraw.value = false
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTransactionIcon(type) {
  switch (type) {
    case 'topup':
      return '⬆️'
    case 'withdrawal':
      return '⬇️'
    case 'payment':
      return '💳'
    default:
      return '💰'
  }
}

function getTransactionStatusColor(status) {
  switch (status) {
    case 'completed':
      return '#10b981'
    case 'pending':
      return '#f59e0b'
    case 'failed':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

onMounted(() => {
  loadWalletData()
})
</script>

<template>
  <div class="wallet-page">
    <header class="wallet-header">
      <button class="btn btn-ghost" @click="router.push('/dashboard')">← Back to Dashboard</button>
      <h1 class="wallet-title">Wallet & Finance</h1>
      <p class="wallet-subtitle">Manage your EcoLink wallet and transactions</p>
    </header>

    <main class="wallet-content">
      <!-- Wallet Balance Card -->
      <div class="balance-card">
        <div class="balance-header">
          <h2 class="balance-title">Wallet Balance</h2>
          <div class="balance-currency">{{ walletBalance.currency }}</div>
        </div>
        <div class="balance-amount">{{ formatAmount(walletBalance.current_balance) }}</div>
        <div class="balance-actions">
          <button class="btn btn-primary" @click="showTopUpModal">+ Top Up</button>
          <button
            class="btn btn-ghost"
            @click="showWithdrawModal"
            :disabled="walletBalance.current_balance === 0"
          >
            - Withdraw
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-card">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ error }}</div>
        <button class="btn btn-primary" @click="loadWalletData">Retry</button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-card">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading wallet data...</div>
      </div>

      <!-- Transaction History -->
      <div v-else class="transactions-section">
        <div class="section-header">
          <h2 class="section-title">Transaction History</h2>
          <button class="btn btn-ghost" @click="loadWalletData">Refresh</button>
        </div>

        <div v-if="transactions.length === 0" class="empty-transactions">
          <div class="empty-icon">📋</div>
          <h3>No transactions yet</h3>
          <p>Your transaction history will appear here</p>
          <button class="btn btn-primary" @click="showTopUpModal">
            Make Your First Transaction
          </button>
        </div>

        <div v-else class="transactions-list">
          <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-icon">
              {{ getTransactionIcon(transaction.type) }}
            </div>
            <div class="transaction-details">
              <div class="transaction-description">{{ transaction.description }}</div>
              <div class="transaction-meta">
                <span class="transaction-date">{{ formatDate(transaction.created_at) }}</span>
                <span class="transaction-method">{{
                  transaction.payment_method?.toUpperCase()
                }}</span>
                <span
                  class="transaction-status"
                  :style="{ color: getTransactionStatusColor(transaction.status) }"
                >
                  {{ transaction.status }}
                </span>
              </div>
            </div>
            <div class="transaction-amount" :class="`amount-${transaction.type}`">
              {{ transaction.type === 'topup' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Top Up Modal -->
    <div v-if="showTopUp" class="modal-overlay" @click="onTopUpCancel">
      <div class="modal-content" @click.stop>
        <TopUp @success="onTopUpSuccess" @cancel="onTopUpCancel" />
      </div>
    </div>

    <!-- Withdraw Modal -->
    <div v-if="showWithdraw" class="modal-overlay" @click="onWithdrawCancel">
      <div class="modal-content" @click.stop>
        <Withdraw @success="onWithdrawSuccess" @cancel="onWithdrawCancel" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background: var(--ecolink-bg);
}

.wallet-header {
  background: var(--ecolink-surface);
  border-bottom: 1px solid var(--ecolink-border);
  padding: 24px;
}

.wallet-title {
  margin: 16px 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--ecolink-text);
}

.wallet-subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--ecolink-muted);
}

.wallet-content {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

/* Balance Card */
.balance-card {
  background: linear-gradient(135deg, var(--ecolink-primary-600), var(--ecolink-primary-700));
  color: white;
  border-radius: var(--radius);
  padding: 32px;
  box-shadow: var(--shadow-lg);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.balance-currency {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.balance-amount {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 24px;
}

.balance-actions {
  display: flex;
  gap: 12px;
}

/* Error and Loading States */
.error-card,
.loading-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 40px;
  text-align: center;
  box-shadow: var(--shadow-md);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  font-size: 16px;
  color: var(--ecolink-text);
  margin-bottom: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--ecolink-border);
  border-top: 4px solid var(--ecolink-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--ecolink-muted);
  font-size: 16px;
}

/* Transactions Section */
.transactions-section {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-md);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ecolink-text);
}

.empty-transactions {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-transactions h3 {
  margin: 0 0 8px 0;
  color: var(--ecolink-text);
}

.empty-transactions p {
  margin: 0 0 20px 0;
  color: var(--ecolink-muted);
}

/* Transaction List */
.transactions-list {
  display: grid;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--ecolink-bg);
  border: 1px solid var(--ecolink-border);
  border-radius: 12px;
  transition: all 120ms ease;
}

.transaction-item:hover {
  background: var(--ecolink-primary-50);
  border-color: var(--ecolink-primary-200);
}

.transaction-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ecolink-surface);
  border-radius: 50%;
}

.transaction-details {
  flex: 1;
}

.transaction-description {
  font-weight: 600;
  color: var(--ecolink-text);
  margin-bottom: 4px;
}

.transaction-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--ecolink-muted);
}

.transaction-status {
  text-transform: capitalize;
  font-weight: 600;
}

.transaction-amount {
  font-weight: 700;
  font-size: 16px;
}

.amount-topup {
  color: var(--ecolink-primary-600);
}

.amount-withdrawal {
  color: #dc2626;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--ecolink-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .wallet-content {
    padding: 20px 16px;
  }

  .balance-amount {
    font-size: 36px;
  }

  .balance-actions {
    flex-direction: column;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .transaction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .transaction-meta {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
