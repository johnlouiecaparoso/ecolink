<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { focusManager, ariaUtils, keyboardNavigation } from '@/utils/accessibility'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  closeOnEscape: { type: Boolean, default: true },
  closeOnOverlay: { type: Boolean, default: true },
  trapFocus: { type: Boolean, default: true },
})

const emit = defineEmits(['close', 'open'])

const modalRef = ref(null)
const previousFocus = ref(null)
let cleanupFocusTrap = null

// Focus management
onMounted(() => {
  if (props.isOpen) {
    openModal()
  }
})

onUnmounted(() => {
  if (cleanupFocusTrap) {
    cleanupFocusTrap()
  }
})

function openModal() {
  // Store current focus
  previousFocus.value = focusManager.storeFocus()

  // Focus the modal
  nextTick(() => {
    if (modalRef.value) {
      focusManager.focusFirst(modalRef.value)

      // Set up focus trap
      if (props.trapFocus) {
        cleanupFocusTrap = focusManager.trapFocus(modalRef.value)
      }

      // Set ARIA attributes
      ariaUtils.setAttributes(modalRef.value, {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'modal-title',
        'aria-describedby': props.description ? 'modal-description' : null,
      })
    }
  })

  emit('open')
}

function closeModal() {
  // Restore previous focus
  if (previousFocus.value) {
    focusManager.restoreFocus(previousFocus.value)
  }

  // Clean up focus trap
  if (cleanupFocusTrap) {
    cleanupFocusTrap()
    cleanupFocusTrap = null
  }

  emit('close')
}

function handleKeydown(e) {
  // Close on Escape
  if (props.closeOnEscape) {
    keyboardNavigation.handleEscape(e, closeModal)
  }
}

function handleOverlayClick(e) {
  if (props.closeOnOverlay && e.target === modalRef.value) {
    closeModal()
  }
}

// Watch for open/close changes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      openModal()
    } else {
      closeModal()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        ref="modalRef"
        class="modal-overlay"
        @keydown="handleKeydown"
        @click="handleOverlayClick"
        tabindex="-1"
      >
        <div class="modal-content" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">{{ title }}</h2>
            <button class="modal-close" @click="closeModal" aria-label="Close modal" type="button">
              ✕
            </button>
          </div>

          <div v-if="description" id="modal-description" class="modal-description">
            {{ description }}
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  outline: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #374151;
}

.modal-close:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.modal-description {
  padding: 0 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Focus styles */
.modal-content:focus {
  outline: none;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
