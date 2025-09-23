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

              <form class="retire-form" @submit.prevent="handleRetire">
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

                <button type="submit" class="retire-button" :disabled="!canRetire">
                  <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Retire {{ creditsToRetire || 0 }} Credits
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

<script>
export default {
  name: 'RetireView',
  data() {
    return {
      selectedProject: '',
      creditsToRetire: 1,
      retirementPurpose: '',
      retirementStatement: '',
      availableProjects: [
        { id: 1, name: 'Amazon Rainforest Conservation', credits: 150 },
        { id: 2, name: 'Solar Farm Development', credits: 200 },
        { id: 3, name: 'Mangrove Restoration', credits: 75 },
        { id: 4, name: 'Wind Energy Project', credits: 300 },
        { id: 5, name: 'Forest Conservation', credits: 125 },
      ],
      retirementHistory: [
        {
          id: 1,
          project: 'Amazon Rainforest Conservation',
          credits: 50,
          purpose: 'Corporate Carbon Neutrality',
          date: '2024-01-15',
          certificateUrl: '#',
        },
        {
          id: 2,
          project: 'Solar Farm Development',
          credits: 25,
          purpose: 'Event Offset',
          date: '2024-01-10',
          certificateUrl: '#',
        },
        {
          id: 3,
          project: 'Mangrove Restoration',
          credits: 100,
          purpose: 'Product Carbon Footprint',
          date: '2023-12-20',
          certificateUrl: '#',
        },
      ],
    }
  },
  computed: {
    selectedProjectCredits() {
      const project = this.availableProjects.find((p) => p.id == this.selectedProject)
      return project ? project.credits : 0
    },
    selectedProjectName() {
      const project = this.availableProjects.find((p) => p.id == this.selectedProject)
      return project ? project.name : ''
    },
    canRetire() {
      return (
        this.selectedProject &&
        this.creditsToRetire > 0 &&
        this.creditsToRetire <= this.selectedProjectCredits &&
        this.retirementPurpose
      )
    },
  },
  methods: {
    handleRetire() {
      if (!this.canRetire) return

      // Simulate retirement process
      const retirement = {
        id: Date.now(),
        project: this.selectedProjectName,
        credits: this.creditsToRetire,
        purpose: this.retirementPurpose,
        date: new Date().toISOString().split('T')[0],
        certificateUrl: '#',
      }

      // Add to history
      this.retirementHistory.unshift(retirement)

      // Update available credits
      const project = this.availableProjects.find((p) => p.id == this.selectedProject)
      if (project) {
        project.credits -= this.creditsToRetire
      }

      // Reset form
      this.selectedProject = ''
      this.creditsToRetire = 1
      this.retirementPurpose = ''
      this.retirementStatement = ''

      // Show success message
      alert(`Successfully retired ${retirement.credits} credits from ${retirement.project}!`)
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },
  },
}
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
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
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
</style>

