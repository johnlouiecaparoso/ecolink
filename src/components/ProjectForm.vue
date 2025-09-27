<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import { projectService } from '@/services/projectService'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

const props = defineProps({
  project: {
    type: Object,
    default: null,
  },
  mode: {
    type: String,
    default: 'create', // 'create' or 'edit'
    validator: (value) => ['create', 'edit'].includes(value),
  },
})

const emit = defineEmits(['success', 'cancel'])

const userStore = useUserStore()

// Form data
const formData = ref({
  title: '',
  description: '',
  category: '',
  location: '',
  expected_impact: '',
})

// Form state
const loading = ref(false)
const errors = ref({})
const success = ref('')

// Available categories
const categories = ref(projectService.getProjectCategories())

// Form validation rules
const validationRules = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 100,
    message: 'Title must be between 5 and 100 characters',
  },
  description: {
    required: true,
    minLength: 20,
    maxLength: 1000,
    message: 'Description must be between 20 and 1000 characters',
  },
  category: {
    required: true,
    message: 'Please select a category',
  },
  location: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Location must be between 3 and 100 characters',
  },
  expected_impact: {
    required: true,
    minLength: 20,
    maxLength: 500,
    message: 'Expected impact must be between 20 and 500 characters',
  },
}

// Computed properties
const isEditMode = computed(() => props.mode === 'edit')
const formTitle = computed(() => (isEditMode.value ? 'Edit Project' : 'Create New Project'))
const submitButtonText = computed(() => {
  if (loading.value) {
    return isEditMode.value ? 'Updating...' : 'Creating...'
  }
  return isEditMode.value ? 'Update Project' : 'Create Project'
})

const isFormValid = computed(() => {
  return Object.keys(validationRules).every((field) => {
    const value = formData.value[field]
    const rule = validationRules[field]

    if (rule.required && (!value || value.trim() === '')) {
      return false
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      return false
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      return false
    }

    return true
  })
})

// Methods
function validateField(field) {
  const value = formData.value[field]
  const rule = validationRules[field]

  if (rule.required && (!value || value.trim() === '')) {
    errors.value[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
    return false
  }

  if (value && rule.minLength && value.length < rule.minLength) {
    errors.value[field] = rule.message
    return false
  }

  if (value && rule.maxLength && value.length > rule.maxLength) {
    errors.value[field] = rule.message
    return false
  }

  // Clear error if validation passes
  delete errors.value[field]
  return true
}

function validateForm() {
  let isValid = true

  Object.keys(validationRules).forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  return isValid
}

function clearErrors() {
  errors.value = {}
  success.value = ''
}

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    category: '',
    location: '',
    expected_impact: '',
  }
  clearErrors()
}

async function handleSubmit() {
  clearErrors()

  if (!validateForm()) {
    return
  }

  if (!isFormValid.value) {
    return
  }

  loading.value = true

  try {
    if (isEditMode.value) {
      // Update existing project
      await projectService.updateProject(props.project.id, formData.value)
      success.value = 'Project updated successfully!'
    } else {
      // Create new project
      await projectService.createProject(formData.value)
      success.value = 'Project created successfully!'
    }

    // Emit success event
    emit('success', formData.value)

    // Reset form if creating new project
    if (!isEditMode.value) {
      resetForm()
    }
  } catch (error) {
    console.error('Error saving project:', error)
    errors.value.general = error.message || 'Failed to save project. Please try again.'
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  resetForm()
  emit('cancel')
}

// Initialize form with project data if editing
onMounted(() => {
  if (isEditMode.value && props.project) {
    formData.value = {
      title: props.project.title || '',
      description: props.project.description || '',
      category: props.project.category || '',
      location: props.project.location || '',
      expected_impact: props.project.expected_impact || '',
    }
  }
})
</script>

<template>
  <div class="project-form">
    <div class="form-header">
      <h2>{{ formTitle }}</h2>
      <p v-if="!isEditMode">
        Submit your environmental project for verification and potential funding.
      </p>
      <p v-else>Update your project details below.</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <!-- General Error Message -->
      <div v-if="errors.general" class="error-message">
        {{ errors.general }}
      </div>

      <!-- Success Message -->
      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <!-- Project Title -->
      <div class="form-group">
        <label for="title" class="form-label"> Project Title * </label>
        <UiInput
          id="title"
          v-model="formData.title"
          :class="{ error: errors.title }"
          placeholder="Enter a descriptive title for your project"
          @blur="validateField('title')"
          @input="clearErrors"
        />
        <div v-if="errors.title" class="field-error">
          {{ errors.title }}
        </div>
        <div class="field-help">{{ formData.title.length }}/100 characters</div>
      </div>

      <!-- Project Category -->
      <div class="form-group">
        <label for="category" class="form-label"> Project Category * </label>
        <select
          id="category"
          v-model="formData.category"
          :class="['form-select', { error: errors.category }]"
          @change="validateField('category')"
        >
          <option value="">Select a category</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <div v-if="errors.category" class="field-error">
          {{ errors.category }}
        </div>
      </div>

      <!-- Project Location -->
      <div class="form-group">
        <label for="location" class="form-label"> Project Location * </label>
        <UiInput
          id="location"
          v-model="formData.location"
          :class="{ error: errors.location }"
          placeholder="City, Province, Country"
          @blur="validateField('location')"
          @input="clearErrors"
        />
        <div v-if="errors.location" class="field-error">
          {{ errors.location }}
        </div>
        <div class="field-help">{{ formData.location.length }}/100 characters</div>
      </div>

      <!-- Project Description -->
      <div class="form-group">
        <label for="description" class="form-label"> Project Description * </label>
        <textarea
          id="description"
          v-model="formData.description"
          :class="['form-textarea', { error: errors.description }]"
          placeholder="Describe your project in detail. Include objectives, methodology, timeline, and expected outcomes."
          rows="5"
          @blur="validateField('description')"
          @input="clearErrors"
        ></textarea>
        <div v-if="errors.description" class="field-error">
          {{ errors.description }}
        </div>
        <div class="field-help">{{ formData.description.length }}/1000 characters</div>
      </div>

      <!-- Expected Impact -->
      <div class="form-group">
        <label for="expected_impact" class="form-label"> Expected Impact * </label>
        <textarea
          id="expected_impact"
          v-model="formData.expected_impact"
          :class="['form-textarea', { error: errors.expected_impact }]"
          placeholder="Describe the environmental, social, or economic impact your project will have. Include measurable outcomes if possible."
          rows="4"
          @blur="validateField('expected_impact')"
          @input="clearErrors"
        ></textarea>
        <div v-if="errors.expected_impact" class="field-error">
          {{ errors.expected_impact }}
        </div>
        <div class="field-help">{{ formData.expected_impact.length }}/500 characters</div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <UiButton type="button" variant="outline" @click="handleCancel" :disabled="loading">
          Cancel
        </UiButton>
        <UiButton type="submit" :disabled="loading || !isFormValid">
          {{ submitButtonText }}
        </UiButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.project-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--ecolink-text);
}

.form-header p {
  margin: 0;
  color: var(--ecolink-muted);
  font-size: 16px;
}

.form {
  background: white;
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--ecolink-text);
  font-size: 14px;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  background: white;
  color: var(--ecolink-text);
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: var(--ecolink-primary);
  box-shadow: 0 0 0 3px var(--ecolink-primary-50);
}

.form-select.error {
  border-color: var(--ecolink-error);
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  background: white;
  color: var(--ecolink-text);
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--ecolink-primary);
  box-shadow: 0 0 0 3px var(--ecolink-primary-50);
}

.form-textarea.error {
  border-color: var(--ecolink-error);
}

.field-error {
  margin-top: 4px;
  color: var(--ecolink-error);
  font-size: 12px;
  font-weight: 500;
}

.field-help {
  margin-top: 4px;
  color: var(--ecolink-muted);
  font-size: 12px;
}

.error-message {
  background: var(--ecolink-error-bg);
  color: var(--ecolink-error);
  padding: 12px 16px;
  border-radius: var(--radius);
  margin-bottom: 20px;
  font-size: 14px;
}

.success-message {
  background: var(--ecolink-success-bg);
  color: var(--ecolink-success);
  padding: 12px 16px;
  border-radius: var(--radius);
  margin-bottom: 20px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--ecolink-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-form {
    padding: 16px;
  }

  .form {
    padding: 24px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
