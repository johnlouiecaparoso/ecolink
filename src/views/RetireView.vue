<template>
  <div class="retire-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Retire Carbon Credits</h1>
        <p class="page-description">Permanently retire your carbon credits to offset emissions</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="retire-content">
      <div class="container">
        <div class="content-layout">
          <!-- Left Column - Retire Form -->
          <div class="retire-form-section">
            <div class="retire-card">
              <h2 class="card-title">Retire Credits</h2>
              <p class="card-description">
                Retire your carbon credits to permanently offset emissions and receive a retirement
                certificate.
              </p>

              <!-- Error State -->
              <div v-if="error" class="error-message">
                {{ error }}
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="loading-message">Loading your credits...</div>

              <!-- Empty State -->
              <div v-if="!loading && availableProjects.length === 0" class="empty-state">
                <p>No credits available for retirement. Purchase some credits first!</p>
              </div>

              <form v-else-if="!loading" class="retire-form" @submit.prevent="handleRetire">
                <div class="form-group">
                  <label class="form-label">Select Project</label>
                  <select v-model="selectedProject" class="form-select" required>
                    <option value="">Choose a project...</option>
                    <option
                      v-for="project in availableProjects"
                      :key="project.id"
                      :value="project.id"
                    >
                      {{ project.name }} - {{ project.credits }} credits available
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Credits to Retire</label>
                  <input
                    v-model.number="creditsToRetire"
                    type="number"
                    min="1"
                    :max="selectedProjectCredits"
                    class="form-input"
                    placeholder="Enter number of credits"
                    required
                  />
                  <div class="input-help">Available: {{ selectedProjectCredits }} credits</div>
                </div>

                <div class="form-group">
                  <label class="form-label">Retirement Purpose</label>
                  <select v-model="retirementPurpose" class="form-select" required>
                    <option value="">Select purpose...</option>
                    <option value="corporate">Corporate Carbon Neutrality</option>
                    <option value="event">Event Offset</option>
                    <option value="product">Product Carbon Footprint</option>
                    <option value="personal">Personal Carbon Footprint</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Retirement Statement (Optional)</label>
                  <textarea
                    v-model="retirementStatement"
                    class="form-textarea"
                    rows="3"
                    placeholder="Describe the purpose of this retirement..."
                  ></textarea>
                </div>

                <div class="retirement-summary">
                  <h3 class="summary-title">Retirement Summary</h3>
                  <div class="summary-item">
                    <span class="summary-label">Credits to Retire:</span>
                    <span class="summary-value">{{ creditsToRetire || 0 }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Project:</span>
                    <span class="summary-value">{{ selectedProjectName || 'None selected' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Purpose:</span>
                    <span class="summary-value">{{ retirementPurpose || 'None selected' }}</span>
                  </div>
                </div>

                <button type="submit" class="retire-button" :disabled="!canRetire || loading">
                  <svg
                    v-if="!loading"
                    class="button-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {{ loading ? 'Retiring...' : `Retire ${creditsToRetire || 0} Credits` }}
                </button>
              </form>
            </div>
          </div>

          <!-- Right Column - Retirement History -->
          <div class="retirement-history">
            <div class="history-card">
              <h2 class="card-title">Retirement History</h2>
              <div class="history-list">
                <div
                  v-for="retirement in retirementHistory"
                  :key="retirement.id"
                  class="history-item"
                >
                  <div class="history-header">
                    <span class="history-project">{{ retirement.project }}</span>
                    <span class="history-date">{{ formatDate(retirement.date) }}</span>
                  </div>
                  <div class="history-details">
                    <span class="history-credits">{{ retirement.credits }} credits</span>
                    <span class="history-purpose">{{ retirement.purpose }}</span>
                  </div>
                  <div class="history-certificate">
                    <a :href="retirement.certificateUrl" target="_blank" class="certificate-link">
                      <svg
                        class="certificate-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      View Certificate
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import { getUserCreditPortfolio, retireCredits } from '@/services/marketplaceService'

const userStore = useUserStore()

// Form data
const selectedProject = ref('')
const creditsToRetire = ref(1)
const retirementPurpose = ref('')
const retirementStatement = ref('')

// Data
const availableProjects = ref([])
const retirementHistory = ref([])
const loading = ref(false)
const error = ref('')

// Computed properties
const selectedProjectCredits = computed(() => {
  const project = availableProjects.value.find((p) => p.id == selectedProject.value)
  return project ? project.quantity : 0
})

const selectedProjectName = computed(() => {
  const project = availableProjects.value.find((p) => p.id == selectedProject.value)
  return project ? project.project_title : ''
})

const canRetire = computed(() => {
  return (
    selectedProject.value &&
    creditsToRetire.value > 0 &&
    creditsToRetire.value <= selectedProjectCredits.value &&
    retirementPurpose.value
  )
})

// Methods
const loadUserCredits = async () => {
  const userId = userStore.session?.user?.id || userStore.user?.id
  if (!userId) return

  loading.value = true
  error.value = ''

  try {
    const credits = await getUserCreditPortfolio(userId)

    // Transform the data to include project details (only show credits with quantity > 0)
    availableProjects.value = credits
      .filter((credit) => credit.quantity > 0)
      .map((credit) => ({
        id: credit.project_credits?.projects?.id || credit.id,
        name: credit.project_credits?.projects?.title || 'Unknown Project',
        project_title: credit.project_credits?.projects?.title || 'Unknown Project',
        credits: credit.quantity,
        quantity: credit.quantity,
        category: credit.project_credits?.projects?.category || 'Unknown',
        location: credit.project_credits?.projects?.location || 'Unknown',
      }))

    // Load retirement history from credit_retirements table separately
    try {
      const userId = userStore.session?.user?.id || userStore.user?.id
      const supabase = (await import('@/services/supabaseClient')).getSupabase()
      const { data: retirements } = await supabase
        .from('credit_retirements')
        .select(`
          *,
          projects(
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .order('retired_at', { ascending: false })

      retirementHistory.value = (retirements || []).map((retirement) => ({
        id: retirement.id,
        project: retirement.projects?.title || 'Unknown Project',
        credits: retirement.quantity,
        purpose: retirement.reason || 'Carbon Offset',
        date: retirement.retired_at,
        certificateUrl: '#',
      }))
    } catch (retirementError) {
      console.error('Error loading retirement history:', retirementError)
      retirementHistory.value = []
    }
  } catch (err) {
    console.error('Error loading user credits:', err)
    error.value = 'Failed to load your credits. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleRetire = async () => {
  if (!canRetire.value) return

  loading.value = true
  error.value = ''

  try {
    const selectedCredit = availableProjects.value.find((p) => p.id == selectedProject.value)

    if (!selectedCredit) {
      throw new Error('Selected project not found')
    }

    const creditsToRetireValue = creditsToRetire.value
    const projectName = selectedProjectName.value

    // Get user ID from store
    const userId = userStore.session?.user?.id || userStore.user?.id
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Get project ID from selected credit
    const projectId = selectedCredit.id
    if (!projectId) {
      throw new Error('Project ID not found')
    }

    // Call the retire service with correct parameters
    await retireCredits(
      userId,
      projectId,
      creditsToRetireValue,
      retirementPurpose.value + (retirementStatement.value ? ` - ${retirementStatement.value}` : '')
    )

    // Reset form
    selectedProject.value = ''
    creditsToRetire.value = 1
    retirementPurpose.value = ''
    retirementStatement.value = ''

    // Reload data
    await loadUserCredits()

    // Show success message
    alert(`Successfully retired ${creditsToRetireValue} credits from ${projectName}!`)
  } catch (err) {
    console.error('Error retiring credits:', err)
    error.value = err.message || 'Failed to retire credits. Please try again.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Lifecycle
onMounted(() => {
  loadUserCredits()
})
</script>

<style scoped>
.retire-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Page Header */
.page-header {
  padding: 2rem 0;
  background: var(--primary-color, #10b981);
  border-bottom: none;
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: var(--font-size-lg);
  color: #fff;
}

/* Main Content */
.retire-content {
  padding: 2rem 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Retire Form Section */
.retire-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.card-description {
  color: var(--text-muted);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.retire-form {
  display: grid;
  gap: 1.5rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--bg-primary);
  outline: none;
  transition: var(--transition);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(6, 158, 45, 0.1);
}

.input-help {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.retirement-summary {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin: 1rem 0;
}

.summary-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-label {
  color: var(--text-secondary);
}

.summary-value {
  font-weight: 500;
  color: var(--text-primary);
}

.retire-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.retire-button:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.retire-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Retirement History */
.retirement-history {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.history-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-project {
  font-weight: 500;
  color: var(--text-primary);
}

.history-date {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.history-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.history-credits {
  font-weight: 600;
  color: var(--primary-color);
}

.history-purpose {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.certificate-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: var(--transition);
}

.certificate-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.certificate-icon {
  width: 1rem;
  height: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .retirement-history {
    position: static;
  }
}

@media (max-width: 768px) {
  .retire-content {
    padding: 1.5rem 0;
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .retire-card {
    padding: 1.5rem;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .history-details {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Error and Loading States */
.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.loading-message {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
}

.empty-state {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1.5rem;
}
</style>
