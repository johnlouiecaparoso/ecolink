<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// import { registerWithEmail } from '@/services/authServiceSimple'
import { useUserStore } from '@/store/userStore'
import UiButton from '@/components/ui/Button.vue'

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
const showPassword = ref(false)
const showConfirm = ref(false)
const store = useUserStore()

async function handleSubmit() {
  console.log('Registration form submitted!')
  errorMessage.value = ''
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmError.value = ''

  // Basic validation
  if (!name.value || name.value.trim().length < 2) {
    nameError.value = 'Enter your full name'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Enter a valid email address'
  }
  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
  }
  if (password.value !== confirmPassword.value) {
    confirmError.value = 'Passwords do not match'
  }

  console.log('Validation errors:', {
    nameError: nameError.value,
    emailError: emailError.value,
    passwordError: passwordError.value,
    confirmError: confirmError.value,
  })

  if (nameError.value || emailError.value || passwordError.value || confirmError.value) {
    console.log('Form validation failed, not submitting')
    return
  }

  console.log('Form validation passed, submitting...')
  loading.value = true
  try {
    // Simulate registration (no actual API call needed for testing)
    console.log('Simulating registration...')
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log('Registration complete, redirecting to login...')
    // Direct redirect to login page
    router.replace('/login')
    console.log('Redirect completed')
  } catch (err) {
    console.error('Registration failed:', err)
    errorMessage.value = err?.message || 'Unable to register. Please try again.'
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
      <small v-if="nameError" style="color: #b00020; font-weight: 600">{{ nameError }}</small>
    </div>

    <div class="input">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" placeholder="you@ecolink.io" required />
      <small v-if="emailError" style="color: #b00020; font-weight: 600">{{ emailError }}</small>
    </div>

    <div class="input">
      <label for="password">Password</label>
      <div class="password-wrapper">
        <input
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Create a strong password"
          required
        />
        <button
          type="button"
          class="eye-toggle"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? '🙈' : '👁️' }}
        </button>
      </div>
      <small v-if="passwordError" style="color: #b00020; font-weight: 600">{{
        passwordError
      }}</small>
    </div>

    <div class="input">
      <label for="confirm">Confirm password</label>
      <div class="password-wrapper">
        <input
          id="confirm"
          v-model="confirmPassword"
          :type="showConfirm ? 'text' : 'password'"
          placeholder="Re-enter password"
          required
        />
        <button
          type="button"
          class="eye-toggle"
          :aria-label="showConfirm ? 'Hide password' : 'Show password'"
          @click="showConfirm = !showConfirm"
        >
          {{ showConfirm ? '🙈' : '👁️' }}
        </button>
      </div>
      <small v-if="confirmError" style="color: #b00020; font-weight: 600">{{ confirmError }}</small>
    </div>

    <div v-if="errorMessage" style="color: #b00020; font-weight: 600">
      {{ errorMessage }}
    </div>

    <UiButton type="submit" :loading="loading" block> Create Account </UiButton>
  </form>
</template>

<style scoped>
button[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}

.password-wrapper {
  position: relative;
}

.eye-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}
</style>
