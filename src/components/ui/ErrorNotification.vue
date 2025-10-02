<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  error: { type: [String, Object], required: true },
  duration: { type: Number, default: 5000 },
  closable: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

const isVisible = ref(false)
const timeoutId = ref(null)

onMounted(() => {
  isVisible.value = true

  if (props.duration > 0) {
    timeoutId.value = setTimeout(() => {
      close()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId.value) {
    clearTimeout(timeoutId.value)
  }
})

function close() {
  isVisible.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // Wait for animation
}

function getErrorMessage() {
  if (typeof props.error === 'string') {
    return props.error
  }

  if (props.error?.message) {
    return props.error.message
  }

  return 'An error occurred'
}

function getErrorType() {
  if (typeof props.error === 'object' && props.error?.code) {
    const code = props.error.code.toLowerCase()

    if (code.includes('auth') || code.includes('session')) {
      return 'warning'
    }

    if (code.includes('network') || code.includes('timeout')) {
      return 'info'
    }

    if (code.includes('server') || code.includes('database')) {
      return 'error'
    }
  }

  return 'error'
}
</script>

<template>
  <Transition name="error-slide">
    <div v-if="isVisible" :class="['error-notification', `error-notification--${getErrorType()}`]">
      <div class="error-content">
        <div class="error-icon">
          <span v-if="getErrorType() === 'error'">⚠️</span>
          <span v-else-if="getErrorType() === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>

        <div class="error-message">
          <h4 class="error-title">
            {{
              getErrorType() === 'error'
                ? 'Error'
                : getErrorType() === 'warning'
                  ? 'Warning'
                  : 'Notice'
            }}
          </h4>
          <p>{{ getErrorMessage() }}</p>
        </div>

        <button v-if="closable" @click="close" class="error-close" aria-label="Close">✕</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.error-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.error-notification--error {
  border-left: 4px solid #dc2626;
}

.error-notification--warning {
  border-left: 4px solid #f59e0b;
}

.error-notification--info {
  border-left: 4px solid #3b82f6;
}

.error-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.error-message {
  flex: 1;
}

.error-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #374151;
}

.error-message p {
  font-size: 0.875rem;
  margin: 0;
  color: #6b7280;
  line-height: 1.4;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.125rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  flex-shrink: 0;
  transition: color 0.2s;
}

.error-close:hover {
  color: #374151;
}

/* Animations */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s ease;
}

.error-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.error-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 640px) {
  .error-notification {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
}
</style>
