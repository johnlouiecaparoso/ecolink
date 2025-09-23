<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { loginWithEmail } from '@/services/authService'
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
  const emailValid = validateEmail()
  const passwordValid = validatePassword()
  return emailValid && passwordValid
}

function fillDemoCredentials() {
  email.value = 'demo@ecolink.io'
  password.value = 'demo123'
  emailError.value = ''
  passwordError.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }
  loading.value = true
  try {
    // Demo login for testing
    if (email.value === 'demo@ecolink.io' && password.value === 'demo123') {
      const mockSession = {
        user: {
          id: 'demo-user-123',
          email: email.value,
          user_metadata: { name: 'Demo User' },
        },
        access_token: 'demo-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      }
      store.session = mockSession
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
      return
    }

    const { session } = await loginWithEmail({ email: email.value, password: password.value })
    // Set session immediately to avoid guard race conditions
    if (session) {
      store.session = session
    } else {
      await store.fetchSession()
    }
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect ? route.query.redirect : '/'
    router.replace(redirect)
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

    <UiButton variant="primary" type="submit" :disabled="loading">
      <span v-if="!loading">Sign in</span>
      <span v-else>Signing in…</span>
    </UiButton>

    <div class="demo-login">
      <p class="demo-text">Demo Login:</p>
      <UiButton variant="outline" type="button" @click="fillDemoCredentials" :disabled="loading">
        Use Demo Account
      </UiButton>
    </div>
  </form>
</template>

<style scoped>
button[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}

.demo-login {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.demo-text {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
</style>
