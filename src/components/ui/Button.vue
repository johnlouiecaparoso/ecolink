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
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 160ms ease,
    background 160ms ease,
    color 160ms ease,
    border-color 160ms ease;
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
  background: linear-gradient(180deg, var(--ecolink-primary-500), var(--ecolink-primary-700));
  color: #fff;
  box-shadow: var(--shadow-md);
}
.ui-btn--primary:hover {
  filter: brightness(1.02);
}

.ui-btn--outline {
  background: #fff;
  color: var(--ecolink-primary-700);
  border-color: var(--ecolink-primary-500);
}
.ui-btn--outline:hover {
  background: rgba(6, 158, 45, 0.06);
}

.ui-btn--ghost {
  background: transparent;
  color: var(--ecolink-primary-700);
}
.ui-btn--ghost:hover {
  background: rgba(6, 158, 45, 0.06);
}

button[disabled] {
  opacity: 0.75;
  cursor: not-allowed;
  filter: grayscale(20%);
}
</style>
