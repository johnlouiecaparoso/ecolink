<template>
  <div class="marketplace">
    <!-- Header Section -->
    <div class="marketplace-header">
      <div class="container">
        <h1 class="page-title">Carbon Credit Marketplace</h1>
        <p class="page-description">
          Discover and purchase verified carbon credits from projects worldwide
        </p>

        <!-- Search and Action Controls -->
        <div class="search-controls">
          <button
            @click="showAdvancedSearch = !showAdvancedSearch"
            class="advanced-search-toggle"
            :class="{ active: showAdvancedSearch }"
          >
            🔍 Advanced Search
          </button>
          <button
            v-if="userStore.isProjectDeveloper"
            @click="navigateToSubmitProject"
            class="submit-project-button"
          >
            📝 Submit Project
          </button>
        </div>
      </div>
    </div>

    <!-- Advanced Search Panel -->
    <div v-if="showAdvancedSearch" class="advanced-search-panel">
      <div class="container">
        <AdvancedSearch
          v-model="searchFilters"
          :categories="categories"
          :countries="countries"
          :verification-standards="verificationStandards"
          @search="handleAdvancedSearch"
          @reset="handleSearchReset"
        />
      </div>
    </div>

    <!-- Main Content -->
    <div class="marketplace-content">
      <div class="container">
        <div class="content-layout">
          <!-- Projects Content -->
          <div class="projects-content">
            <!-- Results Header -->
            <div class="results-header">
              <div class="results-info">
                <span class="results-count">
                  Showing {{ filteredListings.length }} credit listings
                </span>
              </div>
              <div class="view-controls">
                <button
                  @click="viewMode = 'grid'"
                  :class="{ active: viewMode === 'grid' }"
                  class="view-toggle"
                >
                  ⊞ Grid
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="{ active: viewMode === 'list' }"
                  class="view-toggle"
                >
                  ☰ List
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading marketplace listings...</p>
              <div class="loading-skeleton">
                <div class="skeleton-card" v-for="n in 6" :key="n">
                  <div class="skeleton-image"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text short"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="errorMessage" class="error-state">
              <div class="error-icon">⚠️</div>
              <h3>Error Loading Marketplace</h3>
              <p>{{ errorMessage }}</p>
              <button @click="loadMarketplaceData" class="retry-button">Try Again</button>
            </div>

            <!-- Projects Grid/List -->
            <div v-else-if="filteredListings.length > 0" class="projects-container">
              <!-- Grid View -->
              <div v-if="viewMode === 'grid'" class="projects-grid">
                <MobileCard
                  v-for="listing in paginatedListings"
                  :key="listing.listing_id"
                  :title="listing.project_title"
                  :description="listing.project_description"
                  :image="listing.project_image"
                  :price="listing.price_per_credit"
                  :currency="listing.currency"
                  :badge="listing.certification_status"
                  :available-credits="listing.available_quantity"
                  :clickable="true"
                  :swipeable="true"
                  @click="viewProject(listing)"
                  @swipe-left="navigateToBuyCredits(listing)"
                  @swipe-right="openPurchaseModal(listing)"
                />
              </div>

              <!-- List View -->
              <div v-else class="projects-list">
                <div
                  v-for="listing in paginatedListings"
                  :key="listing.listing_id"
                  class="project-list-item"
                  @click="viewProject(listing)"
                >
                  <div class="project-image">
                    <img
                      v-if="listing.project_image"
                      :src="listing.project_image"
                      :alt="listing.project_title"
                    />
                    <img
                      v-else
                      :src="`https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop&${listing.listing_id}`"
                      :alt="listing.project_title"
                    />
                  </div>
                  <div class="project-info">
                    <h3 class="project-title">{{ listing.project_title }}</h3>
                    <p class="project-description">{{ listing.project_description }}</p>
                    <div class="project-meta">
                      <span class="project-location">📍 {{ listing.location }}</span>
                      <span class="project-category">🏷️ {{ listing.category }}</span>
                      <span class="project-vintage">📅 {{ listing.vintage_year }}</span>
                    </div>
                  </div>
                  <div class="project-pricing">
                    <div class="price">
                      {{ formatCurrency(listing.price_per_credit, listing.currency) }}
                    </div>
                    <div class="quantity">
                      {{ formatNumber(listing.available_quantity) }} credits
                    </div>
                    <UiButton
                      variant="primary"
                      size="sm"
                      @click.stop="showPurchaseModalFor(listing)"
                    >
                      Purchase
                    </UiButton>
                    <UiButton
                      v-if="userStore.isAdmin"
                      variant="danger"
                      size="sm"
                      @click.stop="adminDeleteListing(listing)"
                      style="margin-left: 0.5rem"
                    >
                      🗑️ Delete
                    </UiButton>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <Pagination
                v-if="totalPages > 1"
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredListings.length"
                :items-per-page="itemsPerPage"
                @update:current-page="currentPage = $event"
              />
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <div class="empty-icon">🔍</div>
              <h3>No projects found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button @click="clearFilters" class="clear-filters-button">Clear Filters</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Purchase Modal -->
    <AccessibleModal
      v-if="showPurchaseModal"
      :is-open="showPurchaseModal"
      title="Purchase Carbon Credits"
      :description="`Purchase credits from ${selectedListing?.project_title}`"
      @close="closePurchaseModal"
    >
      <div class="purchase-modal-content">
        <div class="project-summary">
          <h4>{{ selectedListing?.project_title }}</h4>
          <p>{{ selectedListing?.project_description }}</p>
          <div class="project-details">
            <span>📍 {{ selectedListing?.location }}</span>
            <span>🏷️ {{ selectedListing?.category }}</span>
            <span>📅 {{ selectedListing?.vintage_year }}</span>
          </div>
        </div>

        <div class="purchase-form">
          <div class="form-group">
            <label for="quantity">Quantity (credits)</label>
            <input
              id="quantity"
              v-model.number="purchaseQuantity"
              type="number"
              min="1"
              :max="maxPurchaseQuantity"
              class="form-input"
            />
            <small class="input-help">
              Available: {{ formatNumber(selectedListing?.available_quantity || 0) }} credits
              <span v-if="selectedListing?.estimated_credits">
                (Developer limit: {{ formatNumber(selectedListing.estimated_credits) }})
              </span>
            </small>
            <div v-if="purchaseQuantity > maxPurchaseQuantity" class="error-message">
              ⚠️ Cannot purchase more than {{ formatNumber(maxPurchaseQuantity) }} credits. Available: {{ formatNumber(selectedListing?.available_quantity || 0) }} credits
            </div>
          </div>

          <div class="purchase-summary">
            <div class="summary-row">
              <span>Price per credit:</span>
              <span>{{
                formatCurrency(selectedListing?.price_per_credit, selectedListing?.currency)
              }}</span>
            </div>
            <div class="summary-row">
              <span>Quantity:</span>
              <span>{{ purchaseQuantity }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ formatCurrency(totalPrice, selectedListing?.currency) }}</span>
            </div>
          </div>

          <!-- Payment Method Selection -->
          <div class="form-group">
            <label for="paymentMethod">Payment Method</label>
            <div class="payment-methods">
              <div
                v-for="method in paymentMethods"
                :key="method.value"
                :class="['payment-method-card', { active: selectedPaymentMethod === method.value }]"
                @click="selectedPaymentMethod = method.value"
              >
                <div class="payment-method-icon">{{ method.icon }}</div>
                <div class="payment-method-info">
                  <div class="payment-method-name">{{ method.label }}</div>
                  <div v-if="method.value === 'wallet'" class="wallet-balance">
                    Balance: {{ formatCurrency(walletBalance, 'PHP') }}
                  </div>
                  <div v-else class="payment-method-desc">{{ method.description }}</div>
                </div>
                <div v-if="method.value === 'wallet' && walletBalance < totalPrice" class="insufficient-balance">
                  Insufficient funds
                </div>
              </div>
            </div>
            <div v-if="selectedPaymentMethod === 'wallet' && walletBalance < totalPrice" class="error-message">
              ⚠️ Your wallet balance ({{ formatCurrency(walletBalance, 'PHP') }}) is insufficient for this purchase ({{ formatCurrency(totalPrice, selectedListing?.currency) }})
            </div>
          </div>

          <div class="purchase-actions">
            <UiButton variant="outline" @click="closePurchaseModal"> Cancel </UiButton>
            <UiButton
              variant="primary"
              :loading="purchaseLoading"
              :disabled="selectedPaymentMethod === 'wallet' && walletBalance < totalPrice"
              @click="handlePurchase"
            >
              Complete Purchase
            </UiButton>
          </div>
        </div>
      </div>
    </AccessibleModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getMarketplaceListings, getMarketplaceStats } from '@/services/marketplaceService'
import { projectService } from '@/services/projectService'
import { getSupabase } from '@/services/supabaseClient'
import { useModernPrompt } from '@/composables/useModernPrompt'
import UiButton from '@/components/ui/Button.vue'
import AdvancedSearch from '@/components/search/AdvancedSearch.vue'
import Pagination from '@/components/ui/Pagination.vue'
import MobileCard from '@/components/mobile/MobileCard.vue'
import AccessibleModal from '@/components/ui/AccessibleModal.vue'

const { confirm, success, error: showErrorPrompt, warning } = useModernPrompt()

const router = useRouter()
const userStore = useUserStore()

// State
const listings = ref([])
const loading = ref(false)
const errorMessage = ref('')
const marketplaceStats = ref({
  totalListings: 0,
  totalCredits: 0,
  averagePrice: 0,
})
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedCountry = ref('')
const priceRange = ref({ min: '', max: '' })
const sortBy = ref('name')
const showAdvancedSearch = ref(false)
const viewMode = ref('grid') // 'grid' or 'list'
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Search filters for advanced search
const searchFilters = ref({
  query: '',
  category: '',
  country: '',
  standard: '',
  priceMin: '',
  priceMax: '',
  vintageYear: '',
  sortBy: 'relevance',
  sortOrder: 'desc',
})

// Purchase modal state
const showPurchaseModal = ref(false)
const selectedListing = ref(null)
const purchaseQuantity = ref(1)
const purchaseLoading = ref(false)
const selectedPaymentMethod = ref('wallet') // Default to wallet
const walletBalance = ref(0)

// Payment methods
const paymentMethods = [
  {
    value: 'wallet',
    label: 'Wallet Balance',
    icon: '💳',
    description: 'Pay from your wallet',
  },
  {
    value: 'card',
    label: 'Credit/Debit Card',
    icon: '💳',
    description: 'Pay with credit or debit card',
  },
  {
    value: 'gcash',
    label: 'GCash',
    icon: '📱',
    description: 'Pay via GCash (PayMongo)',
  },
  {
    value: 'maya',
    label: 'Maya',
    icon: '🏦',
    description: 'Pay via Maya (PayMongo)',
  },
]

// Categories and countries
const categories = ref([
  { value: 'all', label: 'All Categories' },
  { value: 'Forestry', label: 'Forestry' },
  { value: 'Renewable Energy', label: 'Renewable Energy' },
  { value: 'Blue Carbon', label: 'Blue Carbon' },
  { value: 'Energy Efficiency', label: 'Energy Efficiency' },
  { value: 'Waste Management', label: 'Waste Management' },
])

const countries = ref([
  'Brazil',
  'Kenya',
  'Philippines',
  'India',
  'Scotland',
  'Indonesia',
  'Vietnam',
  'Nepal',
  'Mexico',
  'Peru',
  'Colombia',
  'Thailand',
])

const verificationStandards = ref([
  { value: 'VCS', label: 'Verified Carbon Standard' },
  { value: 'Gold Standard', label: 'Gold Standard' },
  { value: 'CAR', label: 'Climate Action Reserve' },
  { value: 'ACR', label: 'American Carbon Registry' },
])

// Computed properties
const filteredListings = computed(() => {
  let filtered = [...listings.value]

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (listing) =>
        listing.project_title.toLowerCase().includes(query) ||
        listing.project_description.toLowerCase().includes(query) ||
        listing.location.toLowerCase().includes(query),
    )
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter((listing) => listing.category === selectedCategory.value)
  }

  // Apply country filter
  if (selectedCountry.value) {
    filtered = filtered.filter((listing) =>
      listing.location.toLowerCase().includes(selectedCountry.value.toLowerCase()),
    )
  }

  // Apply price range filter
  if (priceRange.value.min) {
    filtered = filtered.filter(
      (listing) => listing.price_per_credit >= parseFloat(priceRange.value.min),
    )
  }
  if (priceRange.value.max) {
    filtered = filtered.filter(
      (listing) => listing.price_per_credit <= parseFloat(priceRange.value.max),
    )
  }

  // Apply sorting
  switch (sortBy.value) {
    case 'price-low':
      filtered.sort((a, b) => a.price_per_credit - b.price_per_credit)
      break
    case 'price-high':
      filtered.sort((a, b) => b.price_per_credit - a.price_per_credit)
      break
    case 'tonnes':
      filtered.sort((a, b) => b.available_quantity - a.available_quantity)
      break
    case 'year':
      filtered.sort((a, b) => b.vintage_year - a.vintage_year)
      break
    default:
      filtered.sort((a, b) => a.project_title.localeCompare(b.project_title))
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredListings.value.length / itemsPerPage.value))

const paginatedListings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredListings.value.slice(start, end)
})

const totalPrice = computed(() => {
  if (!selectedListing.value || !purchaseQuantity.value) return 0
  return selectedListing.value.price_per_credit * purchaseQuantity.value
})

// Maximum quantity that can be purchased (respects developer limit)
const maxPurchaseQuantity = computed(() => {
  if (!selectedListing.value) return 0
  
  // Use available_quantity which already respects developer limit
  return selectedListing.value.available_quantity || 0
})

// Watch purchase quantity to enforce max limit
watch(purchaseQuantity, (newQuantity) => {
  if (newQuantity && selectedListing.value && newQuantity > maxPurchaseQuantity.value) {
    purchaseQuantity.value = maxPurchaseQuantity.value
    // Note: We don't show a prompt here to avoid issues with watch callbacks
    // The input field's max attribute will prevent entering values above the limit
  }
})

// Methods
async function loadMarketplaceData() {
  loading.value = true
  errorMessage.value = ''
  
  // Clear old listings to prevent stale data
  listings.value = []

  try {
    const [listingsData, statsData] = await Promise.all([
      getMarketplaceListings(),
      getMarketplaceStats(),
    ])

    console.log('📦 Received listings data:', listingsData?.length || 0, 'listings')
    console.log('📦 First listing price:', listingsData?.[0]?.price_per_credit)
    
    listings.value = listingsData || []
    marketplaceStats.value = statsData
  } catch (err) {
    console.error('Error loading marketplace data:', err)
    errorMessage.value = 'Failed to load marketplace data'
    // Ensure listings is empty on error
    listings.value = []
  } finally {
    loading.value = false
  }
}

function handleAdvancedSearch(filters) {
  searchQuery.value = filters.query
  selectedCategory.value = filters.category
  selectedCountry.value = filters.country
  priceRange.value = { min: filters.priceMin, max: filters.priceMax }
  sortBy.value = filters.sortBy
  currentPage.value = 1
}

function handleSearchReset() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedCountry.value = ''
  priceRange.value = { min: '', max: '' }
  sortBy.value = 'name'
  currentPage.value = 1
}

function clearFilters() {
  handleSearchReset()
  showAdvancedSearch.value = false
}

function viewProject(listing) {
  console.log('Viewing project:', listing)
  // Open purchase modal instead of navigating
  openPurchaseModal(listing)
}

function navigateToBuyCredits(listing) {
  console.log('Navigating to buy credits for:', listing.project_title)
  // Navigate to buy credits page with pre-selected project
  router.push({
    path: '/buy-credits',
    query: {
      project: listing.project_id,
      listing: listing.listing_id,
      title: listing.project_title,
      price: listing.price_per_credit,
      currency: listing.currency,
    },
  })
}

function openPurchaseModal(listing) {
  console.log('Opening purchase modal for:', listing.project_title)
  showPurchaseModalFor(listing)
}

function navigateToSubmitProject() {
  console.log('Navigating to submit project')
  router.push('/submit-project')
}

async function showPurchaseModalFor(listing) {
  // Check if user is authenticated first
  console.log('🔐 Checking authentication before opening modal:', {
    isAuthenticated: userStore.isAuthenticated,
    hasSession: !!userStore.session,
    userEmail: userStore.session?.user?.email
  })
  
  if (!userStore.isAuthenticated) {
    alert('Please log in to purchase credits')
    router.push({ name: 'login', query: { returnTo: '/marketplace' } })
    return
  }
  
  selectedListing.value = listing
  purchaseQuantity.value = 1
  showPurchaseModal.value = true
  
  // Load wallet balance
  try {
    const { getWalletBalance } = await import('@/services/walletService')
    const balance = await getWalletBalance()
    walletBalance.value = balance.current_balance || 0
  } catch (err) {
    console.error('Failed to load wallet balance:', err)
    walletBalance.value = 0
  }
}

function closePurchaseModal() {
  showPurchaseModal.value = false
  selectedListing.value = null
  purchaseQuantity.value = 1
}

async function handlePurchase() {
  if (!selectedListing.value || !purchaseQuantity.value) {
    await warning({
      title: 'Invalid Quantity',
      message: 'Please enter a valid quantity to purchase.',
      confirmText: 'OK',
      showCancel: false,
    })
    return
  }
  
  // Validate quantity doesn't exceed available credits
  if (purchaseQuantity.value > maxPurchaseQuantity.value) {
    await warning({
      title: 'Insufficient Credits',
      message: `Cannot purchase more than ${formatNumber(maxPurchaseQuantity.value)} credits. Only ${formatNumber(selectedListing.value.available_quantity)} credits available.`,
      confirmText: 'OK',
      showCancel: false,
    })
    return
  }

  // Check if user is authenticated
  if (!userStore.isAuthenticated) {
    await warning({
      title: 'Authentication Required',
      message: 'Please log in to purchase credits.',
      confirmText: 'Go to Login',
      showCancel: false,
    })
    router.push({ name: 'login', query: { returnTo: '/marketplace' } })
    return
  }

  purchaseLoading.value = true
  try {
    // Import the purchase function
    const { purchaseCredits } = await import('@/services/marketplaceService')

    // Create purchase data
    const purchaseData = {
      quantity: purchaseQuantity.value,
      paymentMethod: selectedPaymentMethod.value, // Use selected payment method
      paymentData: null,
    }

    // Process the purchase
    const result = await purchaseCredits(selectedListing.value.listing_id, purchaseData)

    // Handle redirect for PayMongo checkout
    if (result.redirect && result.checkoutUrl) {
      // Store the pending purchase
      localStorage.setItem('pending_purchase_session', result.sessionId)
      
      // Redirect to PayMongo checkout
      window.location.href = result.checkoutUrl
      return // Stop here, user will be redirected
    }

    // Show success message for immediate completion (demo mode or wallet payment)
    const totalAmount = result.transaction.total_amount
    const currency = result.transaction.currency

    // Refresh wallet balance if wallet payment was used
    if (selectedPaymentMethod.value === 'wallet') {
      try {
        const { getWalletBalance } = await import('@/services/walletService')
        const balance = await getWalletBalance()
        walletBalance.value = balance.current_balance || 0
      } catch (err) {
        console.error('Failed to refresh wallet balance:', err)
      }
    }

    await success({
      title: 'Purchase Successful! 🎉',
      message: `You purchased ${purchaseQuantity.value} credits from "${selectedListing.value.project_title}" for ${formatCurrency(totalAmount, currency)}. Your carbon credits have been added to your portfolio!`,
      confirmText: 'OK',
    })

    closePurchaseModal()

    // Reload marketplace data to update available quantities
    await loadMarketplaceData()
  } catch (err) {
    console.error('Purchase failed:', err)
    await showErrorPrompt({
      title: 'Purchase Failed',
      message: err.message || 'Please try again.',
      confirmText: 'OK',
    })
  } finally {
    purchaseLoading.value = false
  }
}

function formatCurrency(amount, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

function formatNumber(number) {
  return new Intl.NumberFormat('en-US').format(number)
}

// Admin delete function
async function adminDeleteListing(listing) {
  const confirmed = await confirm({
    type: 'warning',
    title: 'Delete Listing?',
    message: `Are you sure you want to delete "${listing.project_title}" from the marketplace? This action cannot be undone and will remove the project from public view.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })

  if (!confirmed) {
    return
  }

  try {
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    // Delete the credit listing first
    const { error: deleteError } = await supabase
      .from('credit_listings')
      .delete()
      .eq('id', listing.listing_id)

    if (deleteError) {
      console.error('Error deleting credit listing:', deleteError)
      await showErrorPrompt({
        title: 'Delete Failed',
        message: deleteError.message || 'Failed to delete listing. Please try again.',
        confirmText: 'OK',
      })
      return
    }

    console.log('Successfully deleted listing from marketplace')
    
    // Reload marketplace data
    await loadMarketplaceData()
    
    await success({
      title: 'Listing Deleted',
      message: `"${listing.project_title}" has been successfully removed from the marketplace.`,
      confirmText: 'OK',
    })
  } catch (err) {
    console.error('Error deleting listing from marketplace:', err)
    await showErrorPrompt({
      title: 'Delete Failed',
      message: err.message || 'An error occurred while deleting the listing.',
      confirmText: 'OK',
    })
  }
}

// Lifecycle
onMounted(() => {
  loadMarketplaceData()
})
</script>

<style scoped>
/* Enhanced Marketplace Styles */
.marketplace {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.marketplace-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  padding: 3rem 0;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.page-description {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0 0 2rem 0;
}

.search-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.advanced-search-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.advanced-search-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

.advanced-search-toggle.active {
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary-color);
}

.submit-project-button {
  background: var(--primary-color);
  border: 1px solid var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.submit-project-button:hover {
  background: var(--primary-hover, #058e3f);
  border-color: var(--primary-hover, #058e3f);
  transform: translateY(-1px);
}

.advanced-search-panel {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 2rem 0;
}

.marketplace-content {
  padding: 2rem 0;
}

.projects-content {
  width: 100%;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.results-count {
  font-weight: 500;
  color: var(--text-secondary);
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle:hover {
  background: var(--bg-muted);
}

.view-toggle.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.project-list-item {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  gap: 1.5rem;
}

.project-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.project-image {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-info {
  flex: 1;
}

.project-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.project-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.project-pricing {
  text-align: right;
  flex-shrink: 0;
}

.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.quantity {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

/* Loading and Error States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
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

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button,
.clear-filters-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.retry-button:hover,
.clear-filters-button:hover {
  background: var(--primary-hover);
}

/* Purchase Modal */
.purchase-modal-content {
  padding: 1rem;
}

.project-summary {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.project-summary h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.project-summary p {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.project-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.purchase-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
}

.purchase-summary {
  background: var(--bg-muted);
  padding: 1rem;
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-row.total {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--primary-color);
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.purchase-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Payment Method Selection */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-method-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

.payment-method-card:hover {
  border-color: var(--primary-color);
  background: var(--bg-muted);
}

.payment-method-card.active {
  border-color: var(--primary-color);
  background: var(--primary-light, rgba(6, 158, 45, 0.1));
}

.payment-method-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.payment-method-info {
  flex: 1;
}

.payment-method-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.payment-method-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.wallet-balance {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-color);
}

.insufficient-balance {
  font-size: 0.75rem;
  color: var(--error-color, #dc2626);
  font-weight: 500;
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--error-light, rgba(220, 38, 38, 0.1));
  border: 1px solid var(--error-color, #dc2626);
  border-radius: 6px;
  color: var(--error-color, #dc2626);
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .marketplace-header {
    padding: 2rem 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
    margin: 0 0 1.5rem 0;
  }

  .advanced-search-toggle {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }

  .marketplace-content {
    padding: 1rem 0;
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    margin-bottom: 1rem;
    padding: 0.75rem;
  }

  .view-controls {
    justify-content: center;
  }

  .view-toggle {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .projects-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .project-list-item {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .project-image {
    width: 100%;
    height: 200px;
  }

  .project-pricing {
    text-align: left;
  }

  .project-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Purchase modal mobile */
  .purchase-modal-content {
    padding: 0.5rem;
  }

  .project-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .purchase-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .purchase-actions .ui-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .marketplace-header {
    padding: 1.5rem 0;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .container {
    padding: 0 1rem;
  }

  .projects-grid {
    gap: 0.75rem;
  }

  .project-list-item {
    padding: 0.75rem;
  }

  .form-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>
