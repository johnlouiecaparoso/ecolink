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

async function handleSubmit() {
  errorMessage.value = ''
  emailError.value = ''
  passwordError.value = ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Enter a valid email address'
  }
  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
  }
  if (emailError.value || passwordError.value) return
  loading.value = true
  try {
    const { session } = await loginWithEmail({ email: email.value, password: password.value })
    // Set session immediately to avoid guard race conditions
    if (session) {
      store.session = session
    } else {
      await store.fetchSession()
    }
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect
        ? route.query.redirect
        : '/dashboard'
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
    />

    <UiInput
      id="password"
      label="Password"
      type="password"
      placeholder="Enter your password"
      v-model="password"
      :error="passwordError"
    />

    <div v-if="errorMessage" style="color: #b00020; font-weight: 600">{{ errorMessage }}</div>

    <UiButton variant="primary" type="submit" :disabled="loading">
      <span v-if="!loading">Sign in</span>
      <span v-else>Signing in…</span>
    </UiButton>
  </form>
</template>

<style scoped>
button[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}
</style>
