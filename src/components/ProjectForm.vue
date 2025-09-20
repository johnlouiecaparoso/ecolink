<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/userStore'
import { createProject } from '@/services/projectService'
import UiInput from '@/components/ui/Input.vue'
import UiButton from '@/components/ui/Button.vue'

const emit = defineEmits(['success', 'cancel'])
const store = useUserStore()

const formData = ref({
  title: '',
  location: '',
  methodology: '',
  docs_url: '',
  status: 'draft',
})

const errors = ref({})
const loading = ref(false)

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted for Review' },
]

function validateForm() {
  errors.value = {}

  if (!formData.value.title?.trim()) {
    errors.value.title = 'Project title is required'
  }

  if (!formData.value.location?.trim()) {
    errors.value.location = 'Project location is required'
  }

  if (!formData.value.methodology?.trim()) {
    errors.value.methodology = 'Methodology is required'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  try {
    const projectData = {
      ...formData.value,
      developer_id: store.session?.user?.id,
    }

    await createProject(projectData)
    emit('success')

    // Reset form
    formData.value = {
      title: '',
      location: '',
      methodology: '',
      docs_url: '',
      status: 'draft',
    }
  } catch (error) {
    console.error('Error creating project:', error)
    // You could add a general error message here
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="project-form">
    <div class="form-header">
      <h2 class="form-title">Submit New Project</h2>
      <p class="form-description">Share your climate-positive project with the EcoLink community</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form-grid">
      <UiInput
        id="title"
        label="Project Title *"
        type="text"
        placeholder="e.g., Solar Farm Installation in Rural Community"
        v-model="formData.title"
        :error="errors.title"
        required
      />

      <UiInput
        id="location"
        label="Project Location *"
        type="text"
        placeholder="e.g., California, USA or Coordinates"
        v-model="formData.location"
        :error="errors.location"
        required
      />

      <UiInput
        id="docs_url"
        label="Documentation URL"
        type="url"
        placeholder="https://example.com/project-docs"
        v-model="formData.docs_url"
        :error="errors.docs_url"
      />

      <div class="input">
        <label for="methodology">Methodology *</label>
        <textarea
          id="methodology"
          v-model="formData.methodology"
          placeholder="Describe your project methodology, approach, and implementation details..."
          rows="4"
          class="textarea-input"
          :class="{ error: errors.methodology }"
          required
        ></textarea>
        <div v-if="errors.methodology" class="error-message">{{ errors.methodology }}</div>
      </div>

      <div class="input">
        <label for="status">Status</label>
        <select id="status" v-model="formData.status" class="select-input">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="form-actions">
        <UiButton type="button" variant="ghost" @click="handleCancel" :disabled="loading">
          Cancel
        </UiButton>
        <UiButton type="submit" variant="primary" :disabled="loading">
          <span v-if="!loading">Submit Project</span>
          <span v-else>Submitting...</span>
        </UiButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.project-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  margin-bottom: 24px;
  text-align: center;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--ecolink-primary-700);
}

.form-description {
  margin: 0;
  color: var(--ecolink-muted);
  font-size: 14px;
}

.form-grid {
  display: grid;
  gap: 20px;
}

.input {
  display: grid;
  gap: 8px;
}

.input label {
  font-weight: 600;
  font-size: 14px;
  color: var(--ecolink-text);
}

.select-input,
.textarea-input {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--ecolink-border);
  background: #fff;
  outline: none;
  transition:
    box-shadow 160ms ease,
    border-color 160ms ease;
  font-family: inherit;
}

.select-input:focus,
.textarea-input:focus {
  border-color: var(--ecolink-primary-500);
  box-shadow: 0 0 0 4px rgba(6, 158, 45, 0.12);
}

.select-input.error,
.textarea-input.error {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
