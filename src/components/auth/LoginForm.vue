<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithEmail } from '@/services/authService'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await loginWithEmail({ email: email.value, password: password.value })
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = 'Unable to sign in. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="form-grid" @submit.prevent="handleSubmit">
    <div class="input">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="you@ecolink.io" required />
    </div>

    <div class="input">
      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" placeholder="••••••••" required />
    </div>

    <div v-if="errorMessage" style="color: #b00020; font-weight: 600">
      {{ errorMessage }}
    </div>

    <button class="btn btn-primary" type="submit" :disabled="loading">
      <span v-if="!loading">Sign in</span>
      <span v-else>Signing in…</span>
    </button>
  </form>
</template>

<style scoped>
button[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}
</style>
