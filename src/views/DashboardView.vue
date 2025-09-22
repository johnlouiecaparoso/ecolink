<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getProfile } from '@/services/profileService'
import UserDashboard from '@/components/user/UserDashboard.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'

const router = useRouter()
const store = useUserStore()

const user = ref({ name: 'EcoLink User', email: 'user@ecolink.io' })

// Back navigation functionality
const showBackButton = ref(false)
const previousRoute = ref(null)

// Overview metrics data (moved from HomeView)
const overviewMetrics = ref([
  { id: 'mrr', title: 'Current MRR', value: '$12.4k' },
  { id: 'customers', title: 'Current Customers', value: '16,601' },
  { id: 'active', title: 'Active Customers', value: '33%' },
  { id: 'churn', title: 'Churn Rate', value: '2%' },
])

// Navigation items based on user role
const navItems = computed(() => {
  const baseItems = [{ id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: '📊' }]

  // Add role-specific items
  if (store.role === 'user') {
    baseItems.push(
      { id: 'wallet', label: 'Wallet', route: '/wallet', icon: '💰' },
      { id: 'certificates', label: 'Certificates', route: '/certificates', icon: '📜' },
    )
  } else if (store.role === 'project_developer') {
    baseItems.push(
      { id: 'projects', label: 'Projects', route: '/projects', icon: '🌱' },
      { id: 'sales', label: 'Sales Dashboard', route: '/sales', icon: '📈' },
    )
  } else if (store.role === 'buyer_investor') {
    baseItems.push(
      { id: 'marketplace', label: 'Marketplace', route: '/marketplace', icon: '🏪' },
      { id: 'buy-credits', label: 'Buy Credits', route: '/buy-credits', icon: '💳' },
      { id: 'receipts', label: 'Receipts', route: '/receipts', icon: '🧾' },
    )
  } else if (store.role === 'verifier') {
    baseItems.push({ id: 'verifier', label: 'Verifier Dashboard', route: '/verifier', icon: '✅' })
  } else if (store.role === 'admin') {
    baseItems.push(
      { id: 'admin', label: 'Admin Dashboard', route: '/admin', icon: '⚙️' },
      { id: 'users', label: 'Users', route: '/users', icon: '👥' },
      { id: 'analytics', label: 'Analytics', route: '/analytics', icon: '📊' },
      { id: 'database', label: 'Database', route: '/database', icon: '🗄️' },
      { id: 'tables', label: 'Tables', route: '/tables', icon: '📋' },
    )
  }

  return baseItems
})

// Role-based dashboard selection
const showUserDashboard = computed(() => {
  return store.role === 'user' || store.role === 'verifier'
})

const showAdminDashboard = computed(() => {
  return store.isAdmin
})

// User initials for avatar
const userInitials = computed(() => {
  if (user.value.name) {
    return user.value.name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return 'U'
})

const userProfile = ref(null)

// Removed unused metrics - using overviewMetrics instead

async function loadUserProfile() {
  if (!store.session?.user?.id) return

  try {
    userProfile.value = await getProfile(store.session.user.id)
    if (userProfile.value) {
      user.value.name = userProfile.value.full_name || 'EcoLink User'
      user.value.email = store.session.user.email || 'user@ecolink.io'
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

// Removed unused utility functions

function navigateTo(route) {
  // Store current route as previous for back navigation
  previousRoute.value = router.currentRoute.value.path
  router.push(route)
}

function goBack() {
  if (previousRoute.value) {
    router.push(previousRoute.value)
  } else {
    router.push('/dashboard')
  }
}

async function onSignOut() {
  try {
    await store.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

onMounted(async () => {
  await loadUserProfile()
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
          :class="{ active: $route.path === item.route }"
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
          <button v-if="showBackButton" class="back-button" @click="goBack">
            <span class="back-icon">←</span>
            <span class="back-text">Back</span>
          </button>
          <h1 class="page-title">Dashboard</h1>
        </div>

        <div class="header-center">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search projects, transactions, activities"
              class="search-input"
            />
          </div>
        </div>

        <div class="header-right">
          <div class="user-menu">
            <div class="user-avatar">{{ userInitials }}</div>
            <span class="user-name">{{ user.name }}</span>
            <span class="dropdown-arrow">▼</span>
          </div>
        </div>
      </header>

      <!-- Role-based dashboard rendering -->
      <div v-if="showUserDashboard" class="dashboard-content">
        <UserDashboard />
      </div>
      <div v-else-if="showAdminDashboard" class="dashboard-content">
        <AdminDashboard />
      </div>
      <div v-else class="dashboard-content">
        <!-- Overview Section (moved from HomeView) -->
        <section class="overview-section">
          <div class="section-header">
            <h2 class="section-title">Overview</h2>
          </div>

          <div class="metrics-grid">
            <div v-for="metric in overviewMetrics" :key="metric.id" class="metric-card">
              <div class="metric-title">{{ metric.title }}</div>
              <div class="metric-value">{{ metric.value }}</div>
            </div>
          </div>
        </section>

        <!-- Quick Actions Section -->
        <section class="quick-actions-section">
          <div class="section-header">
            <h2 class="section-title">Quick Actions</h2>
          </div>

          <div class="quick-actions-grid">
            <button class="action-btn" @click="navigateTo('/marketplace')">
              <span class="action-icon">🔄</span>
              <span class="action-text">Transactions</span>
            </button>
            <button class="action-btn" @click="navigateTo('/users')">
              <span class="action-icon">👥</span>
              <span class="action-text">Customers</span>
            </button>
            <button class="action-btn" @click="navigateTo('/analytics')">
              <span class="action-icon">📈</span>
              <span class="action-text">Reports</span>
            </button>
            <button class="action-btn" @click="navigateTo('/verifier')">
              <span class="action-icon">🐛</span>
              <span class="action-text">Developer</span>
            </button>
          </div>
        </section>
      </div>
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

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
}

.nav-item.logout {
  margin-top: auto;
  margin-bottom: 0;
  color: #fee2e2;
}

.nav-item.logout:hover {
  background: rgba(254, 226, 226, 0.1);
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

.sidebar-spacer {
  flex: 1;
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
  font-size: 12px;
  font-weight: 600;
  color: white;
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

/* Dashboard Content */
.dashboard-content {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
}

/* Back Button */
.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 16px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.back-button:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #10b981;
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

.back-text {
  font-size: 14px;
}

/* Overview Section */
.overview-section {
  margin-bottom: 32px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

/* Quick Actions Section */
.quick-actions-section {
  margin-bottom: 32px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: #1e293b;
}

.action-btn:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 32px;
}

.action-text {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .dashboard-content {
    padding: 16px;
  }

  .top-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 16px;
  }

  .header-center {
    margin: 0;
  }
}
</style>
