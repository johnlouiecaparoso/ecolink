<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getUserProjects } from '@/services/projectService'
import { getProfile } from '@/services/profileService'
import { getTransactions } from '@/services/walletService'
import ProjectForm from '@/components/ProjectForm.vue'
import UserDashboard from '@/components/user/UserDashboard.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'
import PageLayout from '@/components/layout/PageLayout.vue'

const router = useRouter()
const store = useUserStore()

const user = ref({ name: 'EcoLink User', email: 'user@ecolink.io' })

// Role-based dashboard selection
const showUserDashboard = computed(() => {
  return store.role === 'user' || store.role === 'verifier'
})

const showAdminDashboard = computed(() => {
  return store.isAdmin
})

const showProjectForm = ref(false)
const userProjects = ref([])
const loadingProjects = ref(false)
const userProfile = ref(null)
const recentTransactions = ref([])

const metrics = ref([
  { id: 'projects', title: 'My Projects', value: '0', icon: '🌱' },
  { id: 'wallet', title: 'Wallet Balance', value: '₱0.00', icon: '💰' },
  { id: 'transactions', title: 'Transactions', value: '0', icon: '💳' },
  { id: 'verifications', title: 'Verifications', value: '0', icon: '✅' },
])

async function loadUserProjects() {
  if (!store.session?.user?.id) return

  loadingProjects.value = true
  try {
    userProjects.value = await getUserProjects()
  } catch (error) {
    console.error('Error loading projects:', error)
  } finally {
    loadingProjects.value = false
  }
}

function showNewProjectForm() {
  showProjectForm.value = true
}

function onProjectSubmitted() {
  showProjectForm.value = false
  loadUserProjects()
}

function onProjectFormCancel() {
  showProjectForm.value = false
}

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

async function loadWalletData() {
  if (!store.session?.user?.id) return

  try {
    const transactions = await getTransactions()
    recentTransactions.value = transactions.slice(0, 5)
  } catch (error) {
    console.error('Error loading wallet data:', error)
  }
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

onMounted(async () => {
  await loadUserProjects()
  await loadUserProfile()
  await loadWalletData()
})
</script>

<template>
  <PageLayout>
    <!-- Role-based dashboard rendering -->
    <div v-if="showUserDashboard">
      <UserDashboard />
    </div>
    <div v-else-if="showAdminDashboard">
      <AdminDashboard />
    </div>
    <div v-else class="dashboard-content">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showNewProjectForm">+ New Project</button>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="dashboard-main">
        <section class="metrics">
          <div v-for="m in metrics" :key="m.id" class="metric-card">
            <div class="metric-title">{{ m.title }}</div>
            <div class="metric-value">{{ m.value }}</div>
          </div>
        </section>

        <!-- Projects Section -->
        <section class="projects-section">
          <div class="section-header">
            <h2 class="section-title">Your Projects</h2>
            <button class="btn btn-primary" @click="showNewProjectForm">+ Add Project</button>
          </div>

          <div v-if="loadingProjects" class="loading-state">Loading your projects...</div>

          <div v-else-if="userProjects.length === 0" class="empty-state">
            <div class="empty-icon">🌱</div>
            <h3>No projects yet</h3>
            <p>Start by submitting your first climate-positive project!</p>
            <button class="btn btn-primary" @click="showNewProjectForm">
              Submit Your First Project
            </button>
          </div>

          <div v-else class="projects-grid">
            <div v-for="project in userProjects" :key="project.id" class="project-card">
              <div class="project-header">
                <h3 class="project-title">{{ project.title }}</h3>
                <span class="project-status" :class="`status-${project.status}`">{{
                  project.status
                }}</span>
              </div>
              <p class="project-methodology">{{ project.methodology }}</p>
              <div class="project-meta">
                <span class="project-location">📍 {{ project.location }}</span>
                <span v-if="project.docs_url" class="project-docs">
                  📄
                  <a :href="project.docs_url" target="_blank" rel="noopener">View Documentation</a>
                </span>
              </div>
              <div class="project-footer">
                <span class="project-date">
                  Created {{ new Date(project.created_at).toLocaleDateString() }}
                </span>
                <span v-if="project.approved_at" class="project-approved">
                  ✅ Approved {{ new Date(project.approved_at).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Activity & Transactions -->
        <section class="activity-section">
          <div class="section-header">
            <h2 class="section-title">Recent Activity</h2>
            <button class="btn btn-ghost" @click="loadWalletData">Refresh</button>
          </div>

          <div class="activity-grid">
            <!-- Recent Transactions -->
            <div class="activity-card">
              <div class="card-header">
                <h3 class="card-title">Recent Transactions</h3>
                <span class="card-icon">💳</span>
              </div>
              <div class="card-content">
                <div v-if="recentTransactions.length === 0" class="empty-state">
                  <div class="empty-icon">📋</div>
                  <p>No recent transactions</p>
                  <button class="btn btn-primary" @click="() => router.push('/wallet')">
                    Go to Wallet
                  </button>
                </div>
                <div v-else class="transaction-list">
                  <div
                    v-for="transaction in recentTransactions"
                    :key="transaction.id"
                    class="transaction-item"
                  >
                    <div class="transaction-icon">{{ getTransactionIcon(transaction.type) }}</div>
                    <div class="transaction-details">
                      <div class="transaction-description">{{ transaction.description }}</div>
                      <div class="transaction-meta">
                        <span class="transaction-date">{{
                          formatDate(transaction.created_at)
                        }}</span>
                        <span class="transaction-status" :class="`status-${transaction.status}`">
                          {{ transaction.status }}
                        </span>
                      </div>
                    </div>
                    <div class="transaction-amount" :class="`amount-${transaction.type}`">
                      {{ transaction.type === 'topup' ? '+' : '-'
                      }}{{ formatAmount(transaction.amount) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="activity-card">
              <div class="card-header">
                <h3 class="card-title">Quick Actions</h3>
                <span class="card-icon">⚡</span>
              </div>
              <div class="card-content">
                <div class="quick-actions-grid">
                  <button class="action-btn" @click="() => router.push('/projects')">
                    <span class="action-icon">🌱</span>
                    <span class="action-text">View Projects</span>
                  </button>
                  <button class="action-btn" @click="() => router.push('/wallet')">
                    <span class="action-icon">💰</span>
                    <span class="action-text">Manage Wallet</span>
                  </button>
                  <button class="action-btn" @click="() => router.push('/marketplace')">
                    <span class="action-icon">🏪</span>
                    <span class="action-text">Browse Marketplace</span>
                  </button>
                  <button class="action-btn" @click="showNewProjectForm">
                    <span class="action-icon">➕</span>
                    <span class="action-text">Create Project</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Project Form Modal -->
    <div v-if="showProjectForm" class="modal-overlay" @click="onProjectFormCancel">
      <div class="modal-content" @click.stop>
        <ProjectForm @success="onProjectSubmitted" @cancel="onProjectFormCancel" />
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--ecolink-border);
}

.header-content {
  flex: 1;
}

.dashboard-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--ecolink-text);
}

.dashboard-subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--ecolink-muted);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.activity-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ecolink-text);
}

.activity-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.activity-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--ecolink-primary-50);
  border-bottom: 1px solid var(--ecolink-primary-200);
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ecolink-primary-700);
}

.card-icon {
  font-size: 1.25rem;
}

.card-content {
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: var(--ecolink-muted);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--ecolink-bg);
  border-radius: 8px;
  border: 1px solid var(--ecolink-border);
}

.transaction-icon {
  font-size: 1.25rem;
  width: 2rem;
  text-align: center;
}

.transaction-details {
  flex: 1;
  min-width: 0;
}

.transaction-description {
  font-weight: 500;
  color: var(--ecolink-text);
  margin-bottom: 0.25rem;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--ecolink-muted);
}

.transaction-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-failed {
  background: #fee2e2;
  color: #991b1b;
}

.transaction-amount {
  font-weight: 700;
  font-size: 1rem;
}

.amount-topup {
  color: #059669;
}

.amount-withdrawal {
  color: #dc2626;
}

.amount-payment {
  color: #7c3aed;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--ecolink-bg);
  border: 1px solid var(--ecolink-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: var(--ecolink-text);
}

.action-btn:hover {
  background: var(--ecolink-primary-50);
  border-color: var(--ecolink-primary-300);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.5rem;
}

.action-text {
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
