<template>
  <div class="marketplace">
    <!-- Header Section -->
    <div class="marketplace-header">
      <div class="container">
        <h1 class="page-title">Carbon Credit Marketplace</h1>
        <p class="page-description">
          Discover and purchase verified carbon credits from projects worldwide
        </p>

        <!-- Main Search Bar -->
        <div class="main-search">
          <div class="search-wrapper">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <input
              v-model="searchQuery"
              placeholder="Search projects..."
              class="search-input"
              @input="handleSearch"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="marketplace-content">
      <div class="container">
        <div class="content-layout">
          <!-- Filters Sidebar -->
          <div class="filters-sidebar">
            <div class="filters-card">
              <h3 class="filters-title">Filters</h3>

              <!-- Category Filter -->
              <div class="filter-section">
                <h4 class="filter-label">Category</h4>
                <div class="filter-options">
                  <label v-for="category in categories" :key="category.value" class="filter-option">
                    <input
                      type="radio"
                      :value="category.value"
                      v-model="selectedCategory"
                      @change="applyFilters"
                      class="filter-radio"
                    />
                    <span class="filter-text">{{ category.label }}</span>
                    <span v-if="category.value === selectedCategory" class="checkmark">✓</span>
                  </label>
                </div>
              </div>

              <!-- Country Filter -->
              <div class="filter-section">
                <h4 class="filter-label">Country</h4>
                <select v-model="selectedCountry" @change="applyFilters" class="filter-select">
                  <option value="">All</option>
                  <option v-for="country in countries" :key="country" :value="country">
                    {{ country }}
                  </option>
                </select>
              </div>

              <!-- Price Range Filter -->
              <div class="filter-section">
                <h4 class="filter-label">Price Range ($)</h4>
                <div class="price-range">
                  <input
                    v-model.number="priceRange.min"
                    type="number"
                    placeholder="Min"
                    class="price-input"
                    @input="applyFilters"
                  />
                  <input
                    v-model.number="priceRange.max"
                    type="number"
                    placeholder="Max"
                    class="price-input"
                    @input="applyFilters"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Projects Content -->
          <div class="projects-content">
            <!-- Results Header -->
            <div class="results-header">
              <div class="results-info">
                <span class="results-count">Showing {{ filteredProjects.length }} projects</span>
              </div>
              <div class="sort-dropdown">
                <select v-model="sortBy" @change="applySorting" class="sort-select">
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="tonnes">Tonnes Available</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>

            <!-- Projects Grid -->
            <div class="projects-grid">
              <div v-for="project in filteredProjects" :key="project.id" class="project-card">
                <div class="project-image">
                  <img :src="project.image" :alt="project.title" />
                  <div
                    class="category-badge"
                    :class="project.category.toLowerCase().replace(' ', '-')"
                  >
                    {{ project.category }}
                  </div>
                </div>

                <div class="project-content">
                  <h3 class="project-title">{{ project.title }}</h3>
                  <div class="project-price">
                    <span class="price">${{ project.price }}</span>
                    <span class="price-unit">per tonne</span>
                  </div>
                  <p class="project-description">{{ project.description }}</p>

                  <div class="project-details">
                    <div class="detail-item">
                      <svg
                        class="detail-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                    <div class="detail-item">
                      <svg
                        class="detail-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        ></path>
                      </svg>
                      <span>{{ project.tonnes.toLocaleString() }} tonnes</span>
                    </div>
                    <div class="detail-item">
                      <svg
                        class="detail-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span>{{ project.year }}</span>
                    </div>
                  </div>

                  <div class="project-metrics">
                    <div
                      v-for="(metric, index) in project.metrics"
                      :key="index"
                      class="metric-badge"
                      :style="{ backgroundColor: metric.color }"
                    >
                      {{ metric.value }}
                    </div>
                  </div>

                  <button class="learn-more-button" @click="viewProject(project)">
                    Learn More
                  </button>
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
  name: 'MarketplaceView',
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'all',
      selectedCountry: '',
      priceRange: {
        min: null,
        max: null,
      },
      sortBy: 'name',
      categories: [
        { value: 'all', label: 'All' },
        { value: 'forestry', label: 'Forestry' },
        { value: 'renewable-energy', label: 'Renewable Energy' },
        { value: 'blue-carbon', label: 'Blue Carbon' },
        { value: 'energy-efficiency', label: 'Energy Efficiency' },
      ],
      countries: [
        'Brazil',
        'Paraguay',
        'Kenya',
        'India',
        'Indonesia',
        'Costa Rica',
        'Peru',
        'Colombia',
      ],
      projects: [
        {
          id: 1,
          title: 'Amazon Rainforest Conservation',
          category: 'Forestry',
          country: 'Brazil',
          price: 32,
          tonnes: 8500,
          year: '2022',
          description:
            'Protecting 10,000 hectares of pristine Amazon rainforest from deforestation through community-based conservation programs.',
          image:
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop',
          metrics: [
            { value: 13, color: '#10b981' },
            { value: 15, color: '#ef4444' },
            { value: 10, color: '#f59e0b' },
            { value: 16, color: '#3b82f6' },
          ],
        },
        {
          id: 2,
          title: 'Forestal Rio Aquidabán',
          category: 'Forestry',
          country: 'Paraguay',
          price: 24,
          tonnes: 15000,
          year: '2023',
          description:
            'Sustainable forest management project in the Chaco region, promoting biodiversity and carbon sequestration.',
          image:
            'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=250&fit=crop',
          metrics: [
            { value: 13, color: '#10b981' },
            { value: 15, color: '#ef4444' },
            { value: 8, color: '#f59e0b' },
            { value: 1, color: '#3b82f6' },
          ],
        },
        {
          id: 3,
          title: 'Geothermal Energy Kenya',
          category: 'Renewable Energy',
          country: 'Kenya',
          price: 21,
          tonnes: 16800,
          year: '2024',
          description:
            'Clean geothermal energy project providing renewable electricity to rural communities in Kenya.',
          image:
            'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=250&fit=crop',
          metrics: [
            { value: 7, color: '#10b981' },
            { value: 13, color: '#ef4444' },
            { value: 8, color: '#f59e0b' },
            { value: 9, color: '#3b82f6' },
          ],
        },
        {
          id: 4,
          title: 'Solar Farm Development',
          category: 'Renewable Energy',
          country: 'India',
          price: 18,
          tonnes: 12000,
          year: '2023',
          description:
            'Large-scale solar farm replacing coal-fired power generation in rural India.',
          image:
            'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop',
          metrics: [
            { value: 12, color: '#10b981' },
            { value: 8, color: '#ef4444' },
            { value: 14, color: '#f59e0b' },
            { value: 11, color: '#3b82f6' },
          ],
        },
        {
          id: 5,
          title: 'Mangrove Restoration',
          category: 'Blue Carbon',
          country: 'Indonesia',
          price: 28,
          tonnes: 9500,
          year: '2022',
          description:
            'Coastal mangrove restoration project protecting communities from storms while sequestering carbon.',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop',
          metrics: [
            { value: 9, color: '#10b981' },
            { value: 12, color: '#ef4444' },
            { value: 6, color: '#f59e0b' },
            { value: 13, color: '#3b82f6' },
          ],
        },
        {
          id: 6,
          title: 'Energy Efficiency Program',
          category: 'Energy Efficiency',
          country: 'Costa Rica',
          price: 15,
          tonnes: 22000,
          year: '2024',
          description:
            'Comprehensive energy efficiency program for residential and commercial buildings.',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
          metrics: [
            { value: 11, color: '#10b981' },
            { value: 7, color: '#ef4444' },
            { value: 9, color: '#f59e0b' },
            { value: 8, color: '#3b82f6' },
          ],
        },
      ],
    }
  },
  computed: {
    filteredProjects() {
      let filtered = this.projects

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (project) =>
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            project.country.toLowerCase().includes(query),
        )
      }

      // Category filter
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(
          (project) => project.category.toLowerCase().replace(' ', '-') === this.selectedCategory,
        )
      }

      // Country filter
      if (this.selectedCountry) {
        filtered = filtered.filter((project) => project.country === this.selectedCountry)
      }

      // Price range filter
      if (this.priceRange.min !== null && this.priceRange.min !== '') {
        filtered = filtered.filter((project) => project.price >= this.priceRange.min)
      }
      if (this.priceRange.max !== null && this.priceRange.max !== '') {
        filtered = filtered.filter((project) => project.price <= this.priceRange.max)
      }

      // Apply sorting
      return this.applySorting(filtered)
    },
  },
  methods: {
    handleSearch() {
      // Search is handled by computed property
    },
    applyFilters() {
      // Filters are handled by computed property
    },
    applySorting(projects) {
      const sorted = [...projects]

      switch (this.sortBy) {
        case 'name':
          return sorted.sort((a, b) => a.title.localeCompare(b.title))
        case 'price-low':
          return sorted.sort((a, b) => a.price - b.price)
        case 'price-high':
          return sorted.sort((a, b) => b.price - a.price)
        case 'tonnes':
          return sorted.sort((a, b) => b.tonnes - a.tonnes)
        case 'year':
          return sorted.sort((a, b) => b.year - a.year)
        default:
          return sorted
      }
    },
    viewProject(project) {
      // Navigate to project detail page
      this.$router.push(`/project/${project.id}`)
    },
  },
}
</script>

<style scoped>
.marketplace {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Header Section */
.marketplace-header {
  padding: 2rem 0;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 2rem;
}

.main-search {
  max-width: 32rem;
  margin: 0 auto;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  font-size: var(--font-size-base);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  outline: none;
  transition: var(--transition);
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(6, 158, 45, 0.1);
}

/* Main Content */
.marketplace-content {
  padding: 2rem 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

/* Filters Sidebar */
.filters-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.filters-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.filters-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  display: block;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0;
}

.filter-radio {
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary-color);
}

.filter-text {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.checkmark {
  color: var(--primary-color);
  font-weight: 600;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  outline: none;
}

.price-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.price-input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  outline: none;
}

.price-input:focus {
  border-color: var(--primary-color);
}

/* Projects Content */
.projects-content {
  min-height: 500px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-count {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.project-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.project-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-badge.forestry {
  background: var(--primary-color);
}

.category-badge.renewable-energy {
  background: #3b82f6;
}

.category-badge.blue-carbon {
  background: #06b6d4;
}

.category-badge.energy-efficiency {
  background: #8b5cf6;
}

.project-content {
  padding: 1.5rem;
}

.project-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.project-price {
  margin-bottom: 0.75rem;
}

.price {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
}

.price-unit {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-left: 0.25rem;
}

.project-description {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.detail-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}

.project-metrics {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.metric-badge {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: white;
}

.learn-more-button {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.learn-more-button:hover {
  background: var(--primary-hover);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .filters-sidebar {
    position: static;
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .marketplace-header {
    padding: 1.5rem 0;
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .price-range {
    grid-template-columns: 1fr;
  }
}
</style>
