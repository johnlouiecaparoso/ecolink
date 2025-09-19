<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerWithEmail } from '@/services/authService'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  try {
    await registerWithEmail({ name: name.value, email: email.value, password: password.value })
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = 'Unable to register. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="form-grid" @submit.prevent="handleSubmit">
    <div class="input">
      <label for="name">Full name</label>
      <input id="name" v-model="name" type="text" placeholder="Jane Doe" required />
    </div>

    <div class="input">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="you@ecolink.io" required />
    </div>

    <div class="input">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="Create a strong password"
        required
      />
    </div>

    <div class="input">
      <label for="confirm">Confirm password</label>
      <input
        id="confirm"
        v-model="confirmPassword"
        type="password"
        placeholder="Re-enter password"
        required
      />
    </div>

    <div v-if="errorMessage" style="color: #b00020; font-weight: 600">
      {{ errorMessage }}
    </div>

    <button class="btn btn-primary" type="submit" :disabled="loading">
      <span v-if="!loading">Create account</span>
      <span v-else>Creating account…</span>
    </button>
  </form>
</template>

<style scoped>
button[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}
</style>
