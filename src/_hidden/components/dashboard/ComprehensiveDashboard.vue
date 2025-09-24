<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const store = useUserStore()

// Dashboard sections
const activeSection = ref('overview')
const sections = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'wallet', label: 'Wallet', icon: '💰' },
  { id: 'transactions', label: 'Transactions', icon: '🔄' },
  { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
  { id: 'projects', label: 'Projects', icon: '🌱' },
  { id: 'sales', label: 'Sales', icon: '📈' },
]

// Wallet data
const walletBalance = ref(1250.75)
const walletTransactions = ref([
  {
    id: 1,
    type: 'credit',
    amount: 500,
    description: 'Carbon credit purchase',
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: 2,
    type: 'debit',
    amount: -150,
    description: 'Project investment',
    date: '2024-01-14',
    status: 'completed',
  },
  {
    id: 3,
    type: 'credit',
    amount: 200,
    description: 'Credit sale',
    date: '2024-01-13',
    status: 'pending',
  },
])

// Transaction history
const allTransactions = ref([
  {
    id: 1,
    type: 'purchase',
    amount: 500,
    description: 'Solar Farm Project - 100 credits',
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: 2,
    type: 'sale',
    amount: -200,
    description: 'Wind Energy Project - 50 credits',
    date: '2024-01-14',
    status: 'completed',
  },
  {
    id: 3,
    type: 'transfer',
    amount: 100,
    description: 'Credit transfer from partner',
    date: '2024-01-13',
    status: 'completed',
  },
  {
    id: 4,
    type: 'purchase',
    amount: 300,
    description: 'Hydroelectric Project - 75 credits',
    date: '2024-01-12',
    status: 'pending',
  },
])

// Marketplace data
const marketplaceProjects = ref([
  {
    id: 1,
    name: 'Solar Farm California',
    price: 15.5,
    credits: 1000,
    type: 'solar',
    status: 'active',
  },
  { id: 2, name: 'Wind Energy Texas', price: 12.75, credits: 750, type: 'wind', status: 'active' },
  {
    id: 3,
    name: 'Hydroelectric Oregon',
    price: 18.25,
    credits: 500,
    type: 'hydro',
    status: 'active',
  },
])

// Projects data
const userProjects = ref([
  {
    id: 1,
    name: 'Green Roof Initiative',
    status: 'active',
    credits: 250,
    revenue: 3750,
    progress: 75,
  },
  { id: 2, name: 'Community Solar', status: 'development', credits: 500, revenue: 0, progress: 30 },
  { id: 3, name: 'Urban Forest', status: 'completed', credits: 100, revenue: 1500, progress: 100 },
])

// Sales data
const salesMetrics = ref({
  totalRevenue: 5250,
  totalCredits: 850,
  activeProjects: 2,
  completedProjects: 1,
})

const salesHistory = ref([
  { month: 'Jan', revenue: 1500, credits: 100 },
  { month: 'Feb', revenue: 2000, credits: 150 },
  { month: 'Mar', revenue: 1750, credits: 125 },
])

// Overview metrics
const overviewMetrics = ref([
  { title: 'Total Balance', value: `$${walletBalance.value}`, icon: '💰', color: '#10b981' },
  {
    title: 'Active Projects',
    value: userProjects.value.filter((p) => p.status === 'active').length,
    icon: '🌱',
    color: '#3b82f6',
  },
  {
    title: 'Total Credits',
    value: userProjects.value.reduce((sum, p) => sum + p.credits, 0),
    icon: '📜',
    color: '#8b5cf6',
  },
  {
    title: 'Total Revenue',
    value: `$${salesMetrics.value.totalRevenue}`,
    icon: '📈',
    color: '#f59e0b',
  },
])

// Functions
function setActiveSection(section) {
  activeSection.value = section
}

function navigateToProject(projectId) {
  router.push(`/projects/${projectId}`)
}

function buyCredits(projectId) {
  const project = marketplaceProjects.value.find((p) => p.id === projectId)
  if (project) {
    // Implement buy logic
    console.log(
      `Buying ${project.credits} credits from ${project.name} for $${project.price * project.credits}`,
    )
  }
}

function sellCredits(projectId) {
  const project = userProjects.value.find((p) => p.id === projectId)
  if (project) {
    // Implement sell logic
    console.log(`Selling credits from ${project.name}`)
  }
}

function addNewProject() {
  router.push('/projects/new')
}

// Computed properties
const filteredTransactions = computed(() => {
  if (activeSection.value === 'wallet') {
    return walletTransactions.value
  }
  return allTransactions.value
})

const filteredProjects = computed(() => {
  if (activeSection.value === 'marketplace') {
    return marketplaceProjects.value
  }
  return userProjects.value
})
</script>

<template>
  <div class="comprehensive-dashboard">
    <!-- Dashboard Navigation -->
    <div class="dashboard-nav">
      <button
        v-for="section in sections"
        :key="section.id"
        class="nav-button"
        :class="{ active: activeSection === section.id }"
        @click="setActiveSection(section.id)"
      >
        <span class="nav-icon">{{ section.icon }}</span>
        <span class="nav-label">{{ section.label }}</span>
      </button>
    </div>

    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <!-- Overview Section -->
      <div v-if="activeSection === 'overview'" class="section-content">
        <h2 class="section-title">Dashboard Overview</h2>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div
            v-for="metric in overviewMetrics"
            :key="metric.title"
            class="metric-card"
            :style="{ '--metric-color': metric.color }"
          >
            <div class="metric-icon">{{ metric.icon }}</div>
            <div class="metric-content">
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-title">{{ metric.title }}</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="actions-grid">
            <button class="action-button" @click="setActiveSection('wallet')">
              <span class="action-icon">💰</span>
              <span class="action-label">View Wallet</span>
            </button>
            <button class="action-button" @click="setActiveSection('marketplace')">
              <span class="action-icon">🏪</span>
              <span class="action-label">Browse Market</span>
            </button>
            <button class="action-button" @click="setActiveSection('projects')">
              <span class="action-icon">🌱</span>
              <span class="action-label">My Projects</span>
            </button>
            <button class="action-button" @click="addNewProject">
              <span class="action-icon">➕</span>
              <span class="action-label">Add Project</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Wallet Section -->
      <div v-if="activeSection === 'wallet'" class="section-content">
        <h2 class="section-title">Wallet</h2>

        <div class="wallet-summary">
          <div class="balance-card">
            <div class="balance-amount">${{ walletBalance.toFixed(2) }}</div>
            <div class="balance-label">Available Balance</div>
          </div>
        </div>

        <div class="transactions-list">
          <h3>Recent Transactions</h3>
          <div
            class="transaction-item"
            v-for="transaction in walletTransactions"
            :key="transaction.id"
          >
            <div class="transaction-icon">
              {{ transaction.type === 'credit' ? '⬆️' : '⬇️' }}
            </div>
            <div class="transaction-details">
              <div class="transaction-description">{{ transaction.description }}</div>
              <div class="transaction-date">{{ transaction.date }}</div>
            </div>
            <div
              class="transaction-amount"
              :class="{
                credit: transaction.type === 'credit',
                debit: transaction.type === 'debit',
              }"
            >
              {{ transaction.type === 'credit' ? '+' : '' }}${{ transaction.amount }}
            </div>
            <div class="transaction-status" :class="transaction.status">
              {{ transaction.status }}
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Section -->
      <div v-if="activeSection === 'transactions'" class="section-content">
        <h2 class="section-title">Transaction History</h2>

        <div class="transactions-list">
          <div
            class="transaction-item"
            v-for="transaction in allTransactions"
            :key="transaction.id"
          >
            <div class="transaction-icon">
              {{
                transaction.type === 'purchase' ? '🛒' : transaction.type === 'sale' ? '💰' : '🔄'
              }}
            </div>
            <div class="transaction-details">
              <div class="transaction-description">{{ transaction.description }}</div>
              <div class="transaction-date">{{ transaction.date }}</div>
            </div>
            <div
              class="transaction-amount"
              :class="{ credit: transaction.amount > 0, debit: transaction.amount < 0 }"
            >
              {{ transaction.amount > 0 ? '+' : '' }}${{ transaction.amount }}
            </div>
            <div class="transaction-status" :class="transaction.status">
              {{ transaction.status }}
            </div>
          </div>
        </div>
      </div>

      <!-- Marketplace Section -->
      <div v-if="activeSection === 'marketplace'" class="section-content">
        <h2 class="section-title">Marketplace</h2>

        <div class="projects-grid">
          <div v-for="project in marketplaceProjects" :key="project.id" class="project-card">
            <div class="project-header">
              <div class="project-type">{{ project.type }}</div>
              <div class="project-status" :class="project.status">{{ project.status }}</div>
            </div>
            <div class="project-name">{{ project.name }}</div>
            <div class="project-details">
              <div class="project-credits">{{ project.credits }} credits</div>
              <div class="project-price">${{ project.price }}/credit</div>
            </div>
            <div class="project-total">
              Total: ${{ (project.price * project.credits).toFixed(2) }}
            </div>
            <button class="buy-button" @click="buyCredits(project.id)">Buy Credits</button>
          </div>
        </div>
      </div>

      <!-- Projects Section -->
      <div v-if="activeSection === 'projects'" class="section-content">
        <div class="section-header">
          <h2 class="section-title">My Projects</h2>
          <button class="add-project-btn" @click="addNewProject">
            <span class="btn-icon">➕</span>
            Add Project
          </button>
        </div>

        <div class="projects-grid">
          <div v-for="project in userProjects" :key="project.id" class="project-card">
            <div class="project-header">
              <div class="project-status" :class="project.status">{{ project.status }}</div>
              <div class="project-progress">{{ project.progress }}%</div>
            </div>
            <div class="project-name">{{ project.name }}</div>
            <div class="project-metrics">
              <div class="metric">
                <span class="metric-label">Credits:</span>
                <span class="metric-value">{{ project.credits }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Revenue:</span>
                <span class="metric-value">${{ project.revenue }}</span>
              </div>
            </div>
            <div class="project-actions">
              <button class="action-btn view-btn" @click="navigateToProject(project.id)">
                View Details
              </button>
              <button class="action-btn sell-btn" @click="sellCredits(project.id)">
                Sell Credits
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Section -->
      <div v-if="activeSection === 'sales'" class="section-content">
        <h2 class="section-title">Sales Dashboard</h2>

        <div class="sales-metrics">
          <div class="sales-metric">
            <div class="metric-value">${{ salesMetrics.totalRevenue }}</div>
            <div class="metric-label">Total Revenue</div>
          </div>
          <div class="sales-metric">
            <div class="metric-value">{{ salesMetrics.totalCredits }}</div>
            <div class="metric-label">Credits Sold</div>
          </div>
          <div class="sales-metric">
            <div class="metric-value">{{ salesMetrics.activeProjects }}</div>
            <div class="metric-label">Active Projects</div>
          </div>
          <div class="sales-metric">
            <div class="metric-value">{{ salesMetrics.completedProjects }}</div>
            <div class="metric-label">Completed</div>
          </div>
        </div>

        <div class="sales-chart">
          <h3>Sales History</h3>
          <div class="chart-container">
            <div v-for="data in salesHistory" :key="data.month" class="chart-bar">
              <div class="bar" :style="{ height: `${(data.revenue / 2000) * 100}%` }"></div>
              <div class="bar-label">{{ data.month }}</div>
              <div class="bar-value">${{ data.revenue }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comprehensive-dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
}

.dashboard-nav {
  display: flex;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  overflow-x: auto;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}

.nav-button:hover {
  background: #f1f5f9;
}

.nav-button.active {
  background: #f1f5f9;
  border-bottom-color: #10b981;
  color: #10b981;
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  font-weight: 500;
  font-size: 14px;
}

.dashboard-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.section-content {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.add-project-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-project-btn:hover {
  background: #059669;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid var(--metric-color);
}

.metric-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 12px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.metric-title {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* Quick Actions */
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #f1f5f9;
  border-color: #10b981;
}

.action-icon {
  font-size: 24px;
}

.action-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* Wallet */
.wallet-summary {
  margin-bottom: 32px;
}

.balance-card {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.balance-amount {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.balance-label {
  font-size: 16px;
  opacity: 0.9;
}

/* Transactions */
.transactions-list h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.transaction-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
}

.transaction-details {
  flex: 1;
}

.transaction-description {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}

.transaction-date {
  font-size: 12px;
  color: #64748b;
}

.transaction-amount {
  font-weight: 600;
  font-size: 16px;
}

.transaction-amount.credit {
  color: #10b981;
}

.transaction-amount.debit {
  color: #ef4444;
}

.transaction-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.transaction-status.completed {
  background: #dcfce7;
  color: #166534;
}

.transaction-status.pending {
  background: #fef3c7;
  color: #92400e;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-type {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.project-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.project-status.active {
  background: #dcfce7;
  color: #166534;
}

.project-status.development {
  background: #fef3c7;
  color: #92400e;
}

.project-status.completed {
  background: #dbeafe;
  color: #1e40af;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.project-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-credits,
.project-price {
  font-size: 14px;
  color: #64748b;
}

.project-total {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.buy-button {
  width: 100%;
  padding: 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.buy-button:hover {
  background: #059669;
}

.project-metrics {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #64748b;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn {
  background: #f1f5f9;
  color: #374151;
}

.view-btn:hover {
  background: #e2e8f0;
}

.sell-btn {
  background: #fef3c7;
  color: #92400e;
}

.sell-btn:hover {
  background: #fde68a;
}

/* Sales Dashboard */
.sales-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.sales-metric {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sales-metric .metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.sales-metric .metric-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.sales-chart {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sales-chart h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

.chart-container {
  display: flex;
  align-items: end;
  gap: 20px;
  height: 200px;
  padding: 20px 0;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #10b981, #34d399);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s ease;
}

.bar-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.bar-value {
  font-size: 12px;
  color: #1e293b;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-nav {
    padding: 0 16px;
  }

  .nav-button {
    padding: 12px 16px;
  }

  .dashboard-content {
    padding: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

