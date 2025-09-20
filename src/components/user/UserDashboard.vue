<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import { ROLES, PERMISSIONS } from '@/constants/roles'
import { projectService } from '@/services/projectService'
import { getWalletBalance } from '@/services/walletService'
import UserProfile from './UserProfile.vue'

const userStore = useUserStore()

const activeTab = ref('overview')
const userStats = ref({
  projects: 0,
  walletBalance: 0,
  kycLevel: 0,
})

const recentProjects = ref([])
const projectStats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
})

const tabs = computed(() => {
  const baseTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]

  // Add role-specific tabs
  if (userStore.hasPermission(PERMISSIONS.MANAGE_PROJECTS)) {
    baseTabs.push({ id: 'projects', label: 'My Projects', icon: '📁' })
  }

  if (userStore.hasPermission(PERMISSIONS.MANAGE_WALLET)) {
    baseTabs.push({ id: 'wallet', label: 'Wallet', icon: '💰' })
  }

  return baseTabs
})

const userRole = computed(() => userStore.role)
const userProfile = computed(() => userStore.profile)

const roleDisplayName = computed(() => {
  switch (userRole.value) {
    case ROLES.SUPER_ADMIN:
      return 'Super Administrator'
    case ROLES.ADMIN:
      return 'Administrator'
    case ROLES.VERIFIER:
      return 'Verifier'
    case ROLES.USER:
    default:
      return 'User'
  }
})

const quickActions = computed(() => {
  const actions = []

  if (userStore.hasPermission(PERMISSIONS.MANAGE_PROJECTS)) {
    actions.push({
      id: 'create-project',
      label: 'Create Project',
      icon: '➕',
      action: () => {
        // Navigate to projects page with form open
        window.location.href = '/projects?action=create'
      },
    })
  }

  if (userStore.hasPermission(PERMISSIONS.VIEW_MARKETPLACE)) {
    actions.push({
      id: 'browse-marketplace',
      label: 'Browse Marketplace',
      icon: '🛒',
      action: () => console.log('Browse marketplace'),
    })
  }

  if (userStore.hasPermission(PERMISSIONS.MANAGE_WALLET)) {
    actions.push({
      id: 'manage-wallet',
      label: 'Manage Wallet',
      icon: '💰',
      action: () => console.log('Manage wallet'),
    })
  }

  return actions
})

async function loadUserStats() {
  try {
    // Load project statistics
    const projects = await projectService.getUserProjects()
    const stats = await projectService.getProjectStats()

    // Load wallet balance
    let walletBalance = 0
    try {
      const wallet = await getWalletBalance()
      walletBalance = wallet.current_balance || 0
    } catch (error) {
      console.error('Error loading wallet balance:', error)
      // Fallback to 0 if wallet not found
    }

    userStats.value = {
      projects: projects.length,
      walletBalance: walletBalance,
      kycLevel: userProfile.value?.kyc_level || 0,
    }

    // Update project stats
    projectStats.value = {
      total: projects.length,
      pending: projects.filter((p) => p.status === 'pending').length,
      approved: projects.filter((p) => p.status === 'approved').length,
      rejected: projects.filter((p) => p.status === 'rejected').length,
    }

    // Get recent projects (last 3)
    recentProjects.value = projects
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3)
  } catch (error) {
    console.error('Error loading user stats:', error)
    // Fallback to mock data
    userStats.value = {
      projects: 0,
      walletBalance: 0,
      kycLevel: userProfile.value?.kyc_level || 0,
    }
  }
}

onMounted(() => {
  loadUserStats()
})
</script>

<template>
  <div class="user-dashboard">
    <div class="welcome-section">
      <h1>Welcome back, {{ userProfile?.full_name || 'User' }}!</h1>
      <p>You're logged in as a {{ roleDisplayName.toLowerCase() }}</p>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="overview">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📁</div>
            <div class="stat-content">
              <h3>{{ userStats.projects }}</h3>
              <p>Total Projects</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <h3>{{ projectStats.pending }}</h3>
              <p>Pending Review</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>{{ projectStats.approved }}</h3>
              <p>Approved</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>${{ userStats.walletBalance.toLocaleString() }}</h3>
              <p>Wallet Balance</p>
            </div>
          </div>
        </div>

        <div class="quick-actions-section">
          <h3>Quick Actions</h3>
          <div class="quick-actions">
            <button
              v-for="action in quickActions"
              :key="action.id"
              class="action-btn"
              @click="action.action"
            >
              <span class="action-icon">{{ action.icon }}</span>
              {{ action.label }}
            </button>
          </div>
        </div>

        <div class="recent-activity">
          <h3>Recent Projects</h3>
          <div v-if="recentProjects.length === 0" class="no-projects">
            <p>No projects yet. Create your first project to get started!</p>
            <button
              class="action-btn"
              @click="() => (window.location.href = '/projects?action=create')"
            >
              <span class="action-icon">➕</span>
              Create Project
            </button>
          </div>
          <div v-else class="activity-list">
            <div
              v-for="project in recentProjects"
              :key="project.id"
              class="activity-item"
              @click="() => (window.location.href = '/projects')"
            >
              <div class="activity-icon">📁</div>
              <div class="activity-content">
                <p>{{ project.title }}</p>
                <span class="activity-time">
                  {{ new Date(project.created_at).toLocaleDateString() }}
                  • {{ project.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Tab -->
      <div v-else-if="activeTab === 'profile'" class="profile">
        <UserProfile />
      </div>

      <!-- Projects Tab -->
      <div v-else-if="activeTab === 'projects'" class="projects">
        <div class="placeholder">
          <div class="placeholder-icon">📁</div>
          <h3>My Projects</h3>
          <p>Project management functionality will be implemented here</p>
        </div>
      </div>

      <!-- Wallet Tab -->
      <div v-else-if="activeTab === 'wallet'" class="wallet">
        <div class="placeholder">
          <div class="placeholder-icon">💰</div>
          <h3>Wallet</h3>
          <p>Wallet management functionality will be implemented here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-dashboard {
  padding: 24px;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-section h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--ecolink-text);
}

.welcome-section p {
  margin: 0;
  color: var(--ecolink-muted);
  font-size: 16px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--ecolink-border);
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--ecolink-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--ecolink-text);
  background: var(--ecolink-bg);
}

.tab.active {
  color: var(--ecolink-primary);
  border-bottom-color: var(--ecolink-primary);
}

.tab-icon {
  font-size: 16px;
}

.tab-content {
  min-height: 400px;
}

.overview {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
}

.stat-icon {
  font-size: 32px;
}

.stat-content h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--ecolink-text);
}

.stat-content p {
  margin: 0;
  color: var(--ecolink-muted);
  font-size: 14px;
}

.quick-actions-section {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 24px;
}

.quick-actions-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ecolink-text);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--ecolink-bg);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  color: var(--ecolink-text);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--ecolink-primary-50);
  border-color: var(--ecolink-primary);
}

.action-icon {
  font-size: 20px;
}

.recent-activity {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 24px;
}

.recent-activity h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ecolink-text);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--ecolink-bg);
  border-radius: var(--radius);
}

.activity-icon {
  font-size: 20px;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 4px 0;
  color: var(--ecolink-text);
}

.activity-time {
  color: var(--ecolink-muted);
  font-size: 12px;
}

.no-projects {
  text-align: center;
  padding: 40px 20px;
  color: var(--ecolink-muted);
}

.no-projects p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.no-projects .action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--ecolink-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.no-projects .action-btn:hover {
  background: var(--ecolink-primary-dark);
}

.placeholder {
  text-align: center;
  padding: 60px 20px;
  color: var(--ecolink-muted);
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.placeholder h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ecolink-text);
}

.placeholder p {
  margin: 0;
}
</style>
