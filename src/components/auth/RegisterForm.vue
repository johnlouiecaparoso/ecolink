<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerWithEmail } from '@/services/authService'
import { useUserStore } from '@/store/userStore'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmError = ref('')
// Removed showPassword and showConfirm as UiInput handles password visibility internally
const store = useUserStore()

async function handleSubmit() {
  errorMessage.value = ''
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmError.value = ''

  // Basic validation
  if (!name.value || name.value.trim().length < 2) {
    nameError.value = 'Enter your full name'
  }

  // Require email
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Enter a valid email address'
  }

  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
  }
  if (password.value !== confirmPassword.value) {
    confirmError.value = 'Passwords do not match'
  }

  if (nameError.value || emailError.value || passwordError.value || confirmError.value) {
    return
  }

  loading.value = true
  try {
    // Register with email
    await registerWithEmail({
      name: name.value.trim(),
      email: email.value,
      password: password.value,
    })

    // Redirect to login page on success
    router.replace('/login')
  } catch (err) {
    console.error('Registration failed:', err)
    errorMessage.value = err?.message || 'Unable to register. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-form-container">
    <div class="register-header">
      <h2 class="register-title">Create your account</h2>
      <p class="register-subtitle">Get started with EcoLink in minutes.</p>
    </div>
    <form class="form-grid" @submit.prevent="handleSubmit">
      <UiInput
        id="name"
        label="Full name"
        type="text"
        placeholder="Jane Doe"
        v-model="name"
        :error="nameError"
        required
      />

      <UiInput
        id="email"
        label="Email"
        type="email"
        placeholder="you@ecolink.io"
        v-model="email"
        :error="emailError"
        required
      />

      <UiInput
        id="password"
        label="Password"
        type="password"
        placeholder="Create a strong password"
        v-model="password"
        :error="passwordError"
        required
      />

      <UiInput
        id="confirm"
        label="Confirm password"
        type="password"
        placeholder="Re-enter password"
        v-model="confirmPassword"
        :error="confirmError"
        required
      />

      <div v-if="errorMessage" style="color: #b00020; font-weight: 600">{{ errorMessage }}</div>

      <UiButton type="submit" :loading="loading" block> Create Account </UiButton>
    </form>
  </div>
</template>

<style scoped>
/* Enhanced Register Form - Properly centered and sized */
.register-form-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 1.5rem 1rem;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
  border: none;
  position: relative;
  overflow: visible;
  transition: all 0.3s ease;
}

/* Register Header - Centered and properly spaced */
.register-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.register-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
}

.register-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

/* Form Grid - Optimized spacing and centering */
.form-grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.25rem;
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

/* Ensure form elements are properly sized */
.form-grid > * {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Specific styling for UiInput components */
.form-grid :deep(.enhanced-input) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-grid :deep(.enhanced-input__field) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

button[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}

/* Enhanced error message styling */
.form-grid > div[style*='color: #b00020'] {
  text-align: center;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

/* Responsive Design for Register Form */
@media (max-width: 768px) {
  .register-form-container {
    padding: 1.25rem 0.75rem;
  }

  .form-grid {
    gap: 1rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .register-subtitle {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .register-form-container {
    padding: 1rem 0.5rem;
  }

  .form-grid {
    gap: 0.875rem;
  }

  .register-title {
    font-size: 1.375rem;
  }

  .register-subtitle {
    font-size: 0.8rem;
  }
}

/* Ensure proper centering on all screen sizes */
@media (min-width: 769px) {
  .register-form-container {
    padding: 2.5rem 2rem;
  }

  .form-grid {
    gap: 1.75rem;
  }
}

/* Fix for very small screens */
@media (max-width: 360px) {
  .register-form-container {
    padding: 1rem 0.5rem;
  }

  .form-grid {
    gap: 0.875rem;
  }
}
</style>
