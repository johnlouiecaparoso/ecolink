<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <div class="ui-input">
    <label v-if="label" :for="id">{{ label }}</label>
    <input :id="id" :type="type" :placeholder="placeholder" :value="modelValue" @input="onInput" />
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
  padding: 14px 14px;
  border-radius: 12px;
  border: 1px solid var(--ecolink-border);
  background: #fff;
  outline: none;
  transition:
    box-shadow 160ms ease,
    border-color 160ms ease;
}
.ui-input input:focus {
  border-color: var(--ecolink-primary-500);
  box-shadow: 0 0 0 4px rgba(6, 158, 45, 0.12);
}
.error {
  color: #b00020;
  font-weight: 600;
}
</style>
