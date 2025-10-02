<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { loginWithEmail } from '@/services/authService'
import { TEST_ACCOUNTS, getTestAccountByEmail } from '@/utils/testAccounts'
import UiInput from '@/components/ui/Input.vue'
import UiButton from '@/components/ui/Button.vue'

const router = useRouter()
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
  const emailValid = validateEmail()
  const passwordValid = validatePassword()
  return emailValid && passwordValid
}

function fillTestAccount(accountType) {
  const testAccount = TEST_ACCOUNTS[accountType]
  if (testAccount) {
    email.value = testAccount.email
    password.value = testAccount.password
    emailError.value = ''
    passwordError.value = ''
    console.log(`Filled ${accountType} test account credentials`)
  }
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }
  loading.value = true
  try {
    // Check if this is a test account
    const testAccount = getTestAccountByEmail(email.value)
    if (testAccount && password.value === testAccount.password) {
      // Use test account mock session
      store.session = testAccount.mockSession
      store.role = testAccount.role
      console.log(`Logged in as test ${testAccount.role}:`, testAccount.name)
      router.replace('/')
      return
    }

    // Try real authentication
    const { session } = await loginWithEmail({ email: email.value, password: password.value })
    // Set session immediately to avoid guard race conditions
    if (session) {
      store.session = session
    } else {
      await store.fetchSession()
    }
    // Redirect to homepage after successful login
    router.replace('/')
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
  <form class="form-grid" @submit.prevent="handleSubmit">
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

    <!-- Test Accounts Section -->
    <div class="test-accounts">
      <p class="test-title">Test Accounts (Development Only)</p>
      <div class="test-buttons">
        <UiButton
          variant="outline"
          type="button"
          @click="fillTestAccount('admin')"
          :disabled="loading"
          size="small"
        >
          Admin Test
        </UiButton>
        <UiButton
          variant="outline"
          type="button"
          @click="fillTestAccount('verifier')"
          :disabled="loading"
          size="small"
        >
          Verifier Test
        </UiButton>
        <UiButton
          variant="outline"
          type="button"
          @click="fillTestAccount('user')"
          :disabled="loading"
          size="small"
        >
          User Test
        </UiButton>
      </div>
    </div>
  </form>
</template>

<style scoped>
button[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}

.test-accounts {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.test-title {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0 0 0.75rem 0;
  font-weight: 500;
}

.test-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
