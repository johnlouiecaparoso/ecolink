<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getUserProjects } from '@/services/projectService'
import { getProfile } from '@/services/profileService'
import ProjectForm from '@/components/ProjectForm.vue'
import { tableService } from '@/services/tableService'
import RecordDetailView from '@/components/tables/RecordDetailView.vue'
import RecordCreateForm from '@/components/tables/RecordCreateForm.vue'
import UserDashboard from '@/components/user/UserDashboard.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'

const router = useRouter()
const store = useUserStore()

const user = ref({ name: 'EcoLink User', email: 'user@ecolink.io' })

// Role-based dashboard selection
const showUserDashboard = computed(() => {
  return store.role === 'user' || store.role === 'verifier'
})

const showAdminDashboard = computed(() => {
  return store.isAdmin || store.isSuperAdmin
})
const showDebug = ref(import.meta.env?.MODE !== 'production')
const storageKeys = ref([])
const windowOrigin = ref('')
const showProjectForm = ref(false)
const userProjects = ref([])
const loadingProjects = ref(false)
const userProfile = ref(null)

// Table management state
const selectedTable = ref(null)
const tableData = ref([])
const filteredData = ref([])
const loadingTables = ref(false)
const searchTerm = ref('')
const statusFilter = ref('')
const sortBy = ref('created_at')
const currentPage = ref(1)
const pageSize = ref(20)

// Modal states
const showRecordModal = ref(false)
const showCreateModal = ref(false)
const selectedRecord = ref(null)
const modalMode = ref('view')

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
  { id: 'projects', title: 'My Projects', value: '0', icon: '🌱' },
  { id: 'wallet', title: 'Wallet Balance', value: '₱0.00', icon: '💰' },
  { id: 'transactions', title: 'Transactions', value: '0', icon: '💳' },
  { id: 'verifications', title: 'Verifications', value: '0', icon: '✅' },
])

// Available tables configuration
const availableTables = ref([
  {
    name: 'wallet_accounts',
    displayName: 'Wallet Accounts',
    icon: '💰',
    count: 0,
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'user_id', label: 'User ID', type: 'text' },
      { key: 'current_balance', label: 'Balance', type: 'currency' },
      { key: 'currency', label: 'Currency', type: 'text' },
    ],
    searchFields: ['user_id'],
    sortFields: ['current_balance', 'currency'],
  },
  {
    name: 'wallet_transactions',
    displayName: 'Transactions',
    icon: '💳',
    count: 0,
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'account_id', label: 'Account ID', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'reference_type', label: 'Reference Type', type: 'text' },
      { key: 'reference_id', label: 'Reference ID', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchFields: ['account_id', 'type', 'reference_type'],
    sortFields: ['amount', 'type', 'status'],
    statusOptions: ['pending', 'captured', 'failed', 'refunded'],
  },
  {
    name: 'verifications',
    displayName: 'Verifications',
    icon: '✅',
    count: 0,
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'project_id', label: 'Project ID', type: 'text' },
      { key: 'verifier_id', label: 'Verifier ID', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchFields: ['project_id', 'verifier_id'],
    sortFields: ['status'],
    statusOptions: ['pending', 'approved', 'rejected', 'needs_revision'],
  },
  {
    name: 'listings',
    displayName: 'Listings',
    icon: '📋',
    count: 0,
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'project_id', label: 'Project ID', type: 'text' },
      { key: 'seller_id', label: 'Seller ID', type: 'text' },
      { key: 'price', label: 'Price', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'available_credits', label: 'Credits', type: 'text' },
    ],
    searchFields: ['project_id', 'seller_id'],
    sortFields: ['price', 'available_credits'],
    statusOptions: ['active', 'sold', 'cancelled', 'expired'],
  },
  {
    name: 'orders',
    displayName: 'Orders',
    icon: '🛒',
    count: 0,
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'listing_id', label: 'Listing ID', type: 'text' },
      { key: 'buyer_id', label: 'Buyer ID', type: 'text' },
      { key: 'seller_id', label: 'Seller ID', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    searchFields: ['listing_id', 'buyer_id', 'seller_id'],
    sortFields: ['amount'],
    statusOptions: ['pending', 'paid', 'completed', 'cancelled', 'refunded'],
  },
  {
    name: 'audit_logs',
    displayName: 'Audit Logs',
    icon: '📊',
    count: 0,
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'user_id', label: 'User ID', type: 'text' },
      { key: 'action', label: 'Action', type: 'text' },
      { key: 'table_name', label: 'Table', type: 'text' },
      { key: 'record_id', label: 'Record ID', type: 'text' },
    ],
    searchFields: ['user_id', 'action', 'table_name'],
    sortFields: ['action', 'table_name'],
  },
])

const navItems = [
  { id: 'overview', label: 'Overview', route: '/dashboard' },
  { id: 'transactions', label: 'Transactions', route: '/marketplace' },
  { id: 'customers', label: 'Customers', route: '/users' },
  { id: 'reports', label: 'Reports', route: '/analytics' },
  { id: 'settings', label: 'Settings', route: '/admin' },
  { id: 'developer', label: 'Developer', route: '/verifier' },
  { id: 'database', label: 'Database', route: '/database' },
  { id: 'tables', label: 'Tables', route: '/tables' },
]

function navigateTo(route) {
  router.push(route)
}

// Computed properties for table management
const visibleColumns = computed(() => {
  return selectedTable.value?.columns || []
})

const statusOptions = computed(() => {
  return selectedTable.value?.statusOptions || []
})

const sortFields = computed(() => {
  return selectedTable.value?.sortFields || []
})

const totalRecords = computed(() => {
  return filteredData.value.length
})

const totalPages = computed(() => {
  return Math.ceil(totalRecords.value / pageSize.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// Table management methods
const selectTable = async (table) => {
  selectedTable.value = table
  currentPage.value = 1
  await loadTableData()
}

const loadTableData = async () => {
  if (!selectedTable.value) return

  loadingTables.value = true
  try {
    const data = await tableService.getTableData(selectedTable.value.name)
    tableData.value = data
    filteredData.value = data
    updateMetrics()
  } catch (error) {
    console.error('Error loading table data:', error)
    tableData.value = []
    filteredData.value = []
  } finally {
    loadingTables.value = false
  }
}

const refreshTableData = () => {
  loadTableData()
}

const updateMetrics = () => {
  const projectsCount = userProjects.value.length

  // Update metrics based on selected table
  if (selectedTable.value?.name === 'wallet_accounts') {
    const walletData = tableData.value.find((item) => item.user_id === store.session?.user?.id)
    metrics.value[1].value = walletData
      ? `₱${parseFloat(walletData.current_balance || 0).toLocaleString()}`
      : '₱0.00'
  } else if (selectedTable.value?.name === 'wallet_transactions') {
    const transactionsCount = tableData.value.length
    metrics.value[2].value = transactionsCount.toString()
  } else if (selectedTable.value?.name === 'verifications') {
    const verificationsCount = tableData.value.length
    metrics.value[3].value = verificationsCount.toString()
  }

  metrics.value[0].value = projectsCount.toString()
}

const handleSearch = () => {
  applyFilters()
}

const applyFilters = () => {
  let filtered = [...tableData.value]

  if (searchTerm.value && selectedTable.value?.searchFields) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter((record) => {
      return selectedTable.value.searchFields.some((field) => {
        const value = record[field]
        return value && value.toString().toLowerCase().includes(term)
      })
    })
  }

  if (statusFilter.value) {
    filtered = filtered.filter((record) => record.status === statusFilter.value)
  }

  filtered.sort((a, b) => {
    const aVal = a[sortBy.value]
    const bVal = b[sortBy.value]

    // Handle cases where sort field doesn't exist
    if (aVal === undefined || bVal === undefined) {
      return 0
    }

    if (sortBy.value === 'created_at' || sortBy.value === 'updated_at') {
      return new Date(bVal) - new Date(aVal)
    }
    return aVal > bVal ? 1 : -1
  })

  filteredData.value = filtered
  currentPage.value = 1
}

const showCreateForm = () => {
  showCreateModal.value = true
}

const viewRecord = (record) => {
  selectedRecord.value = record
  modalMode.value = 'view'
  showRecordModal.value = true
}

const editRecord = (record) => {
  selectedRecord.value = record
  modalMode.value = 'edit'
  showRecordModal.value = true
}

const deleteRecord = async (record) => {
  if (
    !confirm(
      `Are you sure you want to delete this ${selectedTable.value.displayName.slice(0, -1).toLowerCase()}?`,
    )
  ) {
    return
  }

  try {
    await tableService.deleteRecord(selectedTable.value.name, record.id)
    await loadTableData()
  } catch (error) {
    console.error('Error deleting record:', error)
    alert('Failed to delete record: ' + error.message)
  }
}

const handleSave = async (updatedRecord) => {
  try {
    await tableService.updateRecord(selectedTable.value.name, updatedRecord.id, updatedRecord)
    await loadTableData()
    closeRecordModal()
  } catch (error) {
    console.error('Error updating record:', error)
    alert('Failed to update record: ' + error.message)
  }
}

const handleCreate = async (newRecord) => {
  try {
    await tableService.createRecord(selectedTable.value.name, newRecord)
    await loadTableData()
    closeCreateModal()
  } catch (error) {
    console.error('Error creating record:', error)
    alert('Failed to create record: ' + error.message)
  }
}

const closeRecordModal = () => {
  showRecordModal.value = false
  selectedRecord.value = null
  modalMode.value = 'view'
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const formatCurrency = (amount) => {
  if (!amount) return '-'
  return `₱${parseFloat(amount).toLocaleString()}`
}

const getStatusClass = (status) => {
  const statusClasses = {
    pending: 'status-pending',
    completed: 'status-completed',
    failed: 'status-failed',
    cancelled: 'status-cancelled',
    active: 'status-active',
    approved: 'status-approved',
    rejected: 'status-rejected',
    paid: 'status-paid',
  }
  return statusClasses[status] || 'status-default'
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
onMounted(async () => {
  await loadUserProjects()
  await loadUserProfile()

  // Initialize with first table selected
  if (availableTables.value.length > 0) {
    await selectTable(availableTables.value[0])
  }
})
</script>

<template>
  <!-- Role-based dashboard rendering -->
  <div v-if="showUserDashboard">
    <UserDashboard />
  </div>
  <div v-else-if="showAdminDashboard">
    <AdminDashboard />
  </div>
  <div v-else class="layout">
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

        <!-- Data Management Grid -->
        <section class="grid">
          <!-- Table Management Card (Large) -->
          <div class="card large">
            <div class="card-title">Data Management</div>
            <div class="table-management-content">
              <!-- Table Selection -->
              <div class="table-selector">
                <button
                  v-for="table in availableTables"
                  :key="table.name"
                  @click="selectTable(table)"
                  class="table-select-btn"
                  :class="{ active: selectedTable?.name === table.name }"
                >
                  <span class="table-icon">{{ table.icon }}</span>
                  <span class="table-name">{{ table.displayName }}</span>
                  <span class="table-count">{{ table.count }}</span>
                </button>
              </div>

              <!-- Table Data Display -->
              <div v-if="selectedTable" class="table-data-section">
                <!-- Search and Filters -->
                <div class="search-section">
                  <div class="search-box">
                    <input
                      v-model="searchTerm"
                      @input="handleSearch"
                      type="text"
                      placeholder="Search records..."
                      class="search-input"
                    />
                    <span class="search-icon">🔍</span>
                  </div>
                  <div class="filter-controls">
                    <select v-model="statusFilter" @change="applyFilters" class="filter-select">
                      <option value="">All Status</option>
                      <option v-for="status in statusOptions" :key="status" :value="status">
                        {{ status }}
                      </option>
                    </select>
                    <select v-model="sortBy" @change="applyFilters" class="filter-select">
                      <option v-for="field in sortFields" :key="field" :value="field">
                        Sort by {{ field }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Data Table -->
                <div class="data-section">
                  <div v-if="loadingTables" class="loading-state">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">
                      Loading {{ selectedTable.displayName.toLowerCase() }}...
                    </p>
                  </div>

                  <div v-else-if="tableData.length === 0" class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No {{ selectedTable.displayName.toLowerCase() }} found</h3>
                    <p>
                      Create your first
                      {{ selectedTable.displayName.slice(0, -1).toLowerCase() }} to get started.
                    </p>
                  </div>

                  <div v-else class="data-table-container">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th v-for="column in visibleColumns" :key="column.key">
                            {{ column.label }}
                          </th>
                          <th class="actions-column">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="record in paginatedData" :key="record.id">
                          <td v-for="column in visibleColumns" :key="column.key">
                            <span v-if="column.type === 'date'">
                              {{ formatDate(record[column.key]) }}
                            </span>
                            <span v-else-if="column.type === 'currency'">
                              {{ formatCurrency(record[column.key]) }}
                            </span>
                            <span
                              v-else-if="column.type === 'status'"
                              :class="getStatusClass(record[column.key])"
                            >
                              {{ record[column.key] }}
                            </span>
                            <span v-else>
                              {{ record[column.key] }}
                            </span>
                          </td>
                          <td class="actions-cell">
                            <button @click="viewRecord(record)" class="btn btn-sm btn-secondary">
                              View
                            </button>
                            <button @click="editRecord(record)" class="btn btn-sm btn-primary">
                              Edit
                            </button>
                            <button @click="deleteRecord(record)" class="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Pagination -->
                    <div class="pagination">
                      <button
                        @click="previousPage"
                        :disabled="currentPage === 1"
                        class="btn btn-secondary"
                      >
                        Previous
                      </button>
                      <span class="page-info">
                        Page {{ currentPage }} of {{ totalPages }} ({{ totalRecords }} records)
                      </span>
                      <button
                        @click="nextPage"
                        :disabled="currentPage === totalPages"
                        class="btn btn-secondary"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="card">
            <div class="card-title">Quick Actions</div>
            <div class="quick-actions">
              <button @click="refreshTableData" class="btn btn-secondary" :disabled="loadingTables">
                <span v-if="loadingTables" class="loading-spinner"></span>
                Refresh Data
              </button>
              <button v-if="selectedTable" @click="showCreateForm" class="btn btn-primary">
                Add New {{ selectedTable?.displayName?.slice(0, -1) || 'Record' }}
              </button>
            </div>
          </div>

          <!-- Table Stats Card -->
          <div class="card">
            <div class="card-title">Table Statistics</div>
            <div class="table-stats">
              <div v-for="table in availableTables" :key="table.name" class="stat-item">
                <div class="stat-icon">{{ table.icon }}</div>
                <div class="stat-info">
                  <div class="stat-name">{{ table.displayName }}</div>
                  <div class="stat-count">{{ table.count }} records</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Summary Card -->
          <div class="card large">
            <div class="card-title">Data Summary</div>
            <div class="data-summary">
              <div class="summary-item">
                <div class="summary-label">Total Tables</div>
                <div class="summary-value">{{ availableTables.length }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Records</div>
                <div class="summary-value">
                  {{ availableTables.reduce((sum, table) => sum + table.count, 0) }}
                </div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Active Table</div>
                <div class="summary-value">{{ selectedTable?.displayName || 'None' }}</div>
              </div>
            </div>
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

    <!-- Record Detail Modal -->
    <div v-if="showRecordModal" class="modal-overlay" @click="closeRecordModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>
            {{ modalMode === 'view' ? 'View' : 'Edit' }}
            {{ selectedTable?.displayName?.slice(0, -1) }}
          </h3>
          <button @click="closeRecordModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <RecordDetailView
            :record="selectedRecord"
            :table="selectedTable"
            :mode="modalMode"
            @save="handleSave"
            @cancel="closeRecordModal"
          />
        </div>
      </div>
    </div>

    <!-- Create Form Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Create New {{ selectedTable?.displayName?.slice(0, -1) }}</h3>
          <button @click="closeCreateModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <RecordCreateForm
            :table="selectedTable"
            @save="handleCreate"
            @cancel="closeCreateModal"
          />
        </div>
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

/* Table Management Styles */
.table-management-content {
  padding: 0;
}

.table-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.table-select-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--ecolink-border);
  border-radius: 8px;
  background: var(--ecolink-surface);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.table-select-btn:hover {
  border-color: var(--ecolink-primary);
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.15);
}

.table-select-btn.active {
  border-color: var(--ecolink-primary);
  background: #ebf8ff;
}

.table-icon {
  font-size: 1.5rem;
}

.table-name {
  flex: 1;
  font-weight: 600;
  color: var(--ecolink-text);
}

.table-count {
  background: var(--ecolink-muted);
  color: var(--ecolink-text);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--ecolink-border);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--ecolink-surface);
}

.search-input:focus {
  outline: none;
  border-color: var(--ecolink-primary);
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ecolink-muted);
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid var(--ecolink-border);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--ecolink-surface);
}

.data-table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  background: var(--ecolink-surface);
  border-radius: 8px;
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--ecolink-border);
}

.data-table th {
  background: var(--ecolink-muted);
  font-weight: 600;
  color: var(--ecolink-text);
}

.actions-column {
  width: 200px;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0 0 0;
  margin-top: 1rem;
  border-top: 1px solid var(--ecolink-border);
}

.page-info {
  color: var(--ecolink-muted);
  font-size: 0.875rem;
}

.status-pending {
  color: #d69e2e;
  font-weight: 600;
}
.status-completed {
  color: #38a169;
  font-weight: 600;
}
.status-failed {
  color: #e53e3e;
  font-weight: 600;
}
.status-cancelled {
  color: #718096;
  font-weight: 600;
}
.status-active {
  color: #3182ce;
  font-weight: 600;
}
.status-approved {
  color: #38a169;
  font-weight: 600;
}
.status-rejected {
  color: #e53e3e;
  font-weight: 600;
}
.status-paid {
  color: #38a169;
  font-weight: 600;
}
.status-default {
  color: #4a5568;
  font-weight: 600;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--ecolink-border);
  border-top: 2px solid var(--ecolink-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .table-selector {
    grid-template-columns: 1fr;
  }

  .search-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    justify-content: space-between;
  }

  .actions-cell {
    flex-direction: column;
  }
}

/* New Grid Layout Styles */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.stat-info {
  flex: 1;
}

.stat-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.stat-count {
  font-size: 12px;
  color: #64748b;
}

.data-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.summary-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}
</style>
