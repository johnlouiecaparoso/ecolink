<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { ROLES } from '@/constants/roles'
import { loginWithEmail } from '@/services/authService'
import { getTestAccountByEmail } from '@/utils/testAccounts'
import UiInput from '@/components/ui/Input.vue'
import UiButton from '@/components/ui/Button.vue'

const router = useRouter()
const route = useRoute()
const store = useUserStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const emailError = ref('')
const passwordError = ref('')

// Real-time validation
function validateEmail() {
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Enter a valid email address'
    return false
  }
  emailError.value = ''
  return true
}

function validatePassword() {
  if (!password.value) {
    passwordError.value = 'Password is required'
    return false
  }
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  passwordError.value = ''
  return true
}

function validateForm() {
  return validatePassword() && validateEmail()
}

async function handleSubmit() {
  errorMessage.value = ''
  emailError.value = ''

  if (!validateForm()) {
    return
  }
  loading.value = true
  try {
    let session

    // TEST ACCOUNTS DISABLED IN PRODUCTION
    // Only enable test accounts in development mode
    const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

    if (isDevelopment) {
      // Check if this is a test account (development only)
      const testAccount = getTestAccountByEmail(email.value)
      if (testAccount && password.value === testAccount.password) {
        // Use test account mock session (development only)
        store.session = testAccount.mockSession
        store.role = testAccount.role
        console.log(`[DEV] Logged in as test ${testAccount.role}:`, testAccount.name)

        // Redirect based on priority: returnTo or Home
        const returnTo = route.query.returnTo
        if (returnTo) {
          router.replace(decodeURIComponent(returnTo))
        } else {
          console.log(`[DEV] Test login as ${testAccount.role}, redirecting to Home`)
          router.replace({ name: 'home' })
        }
        return
      }
    }

    // Try real email authentication (production)
    const result = await loginWithEmail({ email: email.value, password: password.value })
    session = result.session

    // Set session immediately to avoid guard race conditions
    if (session) {
      store.session = session
      // Fetch user profile to get role for redirect
      // Wait for profile to be fully loaded before redirecting
      await store.fetchUserProfile()

      // Give store time to update role (if needed)
      if (!store.role || store.role === ROLES.GENERAL_USER) {
        // Wait a bit more if role isn't set yet
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } else {
      await store.fetchSession()
    }

    // Redirect to Home
    router.replace({ name: 'home' })
  } catch (err) {
    const msg = String(err?.message || '')
    if (/email_not_confirmed|confirm your email/i.test(msg)) {
      errorMessage.value = 'Please confirm your email before logging in.'
    } else if (/Invalid login credentials|invalid/i.test(msg)) {
      errorMessage.value = 'Email or password is incorrect.'
    } else if (/User not found|user not registered/i.test(msg)) {
      errorMessage.value = 'Account not found. Please register first.'
    } else {
      errorMessage.value = 'Unable to sign in. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-form-container">
    <div class="login-header">
      <h2 class="login-title">Welcome back</h2>
      <p class="login-subtitle">Sign in to access your EcoLink dashboard.</p>
    </div>
    <form class="form-grid" @submit.prevent="handleSubmit">
      <!-- Email Input -->
      <UiInput
        id="email"
        label="Email"
        type="email"
        placeholder="you@ecolink.io"
        v-model="email"
        :error="emailError"
        @blur="validateEmail"
        @input="emailError = ''"
      />

      <UiInput
        id="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        v-model="password"
        :error="passwordError"
        @blur="validatePassword"
        @input="passwordError = ''"
      />

      <div v-if="errorMessage" style="color: #b00020; font-weight: 600">{{ errorMessage }}</div>

      <UiButton type="submit" :loading="loading" block> Sign In </UiButton>
    </form>
  </div>
</template>

<style scoped>
/* Enhanced Login Form - Properly centered and sized */
.login-form-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
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

/* Login Header - Centered and properly spaced */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
}

.login-subtitle {
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
  max-width: 420px;
  padding: 0;
  margin: 0 auto;
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

/* Responsive Design for Login Form */
@media (max-width: 768px) {
  .login-form-container {
    padding: 1.25rem 0.75rem;
  }

  .form-grid {
    gap: 1rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .login-subtitle {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 1rem 0.5rem;
  }

  .form-grid {
    gap: 0.875rem;
  }

  .login-title {
    font-size: 1.375rem;
  }

  .login-subtitle {
    font-size: 0.8rem;
  }
}

/* Ensure proper centering on all screen sizes */
@media (min-width: 769px) {
  .login-form-container {
    padding: 2.5rem 2rem;
  }

  .form-grid {
    gap: 1.75rem;
  }
}

/* Fix for very small screens */
@media (max-width: 360px) {
  .login-form-container {
    padding: 1rem 0.5rem;
  }

  .form-grid {
    gap: 0.875rem;
  }
}
</style>
