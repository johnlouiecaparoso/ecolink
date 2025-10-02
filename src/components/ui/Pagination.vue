<script setup>
import { computed } from 'vue'
import UiButton from '@/components/ui/Button.vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, default: 0 },
  itemsPerPage: { type: Number, default: 10 },
  showInfo: { type: Boolean, default: true },
  maxVisiblePages: { type: Number, default: 5 },
})

const emit = defineEmits(['update:currentPage', 'pageChange'])

const pageInfo = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage + 1
  const end = Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
  return { start, end }
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = props.maxVisiblePages
  const current = props.currentPage
  const total = props.totalPages

  if (total <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Calculate start and end of visible range
    let start = Math.max(1, current - Math.floor(maxVisible / 2))
    let end = Math.min(total, start + maxVisible - 1)

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis and last page if needed
    if (end < total) {
      if (end < total - 1) {
        pages.push('...')
      }
      pages.push(total)
    }
  }

  return pages
})

const canGoPrevious = computed(() => props.currentPage > 1)
const canGoNext = computed(() => props.currentPage < props.totalPages)

function goToPage(page) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('pageChange', page)
  }
}

function goToPrevious() {
  if (canGoPrevious.value) {
    goToPage(props.currentPage - 1)
  }
}

function goToNext() {
  if (canGoNext.value) {
    goToPage(props.currentPage + 1)
  }
}

function goToFirst() {
  goToPage(1)
}

function goToLast() {
  goToPage(props.totalPages)
}
</script>

<template>
  <div class="pagination" role="navigation" aria-label="Pagination Navigation">
    <!-- Page Info -->
    <div v-if="showInfo && totalItems > 0" class="pagination-info">
      Showing {{ pageInfo.start }}-{{ pageInfo.end }} of {{ totalItems }} results
    </div>

    <!-- Pagination Controls -->
    <div class="pagination-controls">
      <!-- First Page -->
      <UiButton
        variant="outline"
        size="sm"
        :disabled="!canGoPrevious"
        @click="goToFirst"
        aria-label="Go to first page"
      >
        ««
      </UiButton>

      <!-- Previous Page -->
      <UiButton
        variant="outline"
        size="sm"
        :disabled="!canGoPrevious"
        @click="goToPrevious"
        aria-label="Go to previous page"
      >
        ‹
      </UiButton>

      <!-- Page Numbers -->
      <div class="page-numbers">
        <template v-for="page in visiblePages" :key="page">
          <UiButton
            v-if="page !== '...'"
            :variant="page === currentPage ? 'primary' : 'outline'"
            size="sm"
            @click="goToPage(page)"
            :aria-label="`Go to page ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
          >
            {{ page }}
          </UiButton>
          <span v-else class="ellipsis" aria-hidden="true">…</span>
        </template>
      </div>

      <!-- Next Page -->
      <UiButton
        variant="outline"
        size="sm"
        :disabled="!canGoNext"
        @click="goToNext"
        aria-label="Go to next page"
      >
        ›
      </UiButton>

      <!-- Last Page -->
      <UiButton
        variant="outline"
        size="sm"
        :disabled="!canGoNext"
        @click="goToLast"
        aria-label="Go to last page"
      >
        »»
      </UiButton>
    </div>

    <!-- Quick Jump -->
    <div v-if="totalPages > 10" class="quick-jump">
      <label for="jump-to-page" class="jump-label">Go to:</label>
      <input
        id="jump-to-page"
        type="number"
        :min="1"
        :max="totalPages"
        :value="currentPage"
        @change="goToPage(parseInt($event.target.value))"
        class="jump-input"
        aria-label="Jump to page number"
      />
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 0.5rem;
}

.ellipsis {
  padding: 0.5rem;
  color: #6b7280;
  font-weight: 500;
}

.quick-jump {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.jump-label {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.jump-input {
  width: 4rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
}

.jump-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Responsive */
@media (max-width: 640px) {
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .page-numbers {
    margin: 0.5rem 0;
  }

  .quick-jump {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
