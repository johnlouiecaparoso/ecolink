<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  getRecentAuditLogs,
  searchAuditLogs,
  getUserActivitySummary,
} from '@/services/auditService'

const router = useRouter()

// State
const auditLogs = ref([])
const loading = ref(false)
const searchFilters = ref({
  action: '',
  resourceType: '',
  userId: '',
  startDate: '',
  endDate: '',
})
const currentPage = ref(1)
const itemsPerPage = 50
const totalItems = ref(0)
const userActivitySummary = ref(null)

// Computed
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return auditLogs.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage)
})

// Methods
async function loadAuditLogs() {
  loading.value = true
  try {
    const filters = {}

    if (searchFilters.value.action) filters.action = searchFilters.value.action
    if (searchFilters.value.resourceType) filters.resourceType = searchFilters.value.resourceType
    if (searchFilters.value.userId) filters.userId = searchFilters.value.userId
    if (searchFilters.value.startDate) filters.startDate = new Date(searchFilters.value.startDate)
    if (searchFilters.value.endDate) filters.endDate = new Date(searchFilters.value.endDate)

    const logs = await searchAuditLogs(filters, 1000) // Get more for pagination
    auditLogs.value = logs
    totalItems.value = logs.length
  } catch (error) {
    console.error('Error loading audit logs:', error)
  } finally {
    loading.value = false
  }
}

async function loadUserActivitySummary() {
  try {
    userActivitySummary.value = await getUserActivitySummary()
  } catch (error) {
    console.error('Error loading user activity summary:', error)
  }
}

function search() {
  currentPage.value = 1
  loadAuditLogs()
}

function clearFilters() {
  searchFilters.value = {
    action: '',
    resourceType: '',
    userId: '',
    startDate: '',
    endDate: '',
  }
  currentPage.value = 1
  loadAuditLogs()
}

function goToPage(page) {
  currentPage.value = page
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}

function getActionColor(action) {
  const colors = {
    LOGIN_SUCCESS: 'text-green-600',
    LOGIN_FAILED: 'text-red-600',
    LOGOUT_SUCCESS: 'text-blue-600',
    REGISTRATION_SUCCESS: 'text-green-600',
    REGISTRATION_FAILED: 'text-red-600',
    CREATE: 'text-green-600',
    UPDATE: 'text-yellow-600',
    DELETE: 'text-red-600',
    PROFILE_CREATED: 'text-green-600',
    PROFILE_CREATION_FAILED: 'text-red-600',
  }
  return colors[action] || 'text-gray-600'
}

function getResourceTypeIcon(resourceType) {
  const icons = {
    user: '👤',
    profile: '👤',
    project: '🌱',
    wallet: '💰',
    transaction: '💳',
    application: '⚙️',
  }
  return icons[resourceType] || '📄'
}

// Lifecycle
onMounted(() => {
  loadAuditLogs()
  loadUserActivitySummary()
})
</script>

<template>
  <div class="audit-logs-page">
    <div class="content-header">
      <div class="header-info">
        <button class="btn btn-ghost back-btn" @click="router.push('/dashboard')">
          <span class="back-icon">←</span>
          Back to Dashboard
        </button>
        <h1 class="page-title">Audit Logs</h1>
        <p class="page-subtitle">Monitor user activities and system events</p>
      </div>
    </div>

    <!-- User Activity Summary -->
    <div v-if="userActivitySummary" class="summary-cards">
      <div class="summary-card">
        <div class="summary-icon">📊</div>
        <div class="summary-content">
          <h3>Total Actions</h3>
          <p class="summary-number">{{ userActivitySummary.total_actions || 0 }}</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">⏰</div>
        <div class="summary-content">
          <h3>Last 24h</h3>
          <p class="summary-number">{{ userActivitySummary.actions_24h || 0 }}</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">📅</div>
        <div class="summary-content">
          <h3>Last 7 days</h3>
          <p class="summary-number">{{ userActivitySummary.actions_7d || 0 }}</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">🕐</div>
        <div class="summary-content">
          <h3>Last Activity</h3>
          <p class="summary-text">
            {{
              userActivitySummary.last_activity
                ? formatDate(userActivitySummary.last_activity)
                : 'Never'
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Search Filters -->
    <div class="search-filters">
      <div class="filters-grid">
        <div class="filter-group">
          <label for="action">Action</label>
          <select id="action" v-model="searchFilters.action" class="filter-input">
            <option value="">All Actions</option>
            <option value="LOGIN_SUCCESS">Login Success</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="LOGOUT_SUCCESS">Logout Success</option>
            <option value="REGISTRATION_SUCCESS">Registration Success</option>
            <option value="REGISTRATION_FAILED">Registration Failed</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="PROFILE_CREATED">Profile Created</option>
            <option value="PROFILE_CREATION_FAILED">Profile Creation Failed</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="resourceType">Resource Type</label>
          <select id="resourceType" v-model="searchFilters.resourceType" class="filter-input">
            <option value="">All Types</option>
            <option value="user">User</option>
            <option value="profile">Profile</option>
            <option value="project">Project</option>
            <option value="wallet">Wallet</option>
            <option value="transaction">Transaction</option>
            <option value="application">Application</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="userId">User ID</label>
          <input
            id="userId"
            v-model="searchFilters.userId"
            type="text"
            placeholder="Enter User ID"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label for="startDate">Start Date</label>
          <input
            id="startDate"
            v-model="searchFilters.startDate"
            type="datetime-local"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label for="endDate">End Date</label>
          <input
            id="endDate"
            v-model="searchFilters.endDate"
            type="datetime-local"
            class="filter-input"
          />
        </div>
      </div>

      <div class="filter-actions">
        <button class="btn btn-primary" @click="search" :disabled="loading">
          {{ loading ? 'Searching...' : 'Search' }}
        </button>
        <button class="btn btn-ghost" @click="clearFilters">Clear Filters</button>
      </div>
    </div>

    <!-- Audit Logs Table -->
    <div class="audit-logs-table">
      <div class="table-header">
        <h3>Audit Logs ({{ totalItems }} total)</h3>
        <div class="table-actions">
          <button class="btn btn-ghost" @click="loadAuditLogs" :disabled="loading">
            {{ loading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading audit logs...</p>
      </div>

      <div v-else-if="paginatedLogs.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No audit logs found</h3>
        <p>Try adjusting your search filters</p>
      </div>

      <div v-else class="table-content">
        <div class="logs-list">
          <div v-for="log in paginatedLogs" :key="log.id" class="log-item">
            <div class="log-header">
              <div class="log-action">
                <span class="resource-icon">{{ getResourceTypeIcon(log.resource_type) }}</span>
                <span class="action-text" :class="getActionColor(log.action)">{{
                  log.action
                }}</span>
                <span class="resource-type">{{ log.resource_type }}</span>
                <span v-if="log.resource_id" class="resource-id">#{{ log.resource_id }}</span>
              </div>
              <div class="log-timestamp">{{ formatDate(log.created_at) }}</div>
            </div>

            <div class="log-details">
              <div v-if="log.user_name" class="log-user">
                <span class="user-label">User:</span>
                <span class="user-name">{{ log.user_name }}</span>
                <span class="user-role">({{ log.user_role }})</span>
              </div>

              <div v-if="log.ip_address" class="log-meta">
                <span class="meta-label">IP:</span>
                <span class="meta-value">{{ log.ip_address }}</span>
              </div>

              <div v-if="log.metadata" class="log-metadata">
                <details>
                  <summary>Metadata</summary>
                  <pre class="metadata-content">{{ JSON.stringify(log.metadata, null, 2) }}</pre>
                </details>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="btn btn-ghost"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            Previous
          </button>

          <span class="pagination-info"> Page {{ currentPage }} of {{ totalPages }} </span>

          <button
            class="btn btn-ghost"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audit-logs-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.content-header {
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.back-btn:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #10b981;
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.summary-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.summary-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.summary-text {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Search Filters */
.search-filters {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.filter-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Audit Logs Table */
.audit-logs-table {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.table-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.table-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.loading-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

.table-content {
  padding: 1.5rem;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  background: #f8fafc;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.log-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resource-icon {
  font-size: 1rem;
}

.action-text {
  font-weight: 600;
  font-size: 0.875rem;
}

.resource-type {
  background: #e2e8f0;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.resource-id {
  color: #64748b;
  font-size: 0.75rem;
  font-family: monospace;
}

.log-timestamp {
  color: #64748b;
  font-size: 0.75rem;
}

.log-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.user-label {
  color: #64748b;
  font-weight: 500;
}

.user-name {
  color: #1e293b;
  font-weight: 600;
}

.user-role {
  color: #64748b;
  font-size: 0.75rem;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.meta-label {
  color: #64748b;
  font-weight: 500;
}

.meta-value {
  color: #1e293b;
  font-family: monospace;
}

.log-metadata {
  margin-top: 0.5rem;
}

.log-metadata details {
  font-size: 0.75rem;
}

.log-metadata summary {
  cursor: pointer;
  color: #64748b;
  font-weight: 500;
}

.metadata-content {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  overflow-x: auto;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  color: #64748b;
  font-size: 0.875rem;
}

/* Button Styles */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-ghost:hover:not(:disabled) {
  background: #f8fafc;
  color: #1e293b;
}

.btn-ghost:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .audit-logs-page {
    padding: 1rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .log-action {
    flex-wrap: wrap;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
