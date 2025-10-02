<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  content: { type: String, required: true },
  position: { type: String, default: 'top' }, // top, bottom, left, right
  trigger: { type: String, default: 'hover' }, // hover, click, focus
  disabled: { type: Boolean, default: false },
})

const isVisible = ref(false)
const tooltipRef = ref(null)
const triggerRef = ref(null)

const positionClasses = computed(() => [
  'tooltip',
  `tooltip--${props.position}`,
  isVisible.value && 'tooltip--visible',
])

function show() {
  if (props.disabled) return
  isVisible.value = true
}

function hide() {
  isVisible.value = false
}

function toggle() {
  if (props.disabled) return
  isVisible.value = !isVisible.value
}

function handleMouseEnter() {
  if (props.trigger === 'hover') show()
}

function handleMouseLeave() {
  if (props.trigger === 'hover') hide()
}

function handleClick() {
  if (props.trigger === 'click') toggle()
}

function handleFocus() {
  if (props.trigger === 'focus') show()
}

function handleBlur() {
  if (props.trigger === 'focus') hide()
}

onMounted(() => {
  if (triggerRef.value) {
    triggerRef.value.addEventListener('mouseenter', handleMouseEnter)
    triggerRef.value.addEventListener('mouseleave', handleMouseLeave)
    triggerRef.value.addEventListener('click', handleClick)
    triggerRef.value.addEventListener('focus', handleFocus)
    triggerRef.value.addEventListener('blur', handleBlur)
  }
})

onUnmounted(() => {
  if (triggerRef.value) {
    triggerRef.value.removeEventListener('mouseenter', handleMouseEnter)
    triggerRef.value.removeEventListener('mouseleave', handleMouseLeave)
    triggerRef.value.removeEventListener('click', handleClick)
    triggerRef.value.removeEventListener('focus', handleFocus)
    triggerRef.value.removeEventListener('blur', handleBlur)
  }
})
</script>

<template>
  <div class="tooltip-container" ref="triggerRef">
    <slot />
    <div v-if="isVisible" :class="positionClasses" ref="tooltipRef">
      <div class="tooltip-content">
        {{ content }}
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  </div>
</template>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  z-index: 1000;
  padding: 0.5rem 0.75rem;
  background: #1f2937;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s,
    visibility 0.2s;
  pointer-events: none;
}

.tooltip--visible {
  opacity: 1;
  visibility: visible;
}

.tooltip--top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
}

.tooltip--bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
}

.tooltip--left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 0.5rem;
}

.tooltip--right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 0.5rem;
}

.tooltip-content {
  position: relative;
  z-index: 1;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 4px solid transparent;
}

.tooltip--top .tooltip-arrow {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: #1f2937;
}

.tooltip--bottom .tooltip-arrow {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: #1f2937;
}

.tooltip--left .tooltip-arrow {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: #1f2937;
}

.tooltip--right .tooltip-arrow {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: #1f2937;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .tooltip {
    max-width: 200px;
    white-space: normal;
    text-align: center;
  }
}
</style>
