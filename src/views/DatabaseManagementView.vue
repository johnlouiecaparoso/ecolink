<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="database-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Database Management</h1>
        <p class="page-subtitle">Manage your Supabase database tables and schemas</p>
      </div>
    </div>

    <!-- Content -->
    <div class="page-content">
      <!-- Tables Overview -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Database Tables</h2>
          <div class="section-actions">
            <button @click="refreshTables" class="btn btn-secondary" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              Refresh Tables
            </button>
          </div>
        </div>

        <!-- Tables Grid -->
        <div class="tables-grid" v-if="!loading && tables.length > 0">
          <div
            v-for="table in tables"
            :key="table.table_name"
            class="table-card"
            @click="selectTable(table.table_name)"
            :class="{ active: selectedTable === table.table_name }"
          >
            <div class="table-header">
              <h3 class="table-name">{{ table.table_name }}</h3>
              <span class="table-type">{{ table.table_type }}</span>
            </div>
            <div class="table-actions">
              <button @click.stop="viewTableData(table.table_name)" class="btn btn-sm btn-primary">
                View Data
              </button>
              <button @click.stop="viewTableSchema(table.table_name)" class="btn btn-sm btn-secondary">
                Schema
              </button>
              <button @click.stop="dropTable(table.table_name)" class="btn btn-sm btn-danger">
                Drop
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading tables...</p>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && tables.length === 0" class="empty-state">
          <div class="empty-icon">🗄️</div>
          <h3>No Tables Found</h3>
          <p>No database tables were found. Create some tables to get started.</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Quick Actions</h2>
        </div>

        <div class="quick-actions">
          <div class="action-group">
            <h3>Create Tables</h3>
            <div class="action-buttons">
              <button
                v-for="(schema, tableName) in tableSchemas"
                :key="tableName"
                @click="createTable(tableName, schema)"
                class="btn btn-primary"
                :disabled="creatingTable"
              >
                Create {{ tableName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
              </button>
            </div>
          </div>

          <div class="action-group">
            <h3>Database Setup</h3>
            <div class="action-buttons">
              <button @click="runFullSetup" class="btn btn-success" :disabled="runningSetup">
                Run Complete Setup
              </button>
              <button @click="enableRLS" class="btn btn-warning" :disabled="runningSetup">
                Enable RLS
              </button>
              <button @click="createIndexes" class="btn btn-info" :disabled="runningSetup">
                Create Indexes
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SQL Query Interface -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">SQL Query Interface</h2>
        </div>

        <div class="sql-interface">
          <div class="sql-input">
            <textarea
              v-model="sqlQuery"
              placeholder="Enter your SQL query here..."
              class="sql-textarea"
              rows="6"
            ></textarea>
          </div>
          <div class="sql-actions">
            <button @click="executeQuery" class="btn btn-primary" :disabled="executingQuery">
              <span v-if="executingQuery" class="loading-spinner"></span>
              Execute Query
            </button>
            <button @click="clearQuery" class="btn btn-secondary">
              Clear
            </button>
          </div>
        </div>

        <!-- Query Results -->
        <div v-if="queryResult" class="query-results">
          <div class="results-header">
            <h3>Query Results</h3>
            <span class="result-status" :class="queryResult.success ? 'success' : 'error'">
              {{ queryResult.success ? 'Success' : 'Error' }}
            </span>
          </div>
          <div class="results-content">
            <pre v-if="queryResult.success">{{ JSON.stringify(queryResult.data, null, 2) }}</pre>
            <pre v-else class="error-message">{{ queryResult.error }}</pre>
          </div>
        </div>
      </div>

      <!-- Table Details Modal -->
      <div v-if="showTableModal" class="modal-overlay" @click="closeTableModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ modalTitle }}</h3>
            <button @click="closeTableModal" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div v-if="modalType === 'data'" class="table-data">
              <div v-if="tableData.length === 0" class="empty-data">
                <p>No data found in this table.</p>
              </div>
              <div v-else class="data-table">
                <table>
                  <thead>
                    <tr>
                      <th v-for="column in Object.keys(tableData[0])" :key="column">
                        {{ column }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in tableData.slice(0, 50)" :key="index">
                      <td v-for="(value, column) in row" :key="column">
                        {{ value }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-if="tableData.length > 50" class="data-note">
                  Showing first 50 rows of {{ tableData.length }} total rows.
                </p>
              </div>
            </div>

            <div v-if="modalType === 'schema'" class="table-schema">
              <div v-if="tableSchema.length === 0" class="empty-schema">
                <p>No schema information found.</p>
              </div>
              <div v-else class="schema-table">
                <table>
                  <thead>
                    <tr>
                      <th>Column Name</th>
                      <th>Data Type</th>
                      <th>Nullable</th>
                      <th>Default Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="column in tableSchema" :key="column.column_name">
                      <td>{{ column.column_name }}</td>
                      <td>{{ column.data_type }}</td>
                      <td>{{ column.is_nullable }}</td>
                      <td>{{ column.column_default }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { databaseService, tableSchemas } from '@/services/databaseService'
import AppSidebar from '@/components/layout/AppSidebar.vue'

export default {
  name: 'DatabaseManagementView',
  components: {
    AppSidebar
  },
  setup() {
    const tables = ref([])
    const selectedTable = ref(null)
    const loading = ref(false)
    const creatingTable = ref(false)
    const runningSetup = ref(false)
    const executingQuery = ref(false)

    // SQL Query Interface
    const sqlQuery = ref('')
    const queryResult = ref(null)

    // Modal states
    const showTableModal = ref(false)
    const modalType = ref('')
    const modalTitle = ref('')
    const tableData = ref([])
    const tableSchema = ref([])

    // Load tables on mount
    onMounted(() => {
      loadTables()
    })

    const loadTables = async () => {
      loading.value = true
      try {
        const result = await databaseService.getTableInfo()
        if (result.success) {
          tables.value = result.data || []
        } else {
          console.error('Failed to load tables:', result.error)
        }
      } catch (error) {
        console.error('Error loading tables:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshTables = () => {
      loadTables()
    }

    const selectTable = (tableName) => {
      selectedTable.value = tableName
    }

    const viewTableData = async (tableName) => {
      loading.value = true
      try {
        const result = await databaseService.getTableData(tableName)
        if (result.success) {
          tableData.value = result.data || []
          modalType.value = 'data'
          modalTitle.value = `${tableName} - Data`
          showTableModal.value = true
        } else {
          console.error('Failed to load table data:', result.error)
        }
      } catch (error) {
        console.error('Error loading table data:', error)
      } finally {
        loading.value = false
      }
    }

    const viewTableSchema = async (tableName) => {
      loading.value = true
      try {
        const result = await databaseService.getTableSchema(tableName)
        if (result.success) {
          tableSchema.value = result.data || []
          modalType.value = 'schema'
          modalTitle.value = `${tableName} - Schema`
          showTableModal.value = true
        } else {
          console.error('Failed to load table schema:', result.error)
        }
      } catch (error) {
        console.error('Error loading table schema:', error)
      } finally {
        loading.value = false
      }
    }

    const dropTable = async (tableName) => {
      if (!confirm(`Drop table "${tableName}"? This will show you the SQL to run in Supabase. This action cannot be undone.`)) {
        return
      }

      loading.value = true
      try {
        const result = await databaseService.dropTable(tableName)
        if (result.success) {
          await loadTables()
          alert(`Table "${tableName}" has been dropped successfully.`)
        } else {
          const sqlToRun = `DROP TABLE IF EXISTS public.${tableName} CASCADE;`
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(sqlToRun)
            alert(`SQL copied to clipboard! Please run it in Supabase SQL Editor.\n\nTable: ${tableName}`)
          } else {
            alert(`Please copy and run this SQL in Supabase SQL Editor:\n\n${sqlToRun}`)
          }
        }
      } catch (error) {
        console.error('Error dropping table:', error)
        alert(`Error dropping table: ${error.message}`)
      } finally {
        loading.value = false
      }
    }

    const createTable = async (tableName, schema) => {
      if (!confirm(`Create table "${tableName}"? This will show you the SQL to run in Supabase.`)) {
        return
      }

      creatingTable.value = true
      try {
        const result = await databaseService.createTable(tableName, schema)
        if (result.success) {
          await loadTables()
          alert(`Table "${tableName}" has been created successfully.`)
        } else {
          // Show the SQL in a modal or copy to clipboard
          const sqlToRun = tableSchemas[tableName]
          if (sqlToRun) {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(sqlToRun)
              alert(`SQL copied to clipboard! Please run it in Supabase SQL Editor.\n\nTable: ${tableName}`)
            } else {
              alert(`Please copy and run this SQL in Supabase SQL Editor:\n\n${sqlToRun}`)
            }
          }
        }
      } catch (error) {
        console.error('Error creating table:', error)
        alert(`Error creating table: ${error.message}`)
      } finally {
        creatingTable.value = false
      }
    }

    const executeQuery = async () => {
      if (!sqlQuery.value.trim()) {
        alert('Please enter a SQL query.')
        return
      }

      executingQuery.value = true
      try {
        const result = await databaseService.executeQuery(sqlQuery.value)
        queryResult.value = result
      } catch (error) {
        console.error('Error executing query:', error)
        queryResult.value = { success: false, error: error.message }
      } finally {
        executingQuery.value = false
      }
    }

    const clearQuery = () => {
      sqlQuery.value = ''
      queryResult.value = null
    }

    const closeTableModal = () => {
      showTableModal.value = false
      modalType.value = ''
      modalTitle.value = ''
      tableData.value = []
      tableSchema.value = []
    }

    const runFullSetup = async () => {
      if (!confirm('This will show you all SQL commands to run in Supabase SQL Editor for complete setup. Continue?')) {
        return
      }

      runningSetup.value = true
      try {
        // Collect all SQL commands
        let allSqlCommands = []

        // Add table creation commands
        for (const [tableName, schema] of Object.entries(tableSchemas)) {
          allSqlCommands.push(`-- Create ${tableName} table`)
          allSqlCommands.push(schema.trim())
          allSqlCommands.push('')
        }

        // Add RLS commands
        allSqlCommands.push('-- Enable RLS')
        allSqlCommands.push('ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;')
        allSqlCommands.push('ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;')
        allSqlCommands.push('ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;')
        allSqlCommands.push('ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;')
        allSqlCommands.push('ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;')
        allSqlCommands.push('ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;')
        allSqlCommands.push('')

        // Add index commands
        allSqlCommands.push('-- Create indexes')
        allSqlCommands.push('CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user_id ON public.wallet_accounts(user_id);')
        allSqlCommands.push('CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);')
        allSqlCommands.push('CREATE INDEX IF NOT EXISTS idx_verifications_project_id ON public.verifications(project_id);')
        allSqlCommands.push('CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);')
        allSqlCommands.push('CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);')

        const fullSqlScript = allSqlCommands.join('\n')

        if (navigator.clipboard) {
          await navigator.clipboard.writeText(fullSqlScript)
          alert('Complete SQL setup script copied to clipboard! Please run it in Supabase SQL Editor.')
        } else {
          alert(`Complete SQL setup script:\n\n${fullSqlScript}`)
        }

      } catch (error) {
        console.error('Error in full setup:', error)
        alert(`Error in setup: ${error.message}`)
      } finally {
        runningSetup.value = false
      }
    }

    const enableRLS = async () => {
      const rlsQueries = [
        'ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
      ]

      const rlsScript = rlsQueries.join('\n')

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(rlsScript)
        alert('RLS enable script copied to clipboard! Please run it in Supabase SQL Editor.')
      } else {
        alert(`Please copy and run this SQL in Supabase SQL Editor:\n\n${rlsScript}`)
      }
    }

    const createIndexes = async () => {
      const indexQueries = [
        'CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user_id ON public.wallet_accounts(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_verifications_project_id ON public.verifications(project_id);',
        'CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);',
        'CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);'
      ]

      const indexScript = indexQueries.join('\n')

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(indexScript)
        alert('Index creation script copied to clipboard! Please run it in Supabase SQL Editor.')
      } else {
        alert(`Please copy and run this SQL in Supabase SQL Editor:\n\n${indexScript}`)
      }
    }

    return {
      tables,
      selectedTable,
      loading,
      creatingTable,
      runningSetup,
      executingQuery,
      sqlQuery,
      queryResult,
      showTableModal,
      modalType,
      modalTitle,
      tableData,
      tableSchema,
      tableSchemas,
      loadTables,
      refreshTables,
      selectTable,
      viewTableData,
      viewTableSchema,
      dropTable,
      createTable,
      executeQuery,
      clearQuery,
      closeTableModal,
      runFullSetup,
      enableRLS,
      createIndexes
    }
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  background: #f8fafc;
}

.database-page {
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
  justify-content: between;
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

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.table-card {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.table-card:hover {
  border-color: #3182ce;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.15);
}

.table-card.active {
  border-color: #3182ce;
  background: #ebf8ff;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.table-type {
  font-size: 0.875rem;
  color: #718096;
  background: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.quick-actions {
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.action-group h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sql-interface {
  padding: 2rem;
}

.sql-input {
  margin-bottom: 1rem;
}

.sql-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  resize: vertical;
}

.sql-textarea:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.sql-actions {
  display: flex;
  gap: 0.75rem;
}

.query-results {
  margin-top: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.results-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
}

.result-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.result-status.success {
  background: #c6f6d5;
  color: #22543d;
}

.result-status.error {
  background: #fed7d7;
  color: #742a2a;
}

.results-content {
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.results-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-message {
  color: #e53e3e;
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
  width: 800px;
  display: flex;
  flex-direction: column;
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

.data-table, .schema-table {
  overflow-x: auto;
}

.data-table table, .schema-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th, .data-table td,
.schema-table th, .schema-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th, .schema-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #1a202c;
}

.data-note {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #ebf8ff;
  color: #2c5282;
  border-radius: 4px;
  font-size: 0.875rem;
}

.empty-data, .empty-schema {
  text-align: center;
  padding: 2rem;
  color: #718096;
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

.btn-success {
  background: #38a169;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #2f855a;
}

.btn-warning {
  background: #d69e2e;
  color: white;
}

.btn-warning:hover:not(:disabled) {
  background: #b7791f;
}

.btn-info {
  background: #3182ce;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #2c5aa0;
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

  .tables-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .quick-actions {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .modal-content {
    width: 95vw;
    margin: 1rem;
  }

  .modal-header, .modal-body {
    padding: 1rem;
  }
}
</style>
