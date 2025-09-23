<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'input', 'blur'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
  emit('input', e)
}

function onBlur(e) {
  emit('blur', e)
}
</script>

<template>
  <div class="ui-input">
    <label v-if="label" :for="id">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      @blur="onBlur"
    />
    <small v-if="error" class="error">{{ error }}</small>
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
  padding: 0.875rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  outline: none;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  transition: var(--transition);
}
.ui-input input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(6, 158, 45, 0.1);
}
.error {
  color: #b00020;
  font-weight: 600;
}
</style>
