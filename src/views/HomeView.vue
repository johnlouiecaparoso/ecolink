<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const store = useUserStore()

const user = ref({ name: 'EcoLink User', email: 'user@ecolink.io' })

// Metrics data
const metrics = ref([
  { id: 'mrr', title: 'Current MRR', value: '$12.4k' },
  { id: 'customers', title: 'Current Customers', value: '16,601' },
  { id: 'active', title: 'Active Customers', value: '33%' },
  { id: 'churn', title: 'Churn Rate', value: '2%' },
])

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: '📊' },
  { id: 'transactions', label: 'Transactions', route: '/marketplace', icon: '🔄' },
  { id: 'customers', label: 'Customers', route: '/users', icon: '👥' },
  { id: 'reports', label: 'Reports', route: '/analytics', icon: '📈' },
  { id: 'developer', label: 'Developer', route: '/verifier', icon: '🐛' },
]

// Chart data
const trendData = ref([
  { month: 'Jan', new: 5000, renewals: 8000, churns: 2000 },
  { month: 'Feb', new: 6000, renewals: 8500, churns: 1500 },
  { month: 'Mar', new: 7000, renewals: 9000, churns: 1800 },
  { month: 'Apr', new: 5500, renewals: 9200, churns: 2200 },
  { month: 'May', new: 8000, renewals: 8800, churns: 1600 },
  { month: 'Jun', new: 7500, renewals: 9500, churns: 1900 },
  { month: 'Jul', new: 9000, renewals: 9800, churns: 2100 },
])

const salesData = ref({
  total: 342,
  plans: [
    { name: 'BASIC PLAN', value: 120, color: '#10b981' },
    { name: 'ADVANCED PLAN', value: 150, color: '#059669' },
    { name: 'PRO PLAN', value: 50, color: '#047857' },
    { name: 'ENTERPRISE PLAN', value: 22, color: '#065f46' },
  ],
})

const transactions = ref([
  { name: 'S. Evergreen', plan: 'PRO', amount: '+$49' },
  { name: 'A. Martinez', plan: 'ADVANCED', amount: '+$99' },
  { name: 'J. Wilson', plan: 'BASIC', amount: '+$29' },
  { name: 'M. Chen', plan: 'ENTERPRISE', amount: '+$199' },
  { name: 'R. Johnson', plan: 'PRO', amount: '+$49' },
])

const supportTickets = ref([
  { email: 'jessica.smith123@example.com', issue: 'Login Issue', status: 'OPEN' },
  { email: 'mike.wilson@company.com', issue: 'Payment Problem', status: 'PENDING' },
  { email: 'sarah.davis@gmail.com', issue: 'Feature Request', status: 'CLOSED' },
  { email: 'tom.brown@startup.io', issue: 'Account Setup', status: 'OPEN' },
])

const selectedFilter = ref('All')
const timeRange = ref('This year')

function navigateTo(route) {
  router.push(route)
}

async function onSignOut() {
  await store.logout().catch(() => {})
  store.session = null
  router.push('/login')
}

onMounted(() => {
  // Initialize any data if needed
})
</script>

<template>
  <div class="home-layout">
    <!-- Left Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">
          <div class="logo-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
          </div>
        </div>
        <div class="brand-text">EcoLink</div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          class="nav-item"
          @click="navigateTo(item.route)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-spacer"></div>

      <button class="nav-item logout" type="button" @click="onSignOut">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Log out</span>
      </button>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">Dashboard</h1>
        </div>

        <div class="header-center">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search transactions, customers, subscriptions"
              class="search-input"
            />
          </div>
        </div>

        <div class="header-right">
          <div class="user-menu">
            <div class="user-avatar">👤</div>
            <span class="user-name">{{ user.name }}</span>
            <span class="dropdown-arrow">▼</span>
          </div>
        </div>
      </header>

      <!-- Metrics Cards -->
      <section class="metrics-section">
        <div class="metric-card" v-for="metric in metrics" :key="metric.id">
          <div class="metric-title">{{ metric.title }}</div>
          <div class="metric-value">{{ metric.value }}</div>
        </div>
      </section>

      <!-- Dashboard Grid -->
      <section class="dashboard-grid">
        <!-- Trend Chart (Large) -->
        <div class="dashboard-card large">
          <div class="card-header">
            <h3 class="card-title">Trend</h3>
            <div class="card-controls">
              <div class="legend">
                <div class="legend-item">
                  <div class="legend-color new"></div>
                  <span>NEW</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color renewals"></div>
                  <span>RENEWALS</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color churns"></div>
                  <span>CHURNS</span>
                </div>
              </div>
              <select v-model="timeRange" class="time-selector">
                <option value="This year">This year</option>
                <option value="Last year">Last year</option>
                <option value="All time">All time</option>
              </select>
            </div>
          </div>
          <div class="chart-container">
            <div class="bar-chart">
              <div v-for="data in trendData" :key="data.month" class="chart-month">
                <div class="month-label">{{ data.month }}</div>
                <div class="bars">
                  <div class="bar new" :style="{ height: data.new / 1000 + 'px' }"></div>
                  <div class="bar renewals" :style="{ height: data.renewals / 1000 + 'px' }"></div>
                  <div class="bar churns" :style="{ height: data.churns / 1000 + 'px' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Chart -->
        <div class="dashboard-card medium">
          <div class="card-header">
            <h3 class="card-title">Sales</h3>
            <select v-model="timeRange" class="time-selector">
              <option value="This year">This year</option>
            </select>
          </div>
          <div class="sales-chart">
            <div class="donut-chart">
              <div class="donut-center">
                <div class="sales-number">{{ salesData.total }}</div>
                <div class="sales-label">SALES</div>
              </div>
            </div>
            <div class="sales-legend">
              <div v-for="plan in salesData.plans" :key="plan.name" class="legend-item">
                <div class="legend-color" :style="{ backgroundColor: plan.color }"></div>
                <span>{{ plan.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions List -->
        <div class="dashboard-card medium">
          <div class="card-header">
            <h3 class="card-title">Transactions</h3>
          </div>
          <div class="transactions-list">
            <div
              v-for="transaction in transactions"
              :key="transaction.name"
              class="transaction-item"
            >
              <div class="transaction-info">
                <div class="transaction-name">{{ transaction.name }}</div>
                <div
                  class="transaction-plan"
                  :class="'plan-' + transaction.plan.toLowerCase().replace(' ', '-')"
                >
                  {{ transaction.plan }}
                </div>
              </div>
              <div class="transaction-amount">{{ transaction.amount }}</div>
            </div>
            <button class="view-all-btn">View all transactions</button>
          </div>
        </div>

        <!-- Support Tickets -->
        <div class="dashboard-card large">
          <div class="card-header">
            <h3 class="card-title">Support Tickets</h3>
            <div class="card-controls">
              <div class="filter-tabs">
                <button
                  v-for="filter in ['All', 'Open', 'Pending', 'Closed']"
                  :key="filter"
                  :class="['filter-tab', { active: selectedFilter === filter }]"
                  @click="selectedFilter = filter"
                >
                  {{ filter }}
                </button>
              </div>
              <select v-model="timeRange" class="time-selector">
                <option value="This week">This week</option>
              </select>
            </div>
          </div>
          <div class="tickets-list">
            <div v-for="ticket in supportTickets" :key="ticket.email" class="ticket-item">
              <div class="ticket-status" :class="'status-' + ticket.status.toLowerCase()"></div>
              <div class="ticket-info">
                <div class="ticket-email">{{ ticket.email }}</div>
                <div class="ticket-issue">{{ ticket.issue }}</div>
              </div>
              <div class="ticket-badge" :class="'badge-' + ticket.status.toLowerCase()">
                {{ ticket.status }}
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Demographic -->
        <div class="dashboard-card large">
          <div class="card-header">
            <h3 class="card-title">Customer Demographic</h3>
          </div>
          <div class="demographic-content">
            <div class="demographic-legend">
              <div class="legend-item">
                <div class="legend-color active"></div>
                <span>ACTIVE</span>
              </div>
              <div class="legend-item">
                <div class="legend-color inactive"></div>
                <span>INACTIVE</span>
              </div>
            </div>
            <div class="world-map">
              <div class="map-placeholder">🌍</div>
              <div class="map-label">World Map</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: #f8fafc;
}

/* Sidebar Styles */
.sidebar {
  background: #10b981;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 24px 8px;
}

.brand-logo {
  width: 32px;
  height: 32px;
  position: relative;
}

.logo-circles {
  position: relative;
  width: 100%;
  height: 100%;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: white;
}

.circle-1 {
  width: 20px;
  height: 20px;
  top: 2px;
  left: 2px;
  opacity: 0.9;
}

.circle-2 {
  width: 16px;
  height: 16px;
  top: 8px;
  left: 8px;
  opacity: 0.7;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: white;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.logout {
  margin-top: auto;
  margin-bottom: 0;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

/* Header */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.header-left .page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-center {
  flex: 1;
  max-width: 500px;
  margin: 0 32px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
  background: white;
}

.header-right .user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.dropdown-arrow {
  color: #64748b;
  font-size: 12px;
}

/* Metrics Section */
.metrics-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 32px;
}

.metric-card {
  background: #10b981;
  color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
  padding: 0 32px 32px 32px;
}

.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dashboard-card.large {
  grid-column: span 1;
}

.dashboard-card.medium {
  grid-column: span 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-selector {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

/* Trend Chart */
.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.new {
  background: #10b981;
}
.legend-color.renewals {
  background: #059669;
}
.legend-color.churns {
  background: #86efac;
}

.bar-chart {
  display: flex;
  align-items: end;
  gap: 12px;
  height: 200px;
}

.chart-month {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.month-label {
  font-size: 12px;
  color: #64748b;
}

.bars {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 160px;
}

.bar {
  width: 8px;
  border-radius: 2px 2px 0 0;
}

.bar.new {
  background: #10b981;
}
.bar.renewals {
  background: #059669;
}
.bar.churns {
  background: #86efac;
}

/* Sales Chart */
.sales-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.donut-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #10b981 0deg 126deg,
    #059669 126deg 252deg,
    #047857 252deg 306deg,
    #065f46 306deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.donut-chart::before {
  content: '';
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  position: absolute;
}

.donut-center {
  z-index: 1;
  text-align: center;
}

.sales-number {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
}

.sales-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.sales-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* Transactions */
.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.transaction-plan {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
}

.transaction-plan.plan-pro {
  background: #10b981;
}
.transaction-plan.plan-advanced {
  background: #059669;
}
.transaction-plan.plan-basic {
  background: #86efac;
  color: #065f46;
}
.transaction-plan.plan-enterprise {
  background: #047857;
}

.transaction-amount {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.view-all-btn {
  width: 100%;
  padding: 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
}

/* Support Tickets */
.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.ticket-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.ticket-status.status-open {
  background: #10b981;
}
.ticket-status.status-pending {
  background: #f59e0b;
}
.ticket-status.status-closed {
  background: #6b7280;
}

.ticket-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-email {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.ticket-issue {
  font-size: 12px;
  color: #64748b;
}

.ticket-badge {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.ticket-badge.badge-open {
  background: #dcfce7;
  color: #166534;
}
.ticket-badge.badge-pending {
  background: #fef3c7;
  color: #92400e;
}
.ticket-badge.badge-closed {
  background: #f3f4f6;
  color: #374151;
}

/* Customer Demographic */
.demographic-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.demographic-legend {
  display: flex;
  gap: 16px;
}

.demographic-legend .legend-color.active {
  background: #10b981;
}
.demographic-legend .legend-color.inactive {
  background: #86efac;
}

.world-map {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f8fafc;
  border-radius: 8px;
}

.map-placeholder {
  font-size: 48px;
  margin-bottom: 8px;
}

.map-label {
  font-size: 14px;
  color: #64748b;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-card.large,
  .dashboard-card.medium {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .metrics-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .top-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-center {
    margin: 0;
  }
}
</style>
