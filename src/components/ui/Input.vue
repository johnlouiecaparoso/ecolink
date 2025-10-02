<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  id: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
  prefixIcon: { type: String, default: '' },
  suffixIcon: { type: String, default: '' },
  // Accessibility props
  ariaLabel: { type: String, default: '' },
  ariaDescribedby: { type: String, default: '' },
  ariaRequired: { type: Boolean, default: false },
  ariaInvalid: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus'])

const showPassword = ref(false)

const inputClasses = computed(() => [
  `enhanced-input--${props.size}`,
  props.error && 'enhanced-input--error',
  props.disabled && 'enhanced-input--disabled',
])

const inputFieldClasses = computed(() => [
  'enhanced-input__field',
  props.prefixIcon && 'enhanced-input__field--with-prefix',
  props.suffixIcon && 'enhanced-input__field--with-suffix',
  props.type === 'password' && 'enhanced-input__field--with-toggle',
])

function onInput(e) {
  emit('update:modelValue', e.target.value)
  emit('input', e)
}

function onBlur(e) {
  emit('blur', e)
}

function onFocus(e) {
  emit('focus', e)
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="enhanced-input" :class="inputClasses">
    <label v-if="label" :for="id" class="enhanced-input__label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>

    <div class="enhanced-input__wrapper">
      <span v-if="prefixIcon" class="enhanced-input__prefix-icon">{{ prefixIcon }}</span>

      <input
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :aria-label="ariaLabel"
        :aria-describedby="ariaDescribedby"
        :aria-required="ariaRequired || required"
        :aria-invalid="ariaInvalid || !!error"
        :required="required"
        :disabled="disabled"
        :class="inputFieldClasses"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
      />

      <span v-if="suffixIcon" class="enhanced-input__suffix-icon">{{ suffixIcon }}</span>

      <button
        v-if="type === 'password'"
        type="button"
        class="enhanced-input__toggle-password"
        @click="togglePasswordVisibility"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
      >
        {{ showPassword ? '👁️' : '👁️‍🗨️' }}
      </button>
    </div>

    <div v-if="error || hint" class="enhanced-input__feedback">
      <small v-if="error" class="enhanced-input__error">{{ error }}</small>
      <small v-else-if="hint" class="enhanced-input__hint">{{ hint }}</small>
    </div>
  </div>
</template>

<style scoped>
.ui-input {
  display: grid;
  gap: 8px;
}
.ui-input label {
  font-weight: 600;
  font-size: 14px;
}
.ui-input input {
  width: 100%;
  padding: 16px 24px;
  border-radius: var(--radius-xl, 1rem);
  border: 2px solid var(--primary-color, #069e2d);
  background: var(--bg-primary, #ffffff);
  outline: none;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary, #1a202c);
  transition: all 0.3s ease;
  box-shadow: var(--shadow-green, 0 4px 12px rgba(6, 158, 45, 0.15));
}

.ui-input input:hover {
  border-color: var(--primary-hover, #058e3f);
  box-shadow: var(--shadow-green-lg, 0 8px 20px rgba(6, 158, 45, 0.3));
  transform: translateY(-2px);
}

.ui-input input:focus {
  border-color: var(--primary-hover, #058e3f);
  box-shadow:
    0 0 0 4px var(--primary-light, rgba(6, 158, 45, 0.2)),
    var(--shadow-green-lg, 0 8px 20px rgba(6, 158, 45, 0.3));
  transform: translateY(-2px);
}

.ui-input input::placeholder {
  color: var(--text-muted, #718096);
  font-weight: 400;
  font-style: italic;
}
.error {
  color: #b00020;
  font-weight: 600;
}
</style>
