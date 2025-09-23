<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | outline | ghost
  size: { type: String, default: 'md' }, // sm | md | lg
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const classes = computed(() => [
  'ui-btn',
  `ui-btn--${props.variant}`,
  `ui-btn--${props.size}`,
  props.block && 'ui-btn--block',
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
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
</style>
