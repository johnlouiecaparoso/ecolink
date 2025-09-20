<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getUserProjects } from '@/services/projectService'
import { getProfile } from '@/services/profileService'
import ProjectForm from '@/components/ProjectForm.vue'

const router = useRouter()
const store = useUserStore()

const user = ref({ name: 'EcoLink User', email: 'user@ecolink.io' })
const showDebug = ref(import.meta.env?.MODE !== 'production')
const storageKeys = ref([])
const windowOrigin = ref('')
const showProjectForm = ref(false)
const userProjects = ref([])
const loadingProjects = ref(false)
const userProfile = ref(null)

function refreshStorageKeys() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      storageKeys.value = Object.keys(window.localStorage).filter((k) => k.startsWith('sb-'))
    } else {
      storageKeys.value = []
    }
  } catch (e) {
    storageKeys.value = []
  }
}
refreshStorageKeys()

// Set window origin safely
if (typeof window !== 'undefined') {
  windowOrigin.value = window.location.origin
}

const metrics = ref([
  { id: 'mrr', title: 'Current MRR', value: '$12.4k' },
  { id: 'customers', title: 'Current Customers', value: '16,601' },
  { id: 'active', title: 'Active Customers', value: '33%' },
  { id: 'churn', title: 'Churn Rate', value: '2%' },
])

const navItems = [
  { id: 'overview', label: 'Overview', route: '/dashboard' },
  { id: 'transactions', label: 'Transactions', route: '/marketplace' },
  { id: 'customers', label: 'Customers', route: '/users' },
  { id: 'reports', label: 'Reports', route: '/analytics' },
  { id: 'settings', label: 'Settings', route: '/admin' },
  { id: 'developer', label: 'Developer', route: '/verifier' },
  { id: 'database', label: 'Database', route: '/database' },
]

function navigateTo(route) {
  router.push(route)
}

async function onSignOut() {
  await store.logout().catch(() => {})
  // Ensure local state is cleared and navigate regardless of remote result
  store.session = null
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('sb-')) window.localStorage.removeItem(key)
      })
    }
  } catch {}
  router.replace({ name: 'login' })
}

async function loadUserProjects() {
  if (!store.session?.user?.id) return

  loadingProjects.value = true
  try {
    userProjects.value = await getUserProjects(store.session.user.id)
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
  loadUserProjects() // Reload projects after submission
}

function onProjectFormCancel() {
  showProjectForm.value = false
}

async function loadUserProfile() {
  if (!store.session?.user?.id) return

  try {
    userProfile.value = await getProfile(store.session.user.id)
    // Update user display with profile data
    if (userProfile.value) {
      user.value.name = userProfile.value.full_name || 'EcoLink User'
      user.value.email = store.session.user.email || 'user@ecolink.io'
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

// Load projects and profile when component mounts
onMounted(() => {
  loadUserProjects()
  loadUserProfile()
})
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-badge"><span class="brand-initials">EC</span></div>
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
          {{ item.label }}
        </button>
      </nav>
      <div class="sidebar-spacer"></div>
      <button class="nav-item logout" type="button" @click="onSignOut">Log out</button>
    </aside>

    <div class="content">
      <header class="topbar">
        <h1 class="page-title">Dashboard</h1>
        <div class="topbar-actions">
          <button class="btn btn-primary" @click="showNewProjectForm">+ New Project</button>
          <div class="user-inline">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>
        </div>
      </header>

      <main class="main">
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

        <section class="grid">
          <div class="card large">
            <div class="card-title">Trend</div>
            <div class="placeholder">Chart placeholder</div>
          </div>
          <div class="card">
            <div class="card-title">Sales</div>
            <div class="placeholder">Donut placeholder</div>
          </div>
          <div class="card">
            <div class="card-title">Transactions</div>
            <div class="placeholder">List placeholder</div>
          </div>
          <div class="card large">
            <div class="card-title">Support Tickets</div>
            <div class="placeholder">Table placeholder</div>
          </div>
          <div class="card large">
            <div class="card-title">Customer Demographic</div>
            <div class="placeholder">Map placeholder</div>
          </div>
        </section>
      </main>
    </div>

    <!-- Project Form Modal -->
    <div v-if="showProjectForm" class="modal-overlay" @click="onProjectFormCancel">
      <div class="modal-content" @click.stop>
        <ProjectForm @success="onProjectSubmitted" @cancel="onProjectFormCancel" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: var(--ecolink-bg);
}

.sidebar {
  background: var(--ecolink-primary-700);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 18px 8px;
}
.brand-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--ecolink-primary-500), var(--ecolink-primary-700));
  display: grid;
  place-items: center;
}
.brand-initials {
  color: #fff;
  font-weight: 800;
}
.brand-text {
  font-weight: 800;
  font-size: 18px;
}

.sidebar-nav {
  display: grid;
  gap: 8px;
}
.nav-item {
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
}
.logout {
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 14px;
}
.sidebar-spacer {
  flex: 1;
}

.content {
  display: grid;
  grid-template-rows: auto 1fr;
}
.topbar {
  background: var(--ecolink-surface);
  border-bottom: 1px solid var(--ecolink-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--ecolink-primary-700);
}
.user-inline {
  text-align: right;
}
.user-name {
  font-weight: 600;
}
.user-email {
  font-size: 12px;
  color: var(--ecolink-muted);
}

.main {
  padding: 20px;
}
.debug {
  margin-bottom: 14px;
  padding: 10px;
  background: #fff8e1;
  border: 1px solid #f0d48a;
  color: #7a5b00;
  border-radius: 10px;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.metric-card {
  background: var(--ecolink-primary-700);
  color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-md);
}
.metric-title {
  opacity: 0.9;
  font-size: 13px;
}
.metric-value {
  font-size: 28px;
  font-weight: 800;
  margin-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}
.card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 16px;
}
.card.large {
  grid-column: span 2;
}
.card-title {
  font-weight: 700;
  margin-bottom: 10px;
}
.placeholder {
  height: 220px;
  border: 1px dashed var(--ecolink-border);
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--ecolink-muted);
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .card.large {
    grid-column: auto;
  }
}

/* Projects Section Styles */
.projects-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ecolink-text);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: var(--ecolink-text);
}

.empty-state p {
  margin: 0 0 20px 0;
  color: var(--ecolink-muted);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.project-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-md);
  transition:
    transform 120ms ease,
    box-shadow 160ms ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ecolink-text);
  flex: 1;
  margin-right: 12px;
}

.project-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  text-transform: capitalize;
}

.status-draft {
  background: #6b7280;
  color: white;
}

.status-submitted {
  background: #f59e0b;
  color: white;
}

.status-in_review {
  background: #3b82f6;
  color: white;
}

.status-approved {
  background: #10b981;
  color: white;
}

.status-rejected {
  background: #ef4444;
  color: white;
}

.project-methodology {
  margin: 0 0 12px 0;
  color: var(--ecolink-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-location {
  font-size: 14px;
  color: var(--ecolink-muted);
}

.project-docs {
  font-size: 14px;
}

.project-docs a {
  color: var(--ecolink-primary-600);
  text-decoration: none;
}

.project-docs a:hover {
  text-decoration: underline;
}

.project-footer {
  border-top: 1px solid var(--ecolink-border);
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-date {
  font-size: 12px;
  color: var(--ecolink-muted);
}

.project-approved {
  font-size: 12px;
  color: var(--ecolink-primary-600);
  font-weight: 600;
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

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .topbar-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
