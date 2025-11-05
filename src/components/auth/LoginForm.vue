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
      <div class="form-field">
        <label for="email" class="form-label">
          <span class="label-icon">@</span>
          Email Address
        </label>
        <UiInput
          id="email"
          type="email"
          placeholder="you@ecolink.io"
          v-model="email"
          :error="emailError"
          @blur="validateEmail"
          @input="emailError = ''"
        />
      </div>

      <div class="form-field">
        <label for="password" class="form-label">
          <svg class="label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Password
        </label>
        <UiInput
          id="password"
          type="password"
          placeholder="Enter your password"
          v-model="password"
          :error="passwordError"
          @blur="validatePassword"
          @input="passwordError = ''"
        />
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <UiButton type="submit" :loading="loading" block class="sign-in-button">
        <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
        Sign In
      </UiButton>
    </form>
  </div>
</template>

<style scoped>
/* Enhanced Login Form - Properly centered and sized */
.login-form-container {
  width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
  position: relative;
}

/* Login Header - Centered and properly spaced */
.login-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0;
  border-bottom: none;
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem;
  letter-spacing: -0.025em;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.login-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Form Grid - Optimized spacing and centering */
.form-grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.25rem;
  width: 100%;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.label-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Specific styling for UiInput components */
.form-grid :deep(.enhanced-input) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-grid :deep(.enhanced-input__label) {
  display: none;
}

.form-grid :deep(.enhanced-input__field) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid #d1fae5;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #1f2937;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-grid :deep(.enhanced-input__field:focus) {
  border-color: var(--primary-color, #069e2d);
  outline: none;
  box-shadow: 0 0 0 3px rgba(6, 158, 45, 0.1);
}

.form-grid :deep(.enhanced-input__field::placeholder) {
  color: #9ca3af;
  font-weight: 400;
}

.sign-in-button {
  margin-top: 0.25rem;
}

.sign-in-button :deep(.ui-btn) {
  background: var(--primary-color, #069e2d);
  color: #ffffff;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.sign-in-button :deep(.ui-btn:hover) {
  background: var(--primary-hover, #058e3f);
}

.button-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.error-message {
  color: #b00020;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  text-align: center;
}

button[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}

/* Responsive Design for Login Form */
@media (max-width: 768px) {
  .login-title {
    font-size: 1.5rem;
  }

  .login-subtitle {
    font-size: 0.875rem;
  }

  .form-grid {
    gap: 1.25rem;
  }
}

@media (max-width: 480px) {
  .login-title {
    font-size: 1.375rem;
  }

  .login-subtitle {
    font-size: 0.8rem;
  }

  .form-grid {
    gap: 1rem;
  }
}
</style>
