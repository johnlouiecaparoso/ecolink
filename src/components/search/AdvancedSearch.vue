<script setup>
import { ref, computed, watch } from 'vue'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  countries: { type: Array, default: () => [] },
  verificationStandards: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

// Search state
const searchQuery = ref(props.modelValue.query || '')
const selectedCategory = ref(props.modelValue.category || '')
const selectedCountry = ref(props.modelValue.country || '')
const selectedStandard = ref(props.modelValue.standard || '')
const priceRange = ref({
  min: props.modelValue.priceMin || '',
  max: props.modelValue.priceMax || '',
})
const vintageYear = ref(props.modelValue.vintageYear || '')
const sortBy = ref(props.modelValue.sortBy || 'relevance')
const sortOrder = ref(props.modelValue.sortOrder || 'desc')

// Computed search filters
const searchFilters = computed(() => ({
  query: searchQuery.value,
  category: selectedCategory.value,
  country: selectedCountry.value,
  standard: selectedStandard.value,
  priceMin: priceRange.value.min,
  priceMax: priceRange.value.max,
  vintageYear: vintageYear.value,
  sortBy: sortBy.value,
  sortOrder: sortOrder.value,
}))

// Watch for changes and emit updates
watch(
  searchFilters,
  (newFilters) => {
    emit('update:modelValue', newFilters)
  },
  { deep: true },
)

function handleSearch() {
  emit('search', searchFilters.value)
}

function handleReset() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedCountry.value = ''
  selectedStandard.value = ''
  priceRange.value = { min: '', max: '' }
  vintageYear.value = ''
  sortBy.value = 'relevance'
  sortOrder.value = 'desc'
  emit('reset')
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'vintage', label: 'Vintage Year' },
  { value: 'quantity', label: 'Available Quantity' },
  { value: 'listed', label: 'Listed Date' },
]
</script>

<template>
  <div class="advanced-search">
    <div class="search-header">
      <h3 class="search-title">Advanced Search</h3>
      <UiButton variant="ghost" size="sm" @click="handleReset"> Reset Filters </UiButton>
    </div>

    <form @submit.prevent="handleSearch" class="search-form">
      <!-- Search Query -->
      <div class="search-section">
        <UiInput
          v-model="searchQuery"
          label="Search Projects"
          placeholder="Enter project name, description, or keywords..."
          id="search-query"
          aria-label="Search for carbon credit projects"
        />
      </div>

      <!-- Filters Grid -->
      <div class="filters-grid">
        <!-- Category Filter -->
        <div class="filter-group">
          <label for="category-filter" class="filter-label">Category</label>
          <select
            id="category-filter"
            v-model="selectedCategory"
            class="filter-select"
            aria-label="Filter by project category"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.value" :value="category.value">
              {{ category.label }}
            </option>
          </select>
        </div>

        <!-- Country Filter -->
        <div class="filter-group">
          <label for="country-filter" class="filter-label">Country</label>
          <select
            id="country-filter"
            v-model="selectedCountry"
            class="filter-select"
            aria-label="Filter by country"
          >
            <option value="">All Countries</option>
            <option v-for="country in countries" :key="country.value" :value="country.value">
              {{ country.label }}
            </option>
          </select>
        </div>

        <!-- Verification Standard Filter -->
        <div class="filter-group">
          <label for="standard-filter" class="filter-label">Verification Standard</label>
          <select
            id="standard-filter"
            v-model="selectedStandard"
            class="filter-select"
            aria-label="Filter by verification standard"
          >
            <option value="">All Standards</option>
            <option
              v-for="standard in verificationStandards"
              :key="standard.value"
              :value="standard.value"
            >
              {{ standard.label }}
            </option>
          </select>
        </div>

        <!-- Vintage Year Filter -->
        <div class="filter-group">
          <label for="vintage-filter" class="filter-label">Vintage Year</label>
          <input
            id="vintage-filter"
            v-model="vintageYear"
            type="number"
            min="2000"
            :max="new Date().getFullYear()"
            placeholder="e.g., 2024"
            class="filter-input"
            aria-label="Filter by vintage year"
          />
        </div>
      </div>

      <!-- Price Range -->
      <div class="price-range-section">
        <h4 class="section-title">Price Range (USD per credit)</h4>
        <div class="price-inputs">
          <UiInput
            v-model="priceRange.min"
            label="Minimum Price"
            type="number"
            placeholder="0.00"
            id="price-min"
            aria-label="Minimum price per credit"
          />
          <UiInput
            v-model="priceRange.max"
            label="Maximum Price"
            type="number"
            placeholder="100.00"
            id="price-max"
            aria-label="Maximum price per credit"
          />
        </div>
      </div>

      <!-- Sorting -->
      <div class="sorting-section">
        <h4 class="section-title">Sort By</h4>
        <div class="sort-controls">
          <select v-model="sortBy" class="sort-select" aria-label="Sort results by">
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <UiButton
            type="button"
            variant="outline"
            size="sm"
            @click="toggleSortOrder"
            :aria-label="`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`"
          >
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </UiButton>
        </div>
      </div>

      <!-- Search Actions -->
      <div class="search-actions">
        <UiButton type="submit" variant="primary" :loading="false"> Search Projects </UiButton>
        <UiButton type="button" variant="outline" @click="handleReset"> Clear All </UiButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.advanced-search {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-section {
  width: 100%;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.price-range-section,
.sorting-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.price-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.sort-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sort-select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.search-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .price-inputs {
    grid-template-columns: 1fr;
  }

  .search-actions {
    flex-direction: column;
  }
}
</style>
