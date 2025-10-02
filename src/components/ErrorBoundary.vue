<script setup>
import { ref, onErrorCaptured, provide } from 'vue'
import { useErrorStore } from '@/store/errorStore'
import ErrorNotification from '@/components/ui/ErrorNotification.vue'

const errorStore = useErrorStore()
const hasError = ref(false)
const error = ref(null)

onErrorCaptured((err, instance, info) => {
  console.error('Error captured by boundary:', err, info)

  hasError.value = true
  error.value = err

  // Show error notification
  errorStore.handleApiError(err, 'ErrorBoundary')

  // Prevent error from propagating
  return false
})

function resetError() {
  hasError.value = false
  error.value = null
}

// Provide error handling to child components
provide('errorHandler', {
  handleError: errorStore.handleApiError,
  showError: errorStore.showError,
  showWarning: errorStore.showWarning,
  showInfo: errorStore.showInfo,
})
</script>

<template>
  <div class="error-boundary">
    <!-- Global Error Notifications -->
    <div class="error-notifications">
      <ErrorNotification
        v-for="notification in errorStore.notifications"
        :key="notification.id"
        :error="notification.error"
        :duration="notification.duration"
        :closable="notification.closable"
        @close="errorStore.removeNotification(notification.id)"
      />
    </div>

    <!-- Error Fallback UI -->
    <div v-if="hasError" class="error-fallback">
      <div class="error-fallback-content">
        <div class="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
        <div class="error-actions">
          <button @click="resetError" class="btn btn-primary">Try Again</button>
          <button @click="window.location.reload()" class="btn btn-outline">Refresh Page</button>
        </div>
        <details v-if="error" class="error-details">
          <summary>Technical Details</summary>
          <pre>{{ error.stack }}</pre>
        </details>
      </div>
    </div>

    <!-- Normal Content -->
    <slot v-else />
  </div>
</template>

<style scoped>
.error-boundary {
  position: relative;
  min-height: 100vh;
}

.error-notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #f9fafb;
}

.error-fallback-content {
  text-align: center;
  max-width: 500px;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-fallback h2 {
  color: #374151;
  margin-bottom: 1rem;
}

.error-fallback p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.error-details {
  text-align: left;
  margin-top: 1rem;
}

.error-details summary {
  cursor: pointer;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.error-details pre {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.75rem;
  overflow-x: auto;
  color: #374151;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
}

@media (max-width: 640px) {
  .error-actions {
    flex-direction: column;
  }

  .error-notifications {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }
}
</style>
