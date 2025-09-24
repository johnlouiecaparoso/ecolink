<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="table-management-page">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">Table Management</h1>
            <p class="page-subtitle">Manage all your database tables and data</p>
          </div>
        </div>

        <!-- Content -->
        <div class="page-content">
          <!-- Table Selection -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Select Table</h2>
            </div>
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
          </div>

          <!-- Table Actions -->
          <div v-if="selectedTable" class="section">
            <div class="section-header">
              <h2 class="section-title">{{ selectedTable.displayName }} Management</h2>
              <div class="section-actions">
                <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
                  <span v-if="loading" class="loading-spinner"></span>
                  Refresh
                </button>
                <button @click="showCreateForm" class="btn btn-primary">
                  Add New {{ selectedTable.displayName.slice(0, -1) }}
                </button>
              </div>
            </div>

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
                  <option value="created_at">Sort by Date</option>
                  <option value="updated_at">Sort by Updated</option>
                  <option v-for="field in sortFields" :key="field" :value="field">
                    Sort by {{ field }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Data Table -->
            <div class="data-section">
              <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading {{ selectedTable.displayName.toLowerCase() }}...</p>
              </div>

              <div v-else-if="tableData.length === 0" class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No {{ selectedTable.displayName.toLowerCase() }} found</h3>
                <p>
                  Create your first {{ selectedTable.displayName.slice(0, -1).toLowerCase() }} to
                  get started.
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
                        <span v-else-if="column.type === 'boolean'">
                          {{ record[column.key] ? 'Yes' : 'No' }}
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

          <!-- Record Detail Modal -->
          <div v-if="showRecordModal" class="modal-overlay" @click="closeRecordModal">
            <div class="modal-content large" @click.stop>
              <div class="modal-header">
                <h3>
                  {{ modalMode === 'view' ? 'View' : 'Edit' }}
                  {{ selectedTable?.displayName.slice(0, -1) }}
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
                <h3>Create New {{ selectedTable?.displayName.slice(0, -1) }}</h3>
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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import RecordDetailView from '@/components/tables/RecordDetailView.vue'
import RecordCreateForm from '@/components/tables/RecordCreateForm.vue'
import { tableService } from '@/services/tableService'

export default {
  name: 'TableManagementView',
  components: {
    AppSidebar,
    RecordDetailView,
    RecordCreateForm,
  },
  setup() {
    const selectedTable = ref(null)
    const tableData = ref([])
    const filteredData = ref([])
    const loading = ref(false)
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
          { key: 'created_at', label: 'Created', type: 'date' },
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
          { key: 'user_id', label: 'User ID', type: 'text' },
          { key: 'type', label: 'Type', type: 'text' },
          { key: 'amount', label: 'Amount', type: 'currency' },
          { key: 'status', label: 'Status', type: 'status' },
          { key: 'payment_method', label: 'Method', type: 'text' },
          { key: 'created_at', label: 'Date', type: 'date' },
        ],
        searchFields: ['user_id', 'type', 'payment_method'],
        sortFields: ['amount', 'type', 'status'],
        statusOptions: ['pending', 'completed', 'failed', 'cancelled'],
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
          { key: 'created_at', label: 'Created', type: 'date' },
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
          { key: 'created_at', label: 'Created', type: 'date' },
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
          { key: 'created_at', label: 'Created', type: 'date' },
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
          { key: 'created_at', label: 'Date', type: 'date' },
        ],
        searchFields: ['user_id', 'action', 'table_name'],
        sortFields: ['action', 'table_name'],
      },
    ])

    // Computed properties
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

    // Methods
    const selectTable = async (table) => {
      selectedTable.value = table
      currentPage.value = 1
      await loadTableData()
    }

    const loadTableData = async () => {
      if (!selectedTable.value) return

      loading.value = true
      try {
        const data = await tableService.getTableData(selectedTable.value.name)
        tableData.value = data
        filteredData.value = data
      } catch (error) {
        console.error('Error loading table data:', error)
        // If table doesn't exist, show empty state
        tableData.value = []
        filteredData.value = []
      } finally {
        loading.value = false
      }
    }

    const refreshData = () => {
      loadTableData()
    }

    const handleSearch = () => {
      applyFilters()
    }

    const applyFilters = () => {
      let filtered = [...tableData.value]

      // Apply search filter
      if (searchTerm.value && selectedTable.value?.searchFields) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter((record) => {
          return selectedTable.value.searchFields.some((field) => {
            const value = record[field]
            return value && value.toString().toLowerCase().includes(term)
          })
        })
      }

      // Apply status filter
      if (statusFilter.value) {
        filtered = filtered.filter((record) => record.status === statusFilter.value)
      }

      // Apply sorting
      filtered.sort((a, b) => {
        const aVal = a[sortBy.value]
        const bVal = b[sortBy.value]
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

    // Watch for table changes
    watch(selectedTable, () => {
      searchTerm.value = ''
      statusFilter.value = ''
      sortBy.value = 'created_at'
    })

    onMounted(() => {
      // Load initial data if a table is selected
      if (availableTables.value.length > 0) {
        selectTable(availableTables.value[0])
      }
    })

    return {
      selectedTable,
      tableData,
      filteredData,
      loading,
      searchTerm,
      statusFilter,
      sortBy,
      currentPage,
      totalRecords,
      totalPages,
      paginatedData,
      availableTables,
      visibleColumns,
      statusOptions,
      sortFields,
      showRecordModal,
      showCreateModal,
      selectedRecord,
      modalMode,
      selectTable,
      loadTableData,
      refreshData,
      handleSearch,
      applyFilters,
      showCreateForm,
      viewRecord,
      editRecord,
      deleteRecord,
      handleSave,
      handleCreate,
      closeRecordModal,
      closeCreateModal,
      previousPage,
      nextPage,
      formatDate,
      formatCurrency,
      getStatusClass,
    }
  },
}
</script>

<style scoped>
.table-management-page {
  min-height: 100vh;
  background: #f8fafc;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #718096;
  margin: 0;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 0.75rem;
}

.table-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 2rem;
}

.table-select-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.table-select-btn:hover {
  border-color: #3182ce;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.15);
}

.table-select-btn.active {
  border-color: #3182ce;
  background: #ebf8ff;
}

.table-icon {
  font-size: 1.5rem;
}

.table-name {
  flex: 1;
  font-weight: 600;
  color: #1a202c;
}

.table-count {
  background: #f7fafc;
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.data-section {
  padding: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #718096;
  margin: 1rem 0 0 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #1a202c;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #718096;
  margin: 0;
}

.data-table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #1a202c;
  position: sticky;
  top: 0;
}

.actions-column {
  width: 200px;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
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

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0 0 0;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.page-info {
  color: #718096;
  font-size: 0.875rem;
}

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
  width: 600px;
  display: flex;
  flex-direction: column;
}

.modal-content.large {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2c5aa0;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c53030;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .page-content {
    padding: 1rem;
  }

  .table-selector {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .search-section {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }

  .filter-controls {
    justify-content: space-between;
  }

  .data-section {
    padding: 1rem;
  }

  .modal-content {
    width: 95vw;
    margin: 1rem;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }

  .actions-cell {
    flex-direction: column;
  }
}
</style>
