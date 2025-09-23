<template>
  <div class="project-detail">
    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <div class="container">
        <nav class="breadcrumb-nav">
          <router-link to="/marketplace" class="breadcrumb-link">Marketplace</router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ project.title }}</span>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="project-content">
      <div class="container">
        <div class="content-layout">
          <!-- Project Information (Left Column) -->
          <div class="project-info">
            <!-- Project Image -->
            <div class="project-image-container">
              <img :src="project.image" :alt="project.title" class="project-image" />
              <div class="category-badge" :class="project.category.toLowerCase().replace(' ', '-')">
                {{ project.category }}
              </div>
            </div>

            <!-- Project Header -->
            <div class="project-header">
              <h1 class="project-title">{{ project.title }}</h1>
              <div class="project-meta">
                <div class="meta-item">
                  <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  <span>{{ project.country }}</span>
                </div>
                <div class="meta-item">
                  <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span>Vintage {{ project.year }}</span>
                </div>
                <div class="meta-item">
                  <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    ></path>
                  </svg>
                  <span>{{ project.tonnes.toLocaleString() }} tonnes available</span>
                </div>
                <div class="meta-item">
                  <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    ></path>
                  </svg>
                  <span>{{ project.verifier }}</span>
                </div>
              </div>
            </div>

            <!-- UN Sustainable Development Goals -->
            <div class="sdg-section">
              <h3 class="sdg-title">UN Sustainable Development Goals</h3>
              <div class="sdg-badges">
                <div
                  v-for="(sdg, index) in project.sdgs"
                  :key="index"
                  class="sdg-badge"
                  :style="{ backgroundColor: sdg.color }"
                >
                  {{ sdg.number }}
                </div>
              </div>
            </div>

            <!-- Information Tabs -->
            <div class="tabs-section">
              <div class="tabs-header">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  :class="['tab-button', { active: activeTab === tab.id }]"
                  @click="activeTab = tab.id"
                >
                  {{ tab.label }}
                </button>
              </div>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Summary Tab -->
                <div v-if="activeTab === 'summary'" class="tab-panel">
                  <div class="project-overview">
                    <h3 class="section-title">Project Overview</h3>
                    <p class="overview-text">{{ project.overview }}</p>
                  </div>

                  <div class="impact-metrics">
                    <h3 class="section-title">Impact Metrics</h3>
                    <div class="metrics-grid">
                      <div
                        v-for="(metric, index) in project.impactMetrics"
                        :key="index"
                        class="metric-card"
                      >
                        <div class="metric-icon" :style="{ backgroundColor: metric.color }">
                          <span class="icon-emoji">{{ metric.icon }}</span>
                        </div>
                        <div class="metric-content">
                          <h4 class="metric-title">{{ metric.title }}</h4>
                          <p class="metric-description">{{ metric.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Details Tab -->
                <div v-if="activeTab === 'details'" class="tab-panel">
                  <div class="details-content">
                    <h3 class="section-title">Project Details</h3>
                    <div class="details-grid">
                      <div v-for="(detail, key) in project.details" :key="key" class="detail-row">
                        <span class="detail-label">{{ formatLabel(key) }}:</span>
                        <span class="detail-value">{{ detail }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Documents Tab -->
                <div v-if="activeTab === 'documents'" class="tab-panel">
                  <div class="documents-content">
                    <h3 class="section-title">Project Documents</h3>
                    <div class="documents-list">
                      <div
                        v-for="(doc, index) in project.documents"
                        :key="index"
                        class="document-item"
                      >
                        <div class="document-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            ></path>
                          </svg>
                        </div>
                        <div class="document-info">
                          <span class="document-name">{{ doc.name }}</span>
                          <span class="document-type">{{ doc.type }}</span>
                        </div>
                        <button class="download-button">Download</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Purchase Section (Right Column) -->
          <div class="purchase-section">
            <!-- Purchase Credits -->
            <div class="purchase-card">
              <div class="price-display">
                <span class="price">${{ project.price }}</span>
                <span class="price-unit">per tonne</span>
              </div>

              <div class="quantity-section">
                <label class="quantity-label">Quantity (tonnes)</label>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  :max="project.tonnes"
                  class="quantity-input"
                  @input="updateQuantity"
                />
                <div class="max-available">
                  Max available: {{ project.tonnes.toLocaleString() }} tonnes
                </div>
              </div>

              <div class="cost-breakdown">
                <div class="cost-row">
                  <span class="cost-label">Subtotal:</span>
                  <span class="cost-value">${{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="cost-row">
                  <span class="cost-label">Registry fee:</span>
                  <span class="cost-value">${{ registryFee.toFixed(2) }}</span>
                </div>
                <div class="cost-row total">
                  <span class="cost-label">Total:</span>
                  <span class="cost-value">${{ total.toFixed(2) }}</span>
                </div>
              </div>

              <div class="action-buttons">
                <button class="add-to-cart-button" @click="addToCart">
                  <svg class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    ></path>
                  </svg>
                  Add to Cart
                </button>
                <button class="retire-button" @click="retireCarbon">Retire Carbon</button>
              </div>
            </div>

            <!-- Project Stats -->
            <div class="stats-card">
              <h3 class="stats-title">Project Stats</h3>
              <div class="stats-list">
                <div class="stat-item">
                  <span class="stat-label">Total Credits Issued:</span>
                  <span class="stat-value">{{ project.stats.totalIssued.toLocaleString() }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Credits Retired:</span>
                  <span class="stat-value">{{ project.stats.retired.toLocaleString() }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Available:</span>
                  <span class="stat-value">{{ project.stats.available.toLocaleString() }}</span>
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
  name: 'ProjectDetailView',
  data() {
    return {
      activeTab: 'summary',
      quantity: 10,
      registryFee: 5.0,
      tabs: [
        { id: 'summary', label: 'Summary' },
        { id: 'details', label: 'Details' },
        { id: 'documents', label: 'Documents' },
      ],
      project: {
        id: 1,
        title: 'Amazon Rainforest Conservation',
        category: 'Forestry',
        country: 'Brazil',
        price: 32,
        tonnes: 8500,
        year: '2022',
        verifier: 'Amazon Guard',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
        overview:
          'This project protects 25,000 hectares of pristine Amazon rainforest from deforestation while supporting indigenous communities through sustainable forest management practices.',
        sdgs: [
          { number: 13, color: '#10b981' },
          { number: 15, color: '#10b981' },
          { number: 10, color: '#ec4899' },
          { number: 16, color: '#3b82f6' },
        ],
        impactMetrics: [
          {
            title: 'Carbon Impact',
            description: 'Prevents emission of 75,000 tCO2e annually',
            icon: '🌱',
            color: '#10b981',
          },
          {
            title: 'Biodiversity',
            description: 'Protects critical habitat for endangered species',
            icon: '🎯',
            color: '#3b82f6',
          },
          {
            title: 'Community',
            description: 'Supports 300 indigenous families',
            icon: '🏠',
            color: '#f59e0b',
          },
        ],
        details: {
          projectType: 'REDD+ (Reducing Emissions from Deforestation and Forest Degradation)',
          methodology: 'VM0007 REDD+ Methodology Framework',
          projectArea: '25,000 hectares',
          projectDuration: '10 years (2020-2030)',
          certification: 'VCS (Verified Carbon Standard)',
          additionalBenefits:
            'Biodiversity conservation, community development, watershed protection',
        },
        documents: [
          { name: 'Project Design Document', type: 'PDF' },
          { name: 'Verification Report', type: 'PDF' },
          { name: 'Monitoring Report 2022', type: 'PDF' },
          { name: 'Community Impact Assessment', type: 'PDF' },
        ],
        stats: {
          totalIssued: 10200,
          retired: 1700,
          available: 8500,
        },
      },
    }
  },
  computed: {
    subtotal() {
      return this.quantity * this.project.price
    },
    total() {
      return this.subtotal + this.registryFee
    },
  },
  methods: {
    updateQuantity() {
      if (this.quantity > this.project.tonnes) {
        this.quantity = this.project.tonnes
      }
      if (this.quantity < 1) {
        this.quantity = 1
      }
    },
    formatLabel(key) {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
    },
    addToCart() {
      // Add to cart functionality
      console.log('Adding to cart:', {
        project: this.project.title,
        quantity: this.quantity,
        total: this.total,
      })
      alert(
        `Added ${this.quantity} tonnes of ${this.project.title} to cart for $${this.total.toFixed(2)}`,
      )
    },
    retireCarbon() {
      // Retire carbon functionality
      console.log('Retiring carbon:', {
        project: this.project.title,
        quantity: this.quantity,
        total: this.total,
      })
      alert(
        `Retiring ${this.quantity} tonnes of ${this.project.title} for $${this.total.toFixed(2)}`,
      )
    },
  },
  mounted() {
    // Get project ID from route params and load project data
    const projectId = this.$route.params.id
    if (projectId) {
      // In a real app, you would fetch project data based on ID
      console.log('Loading project:', projectId)
    }
  },
}
</script>

<style scoped>
.project-detail {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Breadcrumbs */
.breadcrumbs {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
}

.breadcrumb-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition);
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 500;
}

/* Main Content */
.project-content {
  padding: 2rem 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Project Information */
.project-info {
  min-height: 500px;
}

.project-image-container {
  position: relative;
  margin-bottom: 1.5rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.category-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-badge.forestry {
  background: var(--primary-color);
}

.project-header {
  margin-bottom: 2rem;
}

.project-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}

/* SDG Section */
.sdg-section {
  margin-bottom: 2rem;
}

.sdg-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.sdg-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sdg-badge {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: white;
}

/* Tabs Section */
.tabs-section {
  margin-bottom: 2rem;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: var(--text-primary);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-content {
  min-height: 300px;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.overview-text {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.impact-metrics {
  margin-top: 2rem;
}

.metrics-grid {
  display: grid;
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.metric-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 1.5rem;
}

.metric-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.metric-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Details Tab */
.details-grid {
  display: grid;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);
}

.detail-label {
  font-weight: 500;
  color: var(--text-primary);
}

.detail-value {
  color: var(--text-secondary);
  text-align: right;
  max-width: 60%;
}

/* Documents Tab */
.documents-list {
  display: grid;
  gap: 1rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.document-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.document-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-muted);
}

.document-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.document-name {
  font-weight: 500;
  color: var(--text-primary);
}

.document-type {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.download-button {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.download-button:hover {
  background: var(--primary-hover);
}

/* Purchase Section */
.purchase-section {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.purchase-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
}

.price-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.price {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--primary-color);
}

.price-unit {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.quantity-section {
  margin-bottom: 1.5rem;
}

.quantity-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.quantity-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  outline: none;
  transition: var(--transition);
}

.quantity-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(6, 158, 45, 0.1);
}

.max-available {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.cost-breakdown {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.cost-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.cost-row.total {
  font-weight: 600;
  color: var(--text-primary);
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.cost-label {
  color: var(--text-secondary);
}

.cost-value {
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.add-to-cart-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.add-to-cart-button:hover {
  background: var(--primary-hover);
}

.button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.retire-button {
  padding: 0.875rem;
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.retire-button:hover {
  background: var(--primary-color);
  color: white;
}

/* Stats Card */
.stats-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.stats-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.stats-list {
  display: grid;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .purchase-section {
    position: static;
  }

  .project-meta {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 768px) {
  .project-content {
    padding: 1.5rem 0;
  }

  .project-title {
    font-size: var(--font-size-3xl);
  }

  .project-image {
    height: 250px;
  }

  .tabs-header {
    flex-direction: column;
  }

  .tab-button {
    text-align: left;
    border-bottom: none;
    border-left: 2px solid transparent;
  }

  .tab-button.active {
    border-bottom-color: transparent;
    border-left-color: var(--primary-color);
  }
}
</style>

