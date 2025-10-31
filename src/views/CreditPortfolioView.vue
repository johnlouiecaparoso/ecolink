<template>
  <div class="credit-portfolio-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <button class="btn btn-ghost back-btn" @click="$router.push('/wallet')">
            ← Back to Wallet
          </button>
          <div class="header-text">
            <h1 class="page-title">Credit Portfolio</h1>
            <p class="page-description">
              Manage your carbon credit portfolio and track your environmental impact
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="portfolio-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading your credit portfolio...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Unable to load portfolio</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="loadPortfolio">Try Again</button>
        </div>

        <!-- Portfolio Content -->
        <div v-else class="portfolio-grid">
          <!-- Portfolio Stats -->
          <div class="stats-section">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🌱</div>
                <div class="stat-content">
                  <h3>{{ creditStats.total_owned.toLocaleString() }}</h3>
                  <p>Total Credits Owned</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">♻️</div>
                <div class="stat-content">
                  <h3>{{ creditStats.total_retired.toLocaleString() }}</h3>
                  <p>Credits Retired</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🏢</div>
                <div class="stat-content">
                  <h3>{{ creditStats.projects_count }}</h3>
                  <p>Projects Supported</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                  <h3>${{ portfolioValue.toLocaleString() }}</h3>
                  <p>Portfolio Value</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Credit Holdings -->
          <div class="holdings-section">
            <div class="section-header">
              <h2 class="section-title">Your Credit Holdings</h2>
              <div class="section-actions">
                <button class="btn btn-outline" @click="refreshPortfolio">
                  <span class="btn-icon">🔄</span>
                  Refresh
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="creditPortfolio.length === 0" class="empty-state">
              <div class="empty-icon">🌱</div>
              <h3>No credits yet</h3>
              <p>Purchase credits from the marketplace to build your portfolio</p>
              <button class="btn btn-primary" @click="$router.push('/marketplace')">
                Browse Marketplace
              </button>
            </div>

            <!-- Credit Cards -->
            <div v-else class="credits-grid">
              <div
                v-for="credit in creditPortfolio"
                :key="credit.id"
                class="credit-card"
                :class="{ retired: credit.ownership_status === 'retired' }"
              >
                <div class="credit-header">
                  <div class="credit-image">
                    <div class="image-placeholder">
                      {{ credit.project_category.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div class="credit-info">
                    <h3 class="credit-title">{{ credit.project_title }}</h3>
                    <p class="credit-location">📍 {{ credit.project_location }}</p>
                    <span class="credit-category">{{ credit.project_category }}</span>
                  </div>
                </div>

                <div class="credit-details">
                  <div class="detail-row">
                    <span class="detail-label">Credits Owned:</span>
                    <span class="detail-value">{{ credit.quantity.toLocaleString() }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" :class="credit.ownership_status">
                      {{ credit.ownership_status === 'retired' ? 'Retired' : 'Active' }}
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Purchase Date:</span>
                    <span class="detail-value">{{ formatDate(credit.created_at) }}</span>
                  </div>
                </div>

                <div class="credit-actions">
                  <button
                    v-if="credit.ownership_status === 'owned'"
                    class="btn btn-sm btn-primary"
                    @click="retireCredits(credit)"
                  >
                    Retire Credits
                  </button>
                  <button v-else class="btn btn-sm btn-outline" disabled>Already Retired</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Transaction History -->
          <div class="transactions-section">
            <div class="section-header">
              <h2 class="section-title">Recent Transactions</h2>
              <button class="btn btn-outline" @click="$router.push('/wallet')">View All</button>
            </div>

            <div class="transactions-list">
              <div v-if="recentTransactions.length === 0" class="empty-transactions">
                <p>No recent transactions</p>
              </div>
              <div
                v-for="transaction in recentTransactions"
                :key="transaction.id"
                class="transaction-item"
              >
                <div class="transaction-icon">
                  {{ getTransactionIcon(transaction.type) }}
                </div>
                <div class="transaction-details">
                  <h4 class="transaction-title">{{ transaction.description }}</h4>
                  <p class="transaction-date">{{ formatDate(transaction.created_at) }}</p>
                </div>
                <div class="transaction-amount" :class="transaction.type">
                  {{ transaction.type === 'deposit' ? '+' : '-'
                  }}{{ formatCurrency(transaction.amount) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { creditOwnershipService } from '@/services/creditOwnershipService'
import { getTransactions } from '@/services/walletService'

const router = useRouter()
const userStore = useUserStore()

// Data
const creditPortfolio = ref([])
const creditStats = ref({
  total_owned: 0,
  total_retired: 0,
  total_credits: 0,
  projects_count: 0,
})
const recentTransactions = ref([])
const loading = ref(false)
const error = ref('')

// Computed
const portfolioValue = computed(() => {
  // Calculate portfolio value based on average credit price
  return creditStats.value.total_owned * 25 // Assuming $25 per credit average
})

// Methods
async function loadPortfolio() {
  if (!userStore.session?.user?.id) {
    error.value = 'Please log in to view your portfolio'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const [portfolio, stats, transactions] = await Promise.all([
      creditOwnershipService.getUserCreditPortfolio(userStore.session.user.id),
      creditOwnershipService.getUserCreditStats(userStore.session.user.id),
      getTransactions(userStore.session.user.id),
    ])

    creditPortfolio.value = portfolio
    creditStats.value = stats
    recentTransactions.value = transactions.slice(0, 5) // Show last 5 transactions

    console.log('✅ Portfolio loaded successfully')
  } catch (err) {
    console.error('❌ Error loading portfolio:', err)
    error.value = 'Failed to load portfolio. Please try again.'
  } finally {
    loading.value = false
  }
}

async function refreshPortfolio() {
  await loadPortfolio()
}

function retireCredits(credit) {
  // Navigate to retire page with pre-filled data
  router.push({
    path: '/retire',
    query: {
      project: credit.project_id,
      quantity: credit.quantity,
    },
  })
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function getTransactionIcon(type) {
  const icons = {
    deposit: '💰',
    withdrawal: '💸',
    payment: '💳',
    refund: '↩️',
  }
  return icons[type] || '💳'
}

// Lifecycle
onMounted(() => {
  loadPortfolio()
})
</script>

<style scoped>
.credit-portfolio-page {
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
  padding: 2rem 0;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-secondary, #f8fdf8);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.5rem;
  color: var(--text-secondary, #4a5568);
  text-decoration: none;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--bg-primary, #ffffff);
  border-color: var(--primary-color, #069e2d);
  color: var(--primary-color, #069e2d);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary, #1a202c);
  margin: 0 0 0.5rem 0;
}

.page-description {
  font-size: 1.125rem;
  color: var(--text-muted, #718096);
  margin: 0;
}

/* Main Content */
.portfolio-content {
  padding: 2rem 0;
}

.portfolio-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Stats Section */
.stats-section {
  background: var(--bg-primary, #ffffff);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary, #f8fdf8);
  border-radius: 0.75rem;
  border: 1px solid var(--border-color, #e2e8f0);
}

.stat-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light, rgba(6, 158, 45, 0.1));
  border-radius: 0.5rem;
}

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #1a202c);
  margin: 0 0 0.25rem 0;
}

.stat-content p {
  font-size: 0.875rem;
  color: var(--text-muted, #718096);
  margin: 0;
}

/* Holdings Section */
.holdings-section {
  background: var(--bg-primary, #ffffff);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 1rem;
}

/* Credits Grid */
.credits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.credit-card {
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: var(--bg-primary, #ffffff);
  transition: all 0.2s ease;
}

.credit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color, #069e2d);
}

.credit-card.retired {
  opacity: 0.6;
  background: var(--bg-muted, #f8f9fa);
}

.credit-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.credit-image {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color, #069e2d), var(--primary-hover, #058e3f));
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.credit-info {
  flex: 1;
}

.credit-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin: 0 0 0.25rem 0;
}

.credit-location {
  font-size: 0.875rem;
  color: var(--text-muted, #718096);
  margin: 0 0 0.5rem 0;
}

.credit-category {
  background: var(--primary-light, rgba(6, 158, 45, 0.1));
  color: var(--primary-color, #069e2d);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.credit-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--text-muted, #718096);
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #1a202c);
}

.detail-value.retired {
  color: var(--text-muted, #718096);
}

.credit-actions {
  display: flex;
  gap: 0.5rem;
}

/* Transactions Section */
.transactions-section {
  background: var(--bg-primary, #ffffff);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary, #f8fdf8);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color, #e2e8f0);
}

.transaction-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary, #ffffff);
  border-radius: 50%;
}

.transaction-details {
  flex: 1;
}

.transaction-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary, #1a202c);
  margin: 0 0 0.25rem 0;
}

.transaction-date {
  font-size: 0.875rem;
  color: var(--text-muted, #718096);
  margin: 0;
}

.transaction-amount {
  font-size: 1rem;
  font-weight: 600;
}

.transaction-amount.deposit {
  color: var(--success-color, #10b981);
}

.transaction-amount.withdrawal {
  color: var(--error-color, #ef4444);
}

/* Loading and Error States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color, #e2e8f0);
  border-top: 3px solid var(--primary-color, #069e2d);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3,
.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin: 0 0 0.5rem 0;
}

.error-state p,
.empty-state p {
  color: var(--text-muted, #718096);
  margin: 0 0 1rem 0;
}

.empty-transactions {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted, #718096);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .credits-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>









