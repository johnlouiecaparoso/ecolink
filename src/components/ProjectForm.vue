<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/userStore'
import { projectService } from '@/services/projectService'
import { projectWorkflowService } from '@/services/projectWorkflowService'
import { projectApprovalService } from '@/services/projectApprovalService'
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
  project_image: null, // Add project image field
  estimated_credits: '', // Add estimated credits field
  credit_price: '', // Add credit price field
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
const success = ref('')

// Categories are now custom text input - no longer using predefined list

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
    minLength: 2,
    maxLength: 50,
    message: 'Category must be between 2 and 50 characters',
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
    max: 1000000,
    message: 'Estimated credits must be between 1 and 1,000,000',
  },
  credit_price: {
    required: true,
    min: 0.01,
    max: 100000,
    message: 'Credit price must be between ₱0.01 and ₱100,000',
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

    // Handle required validation - check for empty values (string, number, null, undefined)
    if (rule.required) {
      // Check for null, undefined, empty string, or NaN
      if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
        validationResults[field] = { valid: false, reason: 'required field is empty' }
        return false
      }
      // For strings, also check if trimmed value is empty
      if (typeof value === 'string' && value.trim() === '') {
        validationResults[field] = { valid: false, reason: 'required string field is empty after trim' }
        return false
      }
      // For numbers, check if it's valid and meets minimum requirement
      if (typeof value === 'number' && !isNaN(value)) {
        // Also check if it's 0 or negative for fields that require positive values
        // But only if min is defined and > 0
        if (rule.min !== undefined && rule.min > 0 && value < rule.min) {
          validationResults[field] = { valid: false, reason: `number is below minimum ${rule.min}` }
          return false
        }
      }
    }

    // Handle string length validation (only for strings)
    if (typeof value === 'string' && value) {
      if (rule.minLength && value.length < rule.minLength) {
        validationResults[field] = { valid: false, reason: `string length ${value.length} is below minimum ${rule.minLength}` }
        return false
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        validationResults[field] = { valid: false, reason: `string length ${value.length} exceeds maximum ${rule.maxLength}` }
        return false
      }
    }

    // Handle numeric validation (for number fields)
    if (typeof value === 'number' && !isNaN(value)) {
      if (rule.min !== undefined && value < rule.min) {
        validationResults[field] = { valid: false, reason: `number ${value} is below minimum ${rule.min}` }
        return false
      }
      if (rule.max !== undefined && value > rule.max) {
        validationResults[field] = { valid: false, reason: `number ${value} exceeds maximum ${rule.max}` }
        return false
      }
    }

    validationResults[field] = { valid: true }
    return true
  })
  
  // Log validation results for debugging
  if (!isValid) {
    console.log('❌ Form validation failed. Field status:', JSON.parse(JSON.stringify(validationResults)))
    console.log('📋 Current form data:', JSON.parse(JSON.stringify({
      title: formData.value.title,
      description: formData.value.description,
      category: formData.value.category,
      location: formData.value.location,
      expected_impact: formData.value.expected_impact,
      estimated_credits: formData.value.estimated_credits,
      credit_price: formData.value.credit_price,
      project_image: formData.value.project_image ? 'File uploaded' : null
    })))
    
    // Log which fields are failing
    Object.keys(validationResults).forEach(field => {
      if (!validationResults[field].valid) {
        console.log(`  ❌ ${field}: ${validationResults[field].reason}`)
      }
    })
  }
  
  return isValid
})

// Methods
function validateField(field) {
  const value = formData.value[field]
  const rule = validationRules[field]

  // Handle required validation
  if (rule.required) {
    if (value === null || value === undefined || value === '') {
      errors.value[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      return false
    }
    // For strings, also check if trimmed value is empty
    if (typeof value === 'string' && value.trim() === '') {
      errors.value[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      return false
    }
    // For numbers, check if it's a valid number (not NaN)
    if (typeof value === 'number' && isNaN(value)) {
      errors.value[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      return false
    }
  }

  // Handle string length validation (only for strings)
  if (typeof value === 'string' && value) {
    if (rule.minLength && value.length < rule.minLength) {
      errors.value[field] = rule.message
      return false
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.value[field] = rule.message
      return false
    }
  }

  // Handle numeric validation (for number fields)
  if (typeof value === 'number' && !isNaN(value)) {
    if (rule.min !== undefined && value < rule.min) {
      errors.value[field] = rule.message
      return false
    }
    if (rule.max !== undefined && value > rule.max) {
      errors.value[field] = rule.message
      return false
    }
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
  success.value = ''
}

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    category: '',
    location: '',
    expected_impact: '',
    project_image: null,
    estimated_credits: '',
    credit_price: '',
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
  console.log('🚀 Form submit button clicked!')
  console.log('📋 Form data:', formData.value)
  console.log('✅ isFormValid:', isFormValid.value)
  
  clearErrors()

  // Log validation status
  const validationResult = validateForm()
  console.log('🔍 validateForm() result:', validationResult)
  console.log('❌ Current errors:', errors.value)
  
  if (!validationResult) {
    console.warn('⚠️ Form validation failed, preventing submission')
    return
  }

  if (!isFormValid.value) {
    console.warn('⚠️ isFormValid is false, preventing submission')
    // Log which fields are failing validation
    Object.keys(validationRules).forEach((field) => {
      const value = formData.value[field]
      const rule = validationRules[field]
      console.log(`  - ${field}:`, {
        value,
        type: typeof value,
        required: rule.required,
        hasValue: value !== null && value !== undefined && value !== '',
        isString: typeof value === 'string',
        isNumber: typeof value === 'number',
        stringLength: typeof value === 'string' ? value.length : 'N/A',
        passesRequired: !rule.required || (value !== null && value !== undefined && value !== '' && (typeof value !== 'string' || value.trim() !== '') && (typeof value !== 'number' || !isNaN(value))),
      })
    })
    return
  }
  
  console.log('✅ All validations passed, proceeding with submission...')

  loading.value = true

  try {
    // Prepare project data with files and image
    const projectData = {
      ...formData.value,
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
      success.value = 'Project updated successfully!'
    } else {
      // Submit new project - try multiple methods for reliability
      let submittedProject = null

      // Get user ID from Supabase (most reliable source)
      let userId = null
      const supabase = (await import('@/services/supabaseClient')).getSupabase()

      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Method 1: Try getUser() first (most reliable)
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (user && !userError) {
          userId = user.id
          console.log('✅ Using user ID from Supabase getUser():', userId)
        } else {
          console.log('getUser() failed:', userError)
        }
      } catch (error) {
        console.log('getUser() error:', error)
      }

      // Method 2: Try getSession() if getUser() failed
      if (!userId) {
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
          }
        } catch (error) {
          console.log('getSession() error:', error)
        }
      }

      // Method 3: Try userStore session as fallback
      if (!userId && userStore.session?.user?.id) {
        userId = userStore.session.user.id
        console.log('✅ Using user ID from userStore session:', userId)
      }

      // If we still don't have a user ID, throw an error
      if (!userId) {
        throw new Error('Unable to get user ID. Please log in again and try submitting the project.')
      }

      console.log('✅ Final user ID to use for project submission:', userId)

      // Verify the profile exists before submitting
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()

        if (profileError || !profile) {
          console.error('❌ Profile not found for user ID:', userId, profileError)
          throw new Error(
            'Your user profile was not found. Please contact support or try logging out and logging back in.'
          )
        }
        console.log('✅ Profile verified for user ID:', userId)
      } catch (profileCheckError) {
        if (profileCheckError.message.includes('profile was not found')) {
          throw profileCheckError
        }
        console.warn('⚠️ Could not verify profile, but continuing with submission:', profileCheckError)
      }

      try {
        // Try the workflow service first
        submittedProject = await projectWorkflowService.submitProject(projectData, userId)
        console.log('✅ Project submitted via workflow service:', submittedProject)
      } catch (workflowError) {
        console.error('❌ Workflow service failed:', workflowError)
        console.log('Trying direct submission as fallback...')

        // Fallback to direct project service
        try {
          submittedProject = await projectService.createProject(projectData, userId)
          console.log('✅ Project submitted via direct service:', submittedProject)
        } catch (directError) {
          console.error('❌ Direct service failed:', directError)
          console.log('Trying approval service as final fallback...')

          // Final fallback to approval service
          try {
            submittedProject = await projectApprovalService.submitProject(projectData, userId)
            console.log('✅ Project submitted via approval service:', submittedProject)
          } catch (approvalError) {
            console.error('❌ All submission methods failed:', {
              workflow: workflowError.message,
              direct: directError.message,
              approval: approvalError.message,
            })
            throw new Error(
              `Failed to submit project: ${approvalError.message || 'All submission methods failed. Please try again or contact support.'}`
            )
          }
        }
      }

      // Don't set success message here - let the parent component handle it
      // success.value = 'Project submitted successfully! It will be reviewed by our verification team.'
    }

    // Emit success event
    emit('success', projectData)

    // Reset form if creating new project
    if (!isEditMode.value) {
      resetForm()
    }
  } catch (error) {
    console.error('❌ Error saving project:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Check if it's an auth error
    if (error.message && (error.message.includes('session') || error.message.includes('auth') || error.message.includes('unauthorized'))) {
      errors.value.general = 'Your session may have expired. Please refresh the page and try again.'
      console.warn('⚠️ Auth-related error detected during project submission')
    } else {
      errors.value.general = error.message || 'Failed to save project. Please try again.'
    }

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
      success.value = 'Project submitted successfully!'
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

      <!-- Success Message -->
      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <!-- Project Title -->
      <div class="form-group title-field-enhanced">
        <label for="title" class="form-label title-label-enhanced">
          <span class="label-icon">📝</span>
          <span>Project Title *</span>
        </label>
        <div class="title-input-wrapper">
          <UiInput
            id="title"
            v-model="formData.title"
            :class="{ error: errors.title }"
            placeholder="Enter a descriptive title for your project"
            @blur="validateField('title')"
            @input="clearErrors"
          />
        </div>
        <div v-if="errors.title" class="field-error">
          {{ errors.title }}
        </div>
        <div class="field-help title-help-enhanced">
          <span class="help-icon">ℹ️</span>
          <span>{{ formData.title.length }}/100 characters</span>
          <span class="char-progress" :style="{ width: (formData.title.length / 100 * 100) + '%' }"></span>
        </div>
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
        <UiInput
          id="category"
          v-model="formData.category"
          :class="{ error: errors.category }"
          placeholder="Enter project category (e.g., Forestry, Renewable Energy, Waste Management)"
          @blur="validateField('category')"
          @input="clearErrors"
        />
        <div v-if="errors.category" class="field-error">
          {{ errors.category }}
        </div>
        <div class="field-help">
          Enter a custom category that best describes your project type
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
          <div class="credit-field price-field-enhanced credits-field-enhanced">
            <label for="estimated_credits" class="form-label price-label-enhanced">
              <span class="label-icon">📊</span>
              <span>Estimated Credits *</span>
            </label>
            <div class="price-input-container-enhanced credits-input-container">
              <div class="currency-badge credits-badge">#</div>
              <UiInput
                id="estimated_credits"
                v-model.number="formData.estimated_credits"
                type="number"
                :class="{ error: errors.estimated_credits }"
                placeholder="0"
                min="1"
                max="1000000"
                @blur="validateField('estimated_credits')"
                @input="clearErrors"
              />
              <div class="price-helper">
                <span class="helper-text">Min: 1</span>
              </div>
            </div>
            <div v-if="errors.estimated_credits" class="field-error">
              {{ errors.estimated_credits }}
            </div>
            <div class="field-help price-help-enhanced">
              <span class="help-icon">💡</span>
              <span>Number of carbon credits this project will generate</span>
            </div>
          </div>

          <div class="credit-field price-field-enhanced">
            <label for="credit_price" class="form-label price-label-enhanced">
              <span class="label-icon">💰</span>
              <span>Price per Credit *</span>
            </label>
            <div class="price-input-container-enhanced">
              <div class="currency-badge">₱</div>
              <UiInput
                id="credit_price"
                v-model.number="formData.credit_price"
                type="number"
                :class="{ error: errors.credit_price }"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                @blur="validateField('credit_price')"
                @input="clearErrors"
              />
              <div class="price-helper">
                <span class="helper-text">Min: ₱0.01</span>
              </div>
            </div>
            <div v-if="errors.credit_price" class="field-error">
              {{ errors.credit_price }}
            </div>
            <div class="field-help price-help-enhanced">
              <span class="help-icon">💡</span>
              <span>Set your price per carbon credit in Philippine Pesos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Spacer to fill vertical space -->
      <div class="form-spacer"></div>

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
  min-height: calc(100vh - 200px);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light, #e8f5e8);
  overflow: hidden;
  position: relative;
}

.project-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color, #069e2d), var(--primary-hover, #058e3f), var(--primary-color, #069e2d));
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 24px;
}

.form-spacer {
  flex: 1;
  min-height: 2rem;
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
  margin-top: auto;
  padding: 24px 32px 32px 32px;
  border-top: 2px solid var(--border-light, #e8f5e8);
  background: linear-gradient(to bottom, var(--bg-primary, #ffffff), var(--bg-secondary, #f8fdf8));
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
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

.price-input-container-enhanced {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary, #f8fdf8);
  border: 2px solid var(--border-light, #e8f5e8);
  border-radius: var(--radius-md, 0.625rem);
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.price-input-container-enhanced:focus-within {
  border-color: var(--primary-color, #069e2d);
  background: var(--bg-primary, #ffffff);
  box-shadow: 0 0 0 4px var(--primary-light, rgba(6, 158, 45, 0.1));
}

.currency-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, var(--primary-color, #069e2d), var(--primary-hover, #058e3f));
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: var(--radius-sm, 0.5rem);
  box-shadow: 0 2px 6px rgba(6, 158, 45, 0.2);
  flex-shrink: 0;
}

.price-helper {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-right: 0.5rem;
}

.helper-text {
  font-size: 0.75rem;
  color: var(--text-muted, #718096);
  font-weight: 500;
}

.price-field-enhanced {
  background: linear-gradient(135deg, var(--bg-secondary, #f8fdf8) 0%, var(--bg-primary, #ffffff) 100%);
  border-radius: var(--radius-md, 0.625rem);
  padding: 1.25rem;
  border: 2px solid var(--border-light, #e8f5e8);
  transition: all 0.3s ease;
}

.price-field-enhanced:hover {
  border-color: var(--primary-color, #069e2d);
  box-shadow: 0 2px 8px rgba(6, 158, 45, 0.1);
}

.price-label-enhanced {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.label-icon {
  font-size: 1.25rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.price-help-enhanced {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--primary-light, rgba(6, 158, 45, 0.05));
  border-radius: var(--radius-sm, 0.5rem);
  border-left: 3px solid var(--primary-color, #069e2d);
}

.help-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.credits-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, var(--primary-color, #069e2d), var(--primary-hover, #058e3f));
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: var(--radius-sm, 0.5rem);
  box-shadow: 0 2px 6px rgba(6, 158, 45, 0.2);
  flex-shrink: 0;
}

.credits-field-enhanced {
  background: linear-gradient(135deg, var(--bg-secondary, #f8fdf8) 0%, var(--bg-primary, #ffffff) 100%);
  border-radius: var(--radius-md, 0.625rem);
  padding: 1.25rem;
  border: 2px solid var(--border-light, #e8f5e8);
  transition: all 0.3s ease;
}

.credits-field-enhanced:hover {
  border-color: var(--primary-color, #069e2d);
  box-shadow: 0 2px 8px rgba(6, 158, 45, 0.1);
}

.credits-input-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-secondary, #f8fdf8);
  border: 2px solid var(--border-light, #e8f5e8);
  border-radius: var(--radius-md, 0.625rem);
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.credits-input-container:focus-within {
  border-color: var(--primary-color, #069e2d);
  background: var(--bg-primary, #ffffff);
  box-shadow: 0 0 0 4px var(--primary-light, rgba(6, 158, 45, 0.1));
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

  .price-input-container-enhanced {
    flex-wrap: wrap;
  }

  .price-helper {
    width: 100%;
    margin-left: 0;
    margin-top: 0.5rem;
  }
}

/* Enhanced Title Field Styles */
.title-field-enhanced {
  background: linear-gradient(135deg, var(--bg-secondary, #f8fdf8) 0%, var(--bg-primary, #ffffff) 100%);
  border-radius: var(--radius-md, 0.625rem);
  padding: 1.25rem;
  border: 2px solid var(--border-light, #e8f5e8);
  transition: all 0.3s ease;
}

.title-field-enhanced:hover {
  border-color: var(--primary-color, #069e2d);
  box-shadow: 0 2px 8px rgba(6, 158, 45, 0.1);
}

.title-label-enhanced {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.title-input-wrapper {
  position: relative;
}

.title-input-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color, #069e2d), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.title-input-wrapper:focus-within::after {
  opacity: 1;
}

.title-help-enhanced {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary, #f8fdf8);
  border-radius: var(--radius-sm, 0.5rem);
  position: relative;
  overflow: hidden;
}

.char-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color, #069e2d), var(--primary-hover, #058e3f));
  transition: width 0.3s ease;
  opacity: 0.3;
}
</style>
