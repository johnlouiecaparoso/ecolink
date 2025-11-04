<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import { projectService } from '@/services/projectService'
import { projectWorkflowService } from '@/services/projectWorkflowService'
import { projectApprovalService } from '@/services/projectApprovalService'
import { useModernPrompt } from '@/composables/useModernPrompt'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

const { success: showSuccessPrompt, error: showErrorPrompt, warning: showWarningPrompt } = useModernPrompt()

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
  project_image: null, // Add project image field
  estimated_credits: null, // Add estimated credits field (null for number inputs)
  credit_price: null, // Add credit price field (null for number inputs)
})

// File upload state
const uploadedFiles = ref([])
const fileUploadError = ref('')
const uploadingFiles = ref(false)

// Project image upload state
const projectImage = ref(null)
const projectImagePreview = ref('')
const projectImageError = ref('')
const uploadingImage = ref(false)

// Form state
const loading = ref(false)
const errors = ref({})
const successMessage = ref('')

// Available categories
const categories = ref(projectService.getProjectCategories())

// Form validation rules
const validationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Title must be between 3 and 100 characters',
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    message: 'Description must be between 10 and 1000 characters',
  },
  category: {
    required: true,
    message: 'Please select a category',
  },
  location: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Location must be between 2 and 100 characters',
  },
  expected_impact: {
    required: true,
    minLength: 10,
    maxLength: 500,
    message: 'Expected impact must be between 10 and 500 characters',
  },
  estimated_credits: {
    required: true,
    min: 1,
    message: 'Estimated credits must be at least 1',
  },
  credit_price: {
    required: true,
    min: 0.01,
    message: 'Credit price must be at least ₱0.01',
  },
}

// File upload configuration
const fileUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  maxFiles: 5,
}

// Project image upload configuration
const imageUploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: 1920,
  maxHeight: 1080,
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
  const validationResults = {}
  const isValid = Object.keys(validationRules).every((field) => {
    const value = formData.value[field]
    const rule = validationRules[field]
    let fieldValid = true

    // Check required fields - handle both string and number types
    if (rule.required) {
      // Check for empty/null/undefined/NaN (for number inputs)
      if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
        validationResults[field] = 'required'
        return false
      }
      // For strings, check if empty after trim
      if (typeof value === 'string' && value.trim() === '') {
        validationResults[field] = 'empty string'
        return false
      }
      // For numeric fields, check if valid (not NaN and > 0)
      if (field === 'estimated_credits' || field === 'credit_price') {
        const numValue = typeof value === 'number' ? value : parseFloat(value)
        if (isNaN(numValue) || numValue <= 0) {
          validationResults[field] = `invalid number: ${value} (parsed: ${numValue})`
          return false
        }
      }
    }

    // Validate numeric fields (estimated_credits, credit_price)
    if (field === 'estimated_credits' || field === 'credit_price') {
      // Only validate if value exists (already checked required above)
      if (value !== null && value !== undefined && value !== '') {
        const numValue = typeof value === 'number' ? value : parseFloat(value)
        if (isNaN(numValue)) {
          validationResults[field] = 'not a number'
          return false
        }
        if (rule.min !== undefined && numValue < rule.min) {
          validationResults[field] = `below minimum: ${numValue} < ${rule.min}`
          return false
        }
        // Max validation removed - no upper limit for price and credits
        // if (rule.max !== undefined && numValue > rule.max) {
        //   validationResults[field] = `above maximum: ${numValue} > ${rule.max}`
        //   return false
        // }
      }
    }

    // Validate string length fields (only for string values)
    if (value && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        validationResults[field] = `too short: ${value.length} < ${rule.minLength}`
        return false
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        validationResults[field] = `too long: ${value.length} > ${rule.maxLength}`
        return false
      }
    }

    return true
  })
  
  // Debug logging (only log when form is invalid to avoid spam)
  if (!isValid) {
    console.log('🔍 Form validation details:', {
      isValid,
      validationResults,
      formData: formData.value,
    })
    console.log('❌ Invalid fields:', validationResults)
    console.log('📋 Current form values:', {
      title: formData.value.title,
      description: formData.value.description,
      category: formData.value.category,
      location: formData.value.location,
      expected_impact: formData.value.expected_impact,
      estimated_credits: formData.value.estimated_credits,
      credit_price: formData.value.credit_price,
      project_image: formData.value.project_image ? 'set' : 'not set',
    })
    // Also update the errors object so the UI shows the errors
    Object.keys(validationResults).forEach((field) => {
      const rule = validationRules[field]
      const value = formData.value[field]
      if (field === 'credit_price' || field === 'estimated_credits') {
        const numValue = typeof value === 'number' ? value : parseFloat(value)
        // Max validation removed - no upper limit
        // if (rule.max !== undefined && numValue > rule.max) {
        //   errors.value[field] = rule.message || `${field.charAt(0).toUpperCase() + field.slice(1)} must be at most ${rule.max}`
        // } else 
        if (rule.min !== undefined && numValue < rule.min) {
          errors.value[field] = rule.message || `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.min}`
        }
      }
    })
  }
  
  return isValid
})

// Methods
function validateField(field) {
  const value = formData.value[field]
  const rule = validationRules[field]

  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.value[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
    return false
  }

  // Validate numeric fields (estimated_credits, credit_price)
  if (field === 'estimated_credits' || field === 'credit_price') {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      errors.value[field] = rule.message || `${field.charAt(0).toUpperCase() + field.slice(1)} must be a valid number`
      return false
    }
    if (rule.min !== undefined && numValue < rule.min) {
      errors.value[field] = rule.message || `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.min}`
      return false
    }
    // Max validation removed - no upper limit for price and credits
    // if (rule.max !== undefined && numValue > rule.max) {
    //   errors.value[field] = rule.message || `${field.charAt(0).toUpperCase() + field.slice(1)} must be at most ${rule.max}`
    //   return false
    // }
  }

  // Validate string length fields
  if (value && typeof value === 'string' && rule.minLength && value.length < rule.minLength) {
    errors.value[field] = rule.message
    return false
  }

  if (value && typeof value === 'string' && rule.maxLength && value.length > rule.maxLength) {
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

  // Debug: Log form validation status
  console.log('Form validation status:', {
    isValid,
    formData: formData.value,
    errors: errors.value,
    isFormValid: isFormValid.value,
  })

  return isValid
}

function clearErrors() {
  errors.value = {}
  successMessage.value = ''
}

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    category: '',
    location: '',
    expected_impact: '',
    project_image: null,
    estimated_credits: null,
    credit_price: null,
  }
  uploadedFiles.value = []
  fileUploadError.value = ''
  projectImage.value = null
  projectImagePreview.value = ''
  projectImageError.value = ''
  clearErrors()
}

// File upload methods
function validateFile(file) {
  // Check file size
  if (file.size > fileUploadConfig.maxFileSize) {
    return `File "${file.name}" is too large. Maximum size is ${fileUploadConfig.maxFileSize / 1024 / 1024}MB`
  }

  // Check file type
  if (!fileUploadConfig.allowedTypes.includes(file.type)) {
    return `File "${file.name}" format is not supported. Allowed formats: PDF, JPEG, PNG, DOC, DOCX`
  }

  return null
}

async function handleFileUpload(event) {
  const files = Array.from(event.target.files)
  fileUploadError.value = ''

  // Check max files limit
  if (uploadedFiles.value.length + files.length > fileUploadConfig.maxFiles) {
    fileUploadError.value = `Maximum ${fileUploadConfig.maxFiles} files allowed`
    return
  }

  uploadingFiles.value = true

  for (const file of files) {
    const validationError = validateFile(file)
    if (validationError) {
      fileUploadError.value = validationError
      continue
    }

    try {
      // In a real implementation, you would upload to a file storage service
      // For now, we'll store the file object locally
      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file), // Temporary URL for preview
      }

      uploadedFiles.value.push(fileData)
    } catch (error) {
      console.error('Error uploading file:', error)
      fileUploadError.value = `Failed to upload ${file.name}`
    }
  }

  uploadingFiles.value = false
  event.target.value = '' // Clear the input
}

function removeFile(fileId) {
  const index = uploadedFiles.value.findIndex((f) => f.id === fileId)
  if (index !== -1) {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(uploadedFiles.value[index].url)
    uploadedFiles.value.splice(index, 1)
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Project image upload methods
function validateImageFile(file) {
  // Check file size
  if (file.size > imageUploadConfig.maxFileSize) {
    return `Image "${file.name}" is too large. Maximum size is ${imageUploadConfig.maxFileSize / 1024 / 1024}MB`
  }

  // Check file type
  if (!imageUploadConfig.allowedTypes.includes(file.type)) {
    return `Image "${file.name}" format is not supported. Allowed formats: JPEG, PNG, WebP`
  }

  return null
}

async function handleProjectImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  projectImageError.value = ''
  uploadingImage.value = true

  try {
    const validationError = validateImageFile(file)
    if (validationError) {
      projectImageError.value = validationError
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    projectImagePreview.value = previewUrl
    projectImage.value = file
    formData.value.project_image = file

    console.log('Project image uploaded:', file.name)
  } catch (error) {
    console.error('Error uploading project image:', error)
    projectImageError.value = `Failed to upload ${file.name}`
  } finally {
    uploadingImage.value = false
    event.target.value = '' // Clear the input
  }
}

function removeProjectImage() {
  if (projectImagePreview.value) {
    URL.revokeObjectURL(projectImagePreview.value)
  }
  projectImage.value = null
  projectImagePreview.value = ''
  formData.value.project_image = null
  projectImageError.value = ''
}

async function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleSubmit() {
  clearErrors()

  console.log('🔍 Submit button clicked - Form validation check:', {
    isFormValid: isFormValid.value,
    formData: formData.value,
    errors: errors.value,
  })

  // Run validateForm to populate errors object
  const formValidationResult = validateForm()
  
  // Also check isFormValid computed property
  const computedValidationResult = isFormValid.value

  if (!formValidationResult || !computedValidationResult) {
    console.warn('⚠️ Form validation failed:', {
      validateForm: formValidationResult,
      isFormValid: computedValidationResult,
      errors: errors.value,
    })
    
    // Build a detailed error message from the errors object
    const errorFields = Object.keys(errors.value)
    let errorMessage = 'Please fix the following issues:\n\n'
    errorFields.forEach((field) => {
      const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      errorMessage += `• ${fieldName}: ${errors.value[field]}\n`
    })
    
    if (errorFields.length === 0) {
      errorMessage = 'Please check all required fields. Some fields may be invalid or missing.'
    }
    
    await showErrorPrompt({
      title: 'Validation Failed',
      message: errorMessage || 'Please fill in all required fields correctly. Check the form for error messages.',
      confirmText: 'OK',
    })
    return
  }

  console.log('✅ Form validation passed, proceeding with submission...')
  loading.value = true

  try {
    // Prepare project data with files and image
    // Convert numeric fields from strings to numbers (form inputs return strings)
    const estimatedCredits = formData.value.estimated_credits 
      ? parseFloat(formData.value.estimated_credits) 
      : null
    const creditPrice = formData.value.credit_price 
      ? parseFloat(formData.value.credit_price) 
      : null
    
    // Validate numeric fields before submission
    if (estimatedCredits !== null && (isNaN(estimatedCredits) || estimatedCredits <= 0)) {
      throw new Error('Estimated credits must be a positive number')
    }
    if (creditPrice !== null && (isNaN(creditPrice) || creditPrice <= 0)) {
      throw new Error('Credit price must be a positive number (minimum 0.01)')
    }
    
    const projectData = {
      ...formData.value,
      estimated_credits: estimatedCredits,
      credit_price: creditPrice,
      documents: uploadedFiles.value.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: file.uploadDate,
      })),
    }

    // Convert project image to base64 for database storage
    if (projectImage.value) {
      try {
        const imageBase64 = await convertImageToBase64(projectImage.value)
        projectData.project_image = imageBase64
        projectData.image_name = projectImage.value.name
        projectData.image_type = projectImage.value.type
        projectData.image_size = projectImage.value.size
      } catch (error) {
        console.error('Error converting image to base64:', error)
        errors.value.general = 'Failed to process project image'
        return
      }
    }

    if (isEditMode.value) {
      // Update existing project
      await projectService.updateProject(props.project.id, projectData)
      successMessage.value = 'Project updated successfully!'
    } else {
      // Submit new project - try multiple methods for reliability
      let submittedProject = null

      // Get user ID from Supabase (most reliable source)
      let userId = null
      const supabase = (await import('@/services/supabaseClient')).getSupabase()

      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Get user ID from session (most reliable)
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (session?.user && !sessionError) {
          userId = session.user.id
          console.log('✅ Using user ID from Supabase getSession():', userId)
        } else {
          console.log('getSession() failed:', sessionError)
          throw new Error('No valid session found')
        }
      } catch (error) {
        console.log('getSession() error:', error)
        throw new Error('Unable to get user session')
      }

      try {
        // Try the workflow service first
        submittedProject = await projectWorkflowService.submitProject(projectData, userId)
        console.log('Project submitted via workflow service:', submittedProject)
      } catch (workflowError) {
        console.log('Workflow service failed, trying direct submission:', workflowError)

        // Fallback to direct project service
        try {
          submittedProject = await projectService.createProject(projectData, userId)
          console.log('Project submitted via direct service:', submittedProject)
        } catch (directError) {
          console.log('Direct service failed, trying approval service:', directError)

          // Final fallback to approval service
          submittedProject = await projectApprovalService.submitProject(projectData, userId)
          console.log('Project submitted via approval service:', submittedProject)
        }
      }

      successMessage.value =
        'Project submitted successfully! It will be reviewed by our verification team.'
      
      // Show enhanced modern success prompt with better design
      const projectTitle = formData.value.title || 'your project'
      await showSuccessPrompt({
        title: 'Project Submitted Successfully! 🎉',
        message: `Your project "${projectTitle}" has been submitted for verification.\n\nNext Steps:\n• Your project will be reviewed by our verifiers\n• Once approved, it will appear in the marketplace\n• You can track your project status in your dashboard`,
        confirmText: 'OK',
      })
    }

    // Emit success event
    emit('success', projectData)

    // Reset form if creating new project
    if (!isEditMode.value) {
      resetForm()
    }
  } catch (error) {
    console.error('Error saving project:', error)
    errors.value.general = error.message || 'Failed to save project. Please try again.'

    // Show modern error prompt
    await showErrorPrompt({
      title: 'Submission Failed',
      message: error.message || 'Failed to save project. Please check all fields and try again.',
      confirmText: 'OK',
    })

    // Show more detailed error information
    if (error.message) {
      console.log('Detailed error:', error.message)
    }
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  resetForm()
  emit('cancel')
}

// Debug function to test form submission
function debugFormSubmission() {
  console.log('=== FORM DEBUG INFO ===')
  console.log('Form Data:', formData.value)
  console.log('Form Valid:', isFormValid.value)
  console.log('Validation Rules:', validationRules)
  console.log('Errors:', errors.value)
  console.log('Loading:', loading.value)
  console.log('User Store:', userStore)
  console.log('User Store Session:', userStore.session)
  console.log('User Store Profile:', userStore.profile)
  console.log('User Store Role:', userStore.role)
  console.log('User Store Session User ID:', userStore.session?.user?.id)
  console.log('User Store Is Authenticated:', userStore.isAuthenticated)
  console.log('======================')
}

// Simple direct submission function for testing
async function forceSubmit() {
  console.log('Force submitting project...')
  loading.value = true

  try {
    const projectData = {
      title: formData.value.title || 'Test Project',
      description: formData.value.description || 'Test Description',
      category: formData.value.category || 'Forestry',
      location: formData.value.location || 'Test Location',
      expected_impact: formData.value.expected_impact || 'Test Impact',
    }

    console.log('Submitting with data:', projectData)

    // Try direct submission to Supabase
    const supabase = (await import('@/services/supabaseClient')).getSupabase()
    if (supabase) {
      // Test authentication methods
      console.log('Testing authentication methods...')

      // Method 1: getUser()
      const { data: userData, error: userError } = await supabase.auth.getUser()
      console.log('getUser() result:', { userData, userError })

      // Method 2: getSession()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      console.log('getSession() result:', { sessionData, sessionError })

      // Method 3: Check localStorage
      const authToken = localStorage.getItem('sb-fmngptolarydbgrtltnd-auth-token')
      console.log('localStorage auth token:', authToken ? 'exists' : 'not found')

      // Try multiple methods to get user ID
      let userId = userStore.session?.user?.id
      console.log('User store session user ID:', userId)

      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        userId = user?.id
        console.log('Force submit using Supabase user ID:', userId)
      }

      if (!userId) {
        throw new Error('No authenticated user found - tried user store and Supabase auth')
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            user_id: userId,
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('Project submitted successfully:', data)
      successMessage.value = 'Project submitted successfully!'
      resetForm()
    } else {
      throw new Error('Supabase not available')
    }
  } catch (error) {
    console.error('Force submission failed:', error)
    errors.value.general = error.message || 'Submission failed'
  } finally {
    loading.value = false
  }
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

      <!-- Success Message (hidden - using modern prompt instead) -->
      <!-- <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div> -->

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

      <!-- Project Image Upload -->
      <div class="form-group">
        <label class="form-label">Project Image (Optional)</label>
        <div class="project-image-upload-section">
          <!-- Image Preview -->
          <div v-if="projectImagePreview" class="image-preview-container">
            <img :src="projectImagePreview" alt="Project preview" class="image-preview" />
            <button
              type="button"
              class="remove-image-btn"
              @click="removeProjectImage"
              :disabled="loading"
              title="Remove image"
            >
              ✕
            </button>
          </div>

          <!-- Upload Area -->
          <div v-else class="image-upload-area">
            <input
              type="file"
              id="project-image-upload"
              ref="projectImageInput"
              accept="image/jpeg,image/png,image/webp"
              class="image-input"
              @change="handleProjectImageUpload"
              :disabled="uploadingImage"
            />
            <label for="project-image-upload" class="image-upload-label">
              <div class="upload-icon">📷</div>
              <div class="upload-text">
                <strong>Click to upload project image</strong>
                <span>or drag and drop image here</span>
              </div>
              <div class="upload-restrictions">JPEG, PNG, WebP up to 5MB</div>
            </label>
          </div>

          <!-- Image error message -->
          <div v-if="projectImageError" class="image-upload-error">
            {{ projectImageError }}
          </div>

          <!-- Upload progress -->
          <div v-if="uploadingImage" class="upload-progress">Processing image...</div>
        </div>
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

      <!-- Credit Information -->
      <div class="form-group">
        <label class="form-label">Credit Information *</label>
        <div class="credit-info-grid">
          <div class="credit-field">
            <label for="estimated_credits" class="form-label">Estimated Credits *</label>
            <UiInput
              id="estimated_credits"
              v-model.number="formData.estimated_credits"
              type="number"
              :class="{ error: errors.estimated_credits }"
              placeholder="e.g., 1000"
              min="1"
              @blur="validateField('estimated_credits')"
              @input="clearErrors"
            />
            <div v-if="errors.estimated_credits" class="field-error">
              {{ errors.estimated_credits }}
            </div>
            <div class="field-help">Number of carbon credits this project will generate</div>
          </div>

          <div class="credit-field">
            <label for="credit_price" class="form-label">Price per Credit *</label>
            <div class="price-input-container">
              <span class="currency-symbol">₱</span>
              <UiInput
                id="credit_price"
                v-model.number="formData.credit_price"
                type="number"
                :class="{ error: errors.credit_price }"
                placeholder="e.g., 15.50"
                min="0.01"
                step="0.01"
                @blur="validateField('credit_price')"
                @input="clearErrors"
              />
            </div>
            <div v-if="errors.credit_price" class="field-error">
              {{ errors.credit_price }}
            </div>
            <div class="field-help">Price per credit in PHP (Philippine Pesos)</div>
          </div>
        </div>
      </div>

      <!-- Document Upload -->
      <div class="form-group">
        <label class="form-label">Project Documents (Optional)</label>
        <div class="file-upload-section">
          <div class="file-upload-area">
            <input
              type="file"
              id="file-upload"
              ref="fileInput"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              class="file-input"
              @change="handleFileUpload"
              :disabled="uploadingFiles"
            />
            <label for="file-upload" class="file-upload-label">
              <div class="upload-icon">📁</div>
              <div class="upload-text">
                <strong>Click to upload documents</strong>
                <span>or drag and drop files here</span>
              </div>
              <div class="upload-restrictions">
                PDF, DOC, DOCX, JPEG, PNG up to 10MB each (max 5 files)
              </div>
            </label>
          </div>

          <!-- File error message -->
          <div v-if="fileUploadError" class="file-upload-error">
            {{ fileUploadError }}
          </div>

          <!-- Upload progress -->
          <div v-if="uploadingFiles" class="upload-progress">Uploading files...</div>

          <!-- Uploaded files list -->
          <div v-if="uploadedFiles.length > 0" class="uploaded-files">
            <h4>Uploaded Documents ({{ uploadedFiles.length }}/{{ fileUploadConfig.maxFiles }})</h4>
            <div class="file-list">
              <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
                <div class="file-info">
                  <div class="file-icon">
                    {{
                      file.type.includes('pdf') ? '📄' : file.type.includes('image') ? '🖼️' : '📝'
                    }}
                  </div>
                  <div class="file-details">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-size">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
                <button
                  type="button"
                  class="remove-file-btn"
                  @click="removeFile(file.id)"
                  :disabled="loading"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
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
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: var(--bg-primary, #ffffff);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.form-header {
  padding: 32px 32px 0 32px;
  margin-bottom: 0;
  text-align: center;
  background: var(--bg-primary, #ffffff);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  flex-shrink: 0;
}

.form-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #1a202c);
}

.form-header p {
  margin: 0 0 24px 0;
  color: var(--text-secondary, #4a5568);
  font-size: 16px;
}

.form {
  background: var(--bg-primary, #ffffff);
  border: none;
  border-radius: 0;
  padding: 32px;
  box-shadow: none;
  flex: 1;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  font-size: 16px;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color, #d1e7dd);
  border-radius: var(--radius-md, 0.5rem);
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #1a202c);
  font-size: 16px;
  transition: all 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color, #069e2d);
  box-shadow: 0 0 0 3px var(--primary-light, rgba(6, 158, 45, 0.1));
}

.form-select.error {
  border-color: var(--ecolink-error);
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color, #d1e7dd);
  border-radius: var(--radius-md, 0.5rem);
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #1a202c);
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #069e2d);
  box-shadow: 0 0 0 3px var(--primary-light, rgba(6, 158, 45, 0.1));
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
  color: var(--text-muted, #718096);
  font-size: 12px;
  font-weight: 500;
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
  padding: 24px 32px 32px 32px;
  border-top: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-primary, #ffffff);
  flex-shrink: 0;
}

/* Custom Scrollbar */
.form::-webkit-scrollbar {
  width: 8px;
}

.form::-webkit-scrollbar-track {
  background: var(--bg-secondary, #f8fdf8);
  border-radius: 4px;
}

.form::-webkit-scrollbar-thumb {
  background: var(--primary-color, #069e2d);
  border-radius: 4px;
}

.form::-webkit-scrollbar-thumb:hover {
  background: var(--primary-hover, #058e3f);
}

/* File Upload Styles */
.file-upload-section {
  margin-top: 8px;
}

.file-upload-area {
  position: relative;
  border: 2px dashed var(--border-color, #d1e7dd);
  border-radius: var(--radius-md, 0.5rem);
  padding: 32px 16px;
  text-align: center;
  background: var(--bg-secondary, #f8fdf8);
  transition: all 0.2s ease;
  cursor: pointer;
}

.file-upload-area:hover {
  border-color: var(--primary-color, #069e2d);
  background: var(--primary-light, rgba(6, 158, 45, 0.05));
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-upload-label {
  cursor: pointer;
  display: block;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.upload-text {
  margin-bottom: 8px;
}

.upload-text strong {
  display: block;
  color: var(--text-primary, #1a202c);
  margin-bottom: 4px;
}

.upload-text span {
  color: var(--text-secondary, #4a5568);
  font-size: 14px;
}

.upload-restrictions {
  font-size: 12px;
  color: var(--text-muted, #718096);
}

.file-upload-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--ecolink-error-bg);
  color: var(--ecolink-error);
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.upload-progress {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  text-align: center;
}

.uploaded-files {
  margin-top: 16px;
}

.uploaded-files h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 600;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.file-size {
  font-size: 12px;
  color: var(--text-muted);
}

.remove-file-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 16px;
  line-height: 1;
}

.remove-file-btn:hover {
  background: var(--ecolink-error-bg);
  color: var(--ecolink-error);
}

.remove-file-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Project Image Upload Styles */
.project-image-upload-section {
  margin-top: 8px;
}

.image-preview-container {
  position: relative;
  display: inline-block;
  border-radius: var(--radius-md, 0.5rem);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview {
  width: 200px;
  height: 150px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  background: rgba(220, 38, 38, 0.9);
}

.remove-image-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-upload-area {
  position: relative;
  border: 2px dashed var(--border-color, #d1e7dd);
  border-radius: var(--radius-md, 0.5rem);
  padding: 24px 16px;
  text-align: center;
  background: var(--bg-secondary, #f8fdf8);
  transition: all 0.2s ease;
  cursor: pointer;
}

.image-upload-area:hover {
  border-color: var(--primary-color, #069e2d);
  background: var(--primary-light, rgba(6, 158, 45, 0.05));
}

.image-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.image-upload-label {
  cursor: pointer;
  display: block;
}

.image-upload-label .upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.image-upload-label .upload-text {
  margin-bottom: 6px;
}

.image-upload-label .upload-text strong {
  display: block;
  color: var(--text-primary, #1a202c);
  margin-bottom: 2px;
  font-size: 14px;
}

.image-upload-label .upload-text span {
  color: var(--text-secondary, #4a5568);
  font-size: 12px;
}

.image-upload-label .upload-restrictions {
  font-size: 11px;
  color: var(--text-muted, #718096);
}

.image-upload-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--ecolink-error-bg);
  color: var(--ecolink-error);
  border-radius: var(--radius-sm);
  font-size: 14px;
}

/* Credit Information Styles */
.credit-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 8px;
}

.credit-field {
  display: flex;
  flex-direction: column;
}

.price-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 12px;
  color: var(--text-secondary, #4a5568);
  font-weight: 600;
  z-index: 1;
  pointer-events: none;
}

.price-input-container .form-input {
  padding-left: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-header {
    padding: 24px 24px 0 24px;
  }

  .form {
    padding: 24px;
  }

  .form-actions {
    flex-direction: column;
    padding: 24px;
  }

  .form-actions button {
    width: 100%;
  }

  .image-preview {
    width: 150px;
    height: 112px;
  }

  .credit-info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
