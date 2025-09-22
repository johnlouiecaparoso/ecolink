<template>
  <div class="receipts-view">
    <div class="page-header">
      <h1 class="page-title">Receipts</h1>
      <p class="page-description">View and download your purchase receipts</p>
    </div>

    <div class="receipts-content">
      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="status-filter">Status:</label>
          <select id="status-filter" v-model="statusFilter" class="filter-select">
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="date-filter">Date Range:</label>
          <select id="date-filter" v-model="dateFilter" class="filter-select">
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="search">Search:</label>
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Search receipts..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Receipts List -->
      <div class="receipts-list">
        <div v-for="receipt in filteredReceipts" :key="receipt.id" class="receipt-card">
          <div class="receipt-header">
            <div class="receipt-info">
              <h3 class="receipt-title">Receipt #{{ receipt.id }}</h3>
              <p class="receipt-date">{{ formatDate(receipt.date) }}</p>
            </div>
            <div class="receipt-status">
              <span class="status-badge" :class="receipt.status">
                {{ receipt.status }}
              </span>
            </div>
          </div>

          <div class="receipt-body">
            <div class="receipt-details">
              <div class="detail-row">
                <span class="detail-label">Project:</span>
                <span class="detail-value">{{ receipt.project }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Credits:</span>
                <span class="detail-value">{{ receipt.credits }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">₱{{ receipt.amount.toLocaleString() }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{ receipt.paymentMethod }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">{{ receipt.transactionId }}</span>
              </div>
            </div>
          </div>

          <div class="receipt-actions">
            <button class="btn btn-primary" @click="downloadReceipt(receipt)">
              <span class="btn-icon">📄</span>
              Download PDF
            </button>
            <button class="btn btn-secondary" @click="viewReceipt(receipt)">
              <span class="btn-icon">👁️</span>
              View Details
            </button>
            <button class="btn btn-outline" @click="shareReceipt(receipt)">
              <span class="btn-icon">📤</span>
              Share
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredReceipts.length === 0" class="empty-state">
        <div class="empty-icon">🧾</div>
        <h3>No Receipts Found</h3>
        <p v-if="searchQuery || statusFilter || dateFilter">
          No receipts match your current filters. Try adjusting your search criteria.
        </p>
        <p v-else>
          You don't have any receipts yet. Start by purchasing some environmental credits!
        </p>
        <button class="btn btn-primary" @click="goToBuyCredits">Buy Credits</button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="btn btn-outline" @click="currentPage--" :disabled="currentPage === 1">
          Previous
        </button>
        <span class="page-info"> Page {{ currentPage }} of {{ totalPages }} </span>
        <button
          class="btn btn-outline"
          @click="currentPage++"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/formatDate'

export default {
  name: 'ReceiptsView',
  setup() {
    const router = useRouter()
    const statusFilter = ref('')
    const dateFilter = ref('')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10

    const receipts = ref([
      {
        id: 'RCP-001',
        date: new Date('2024-01-15'),
        status: 'completed',
        project: 'Solar Farm Initiative',
        credits: 100,
        amount: 5000,
        paymentMethod: 'GCash',
        transactionId: 'TXN-123456789',
      },
      {
        id: 'RCP-002',
        date: new Date('2024-01-14'),
        status: 'completed',
        project: 'Wind Power Program',
        credits: 75,
        amount: 3375,
        paymentMethod: 'Maya',
        transactionId: 'TXN-123456790',
      },
      {
        id: 'RCP-003',
        date: new Date('2024-01-13'),
        status: 'pending',
        project: 'Green Forest Project',
        credits: 200,
        amount: 6000,
        paymentMethod: 'GCash',
        transactionId: 'TXN-123456791',
      },
      {
        id: 'RCP-004',
        date: new Date('2024-01-12'),
        status: 'completed',
        project: 'Blue Ocean Initiative',
        credits: 50,
        amount: 1250,
        paymentMethod: 'Maya',
        transactionId: 'TXN-123456792',
      },
      {
        id: 'RCP-005',
        date: new Date('2024-01-11'),
        status: 'cancelled',
        project: 'Solar Farm Initiative',
        credits: 150,
        amount: 7500,
        paymentMethod: 'GCash',
        transactionId: 'TXN-123456793',
      },
    ])

    const filteredReceipts = computed(() => {
      let filtered = receipts.value

      // Filter by status
      if (statusFilter.value) {
        filtered = filtered.filter((receipt) => receipt.status === statusFilter.value)
      }

      // Filter by date
      if (dateFilter.value) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        filtered = filtered.filter((receipt) => {
          const receiptDate = new Date(receipt.date)

          switch (dateFilter.value) {
            case 'today':
              return receiptDate >= today
            case 'week':
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              return receiptDate >= weekAgo
            case 'month':
              const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
              return receiptDate >= monthAgo
            case 'year':
              const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
              return receiptDate >= yearAgo
            default:
              return true
          }
        })
      }

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
          (receipt) =>
            receipt.id.toLowerCase().includes(query) ||
            receipt.project.toLowerCase().includes(query) ||
            receipt.transactionId.toLowerCase().includes(query),
        )
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredReceipts.value.length / itemsPerPage)
    })

    const downloadReceipt = (receipt) => {
      console.log('Downloading receipt:', receipt.id)
      // Implement download functionality
      alert(`Downloading receipt ${receipt.id}`)
    }

    const viewReceipt = (receipt) => {
      console.log('Viewing receipt:', receipt.id)
      // Implement view functionality
      alert(`Viewing receipt ${receipt.id}`)
    }

    const shareReceipt = (receipt) => {
      console.log('Sharing receipt:', receipt.id)
      // Implement share functionality
      if (navigator.share) {
        navigator.share({
          title: `Receipt ${receipt.id}`,
          text: `Environmental credits purchase receipt for ${receipt.project}`,
          url: window.location.href,
        })
      } else {
        alert(`Sharing receipt ${receipt.id}`)
      }
    }

    const goToBuyCredits = () => {
      router.push('/buy-credits')
    }

    onMounted(() => {
      // Load receipts data
    })

    return {
      statusFilter,
      dateFilter,
      searchQuery,
      currentPage,
      receipts,
      filteredReceipts,
      totalPages,
      downloadReceipt,
      viewReceipt,
      shareReceipt,
      goToBuyCredits,
      formatDate,
    }
  },
}
</script>

<style scoped>
.receipts-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #718096;
  font-size: 1.1rem;
}

.filters-section {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
}

.filter-select,
.search-input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-input {
  min-width: 200px;
}

.receipts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.receipt-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.receipt-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.receipt-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.receipt-date {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.pending {
  background: #fed7d7;
  color: #742a2a;
}

.status-badge.cancelled {
  background: #f7fafc;
  color: #4a5568;
}

.receipt-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f7fafc;
}

.detail-label {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: #1a202c;
  font-weight: 600;
}

.receipt-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5aa0;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-outline {
  background: transparent;
  color: #3182ce;
  border: 1px solid #3182ce;
}

.btn-outline:hover {
  background: #3182ce;
  color: white;
}

.btn:disabled {
  background: #a0aec0;
  color: #718096;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .receipt-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>
