<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | outline | ghost | success | warning | error
  size: { type: String, default: 'md' }, // sm | md | lg | xl
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  icon: { type: String, default: '' },
  iconPosition: { type: String, default: 'left' }, // left | right
  // Accessibility props
  ariaLabel: { type: String, default: '' },
  ariaDescribedby: { type: String, default: '' },
  ariaPressed: { type: [Boolean, String], default: undefined },
  ariaExpanded: { type: [Boolean, String], default: undefined },
  ariaControls: { type: String, default: '' },
})

const emit = defineEmits(['click'])

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const classes = computed(() => [
  'ui-btn',
  `ui-btn--${props.variant}`,
  `ui-btn--${props.size}`,
  props.block && 'ui-btn--block',
  props.loading && 'ui-btn--loading',
])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedby"
    :aria-pressed="ariaPressed"
    :aria-expanded="ariaExpanded"
    :aria-controls="ariaControls"
    @click="handleClick"
  >
    <div v-if="loading" class="loading-spinner" aria-hidden="true"></div>
    <span
      v-if="icon"
      class="button-icon"
      :class="{ 'icon-left': iconPosition === 'left', 'icon-right': iconPosition === 'right' }"
    >
      {{ icon }}
    </span>
    <slot />
  </button>
</template>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 0.75rem var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.ui-btn:active {
  transform: translateY(1px);
}
.ui-btn--block {
  width: 100%;
}

/* Sizes */
.ui-btn--sm {
  padding: 8px 12px;
  font-size: 14px;
}
.ui-btn--md {
  padding: 12px 16px;
  font-size: 15px;
}
.ui-btn--lg {
  padding: 14px 18px;
  font-size: 16px;
}

/* Variants */
.ui-btn--primary {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-md);
}
.ui-btn--primary:hover {
  background: var(--primary-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.ui-btn--outline {
  background: var(--bg-primary);
  color: var(--primary-color);
  border-color: var(--primary-color);
}
.ui-btn--outline:hover {
  background: var(--primary-light);
}

.ui-btn--ghost {
  background: transparent;
  color: var(--primary-color);
}
.ui-btn--ghost:hover {
  background: var(--primary-light);
}

button[disabled] {
  opacity: 0.75;
  cursor: not-allowed;
  filter: grayscale(20%);
}

/* Loading State */
.ui-btn--loading {
  position: relative;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
