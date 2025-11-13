<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ROLE_APPLICATION_ERRORS,
  ROLE_APPLICATION_ROLES,
  normalizeRequestedRole,
  submitRoleApplication,
} from '@/services/roleApplicationService'
import { useUserStore } from '@/store/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const ROLE_DETAILS = {
  [ROLE_APPLICATION_ROLES.PROJECT_DEVELOPER]: {
    title: 'Project Developer',
    summary:
      'Launch, manage, and list high-quality climate projects. Share project documentation and coordinate verification with EcoLink.',
    highlights: [
      'Create and manage carbon credit projects',
      'Access developer tools and analytics',
      'Collaborate with verifiers and buyers',
    ],
  },
  [ROLE_APPLICATION_ROLES.VERIFIER]: {
    title: 'Verifier',
    summary:
      'Review project documentation, validate carbon claims, and help ensure project integrity across the EcoLink marketplace.',
    highlights: [
      'Review project submissions and supporting evidence',
      'Provide verification feedback and recommendations',
      'Help maintain marketplace quality and trust',
    ],
  },
}

const defaultRole =
  normalizeRequestedRole(route.query.role) || ROLE_APPLICATION_ROLES.PROJECT_DEVELOPER
const selectedRole = ref(defaultRole)

const form = reactive({
  fullName: '',
  email: '',
  company: '',
  website: '',
  experience: '',
  motivation: '',
  supportingDocuments: '',
})

const errors = reactive({
  fullName: '',
  email: '',
  experience: '',
  motivation: '',
})

const loading = ref(false)
const submissionSuccess = ref(false)
const duplicatePending = ref(false)
const supabaseUnavailable = ref(false)
const errorMessage = ref('')
const submittedApplication = ref(null)

const selectedRoleDetails = computed(() => ROLE_DETAILS[selectedRole.value])

function canonicalizeRoleQuery(role) {
  if (role === ROLE_APPLICATION_ROLES.PROJECT_DEVELOPER) {
    return 'project-developer'
  }
  return role
}

function setSelectedRole(role) {
  const normalized = normalizeRequestedRole(role)
  if (!normalized || normalized === selectedRole.value) return
  selectedRole.value = normalized
}

function updateRoleQueryParam(role) {
  const canonical = canonicalizeRoleQuery(role)
  if (route.query.role === canonical) return
  router.replace({
    query: {
      ...route.query,
      role: canonical,
    },
  })
}

watch(
  () => route.query.role,
  (roleFromRoute) => {
    const normalized = normalizeRequestedRole(roleFromRoute)
    if (normalized && normalized !== selectedRole.value) {
      selectedRole.value = normalized
    }
  },
)

watch(selectedRole, (role) => {
  updateRoleQueryParam(role)
})

function prefillFromProfile() {
  const profile = userStore.profile
  const session = userStore.session

  if (profile) {
    if (!form.fullName) form.fullName = profile.full_name || ''
    if (!form.email) form.email = profile.email || session?.user?.email || ''
    if (!form.company) form.company = profile.company || ''
    if (!form.website) form.website = profile.website || ''
  } else if (session?.user?.email && !form.email) {
    form.email = session.user.email
  }
}

watch(
  () => [userStore.profile, userStore.session],
  () => {
    prefillFromProfile()
  },
  { immediate: true },
)

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  errorMessage.value = ''
  duplicatePending.value = false
  supabaseUnavailable.value = false
}

function validate() {
  clearErrors()
  let isValid = true

  if (!form.fullName || form.fullName.trim().length < 2) {
    errors.fullName = 'Please provide your full name.'
    isValid = false
  }

  if (!form.email) {
    errors.email = 'Contact email is required.'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    isValid = false
  }

  if (!form.experience || form.experience.trim().length < 20) {
    errors.experience = 'Share a brief summary of your relevant experience (at least 20 characters).'
    isValid = false
  }

  if (!form.motivation || form.motivation.trim().length < 20) {
    errors.motivation = 'Let us know why you want this role (at least 20 characters).'
    isValid = false
  }

  return isValid
}

function resetForm() {
  form.company = ''
  form.website = ''
  form.experience = ''
  form.motivation = ''
  form.supportingDocuments = ''
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  errorMessage.value = ''
  duplicatePending.value = false
  supabaseUnavailable.value = false

  try {
    const metadata = {
      source: 'web_form',
      submitted_from_path: route.fullPath,
      additional: {
        is_authenticated: userStore.isAuthenticated,
      },
    }

    const application = await submitRoleApplication({
      role: selectedRole.value,
      fullName: form.fullName,
      email: form.email,
      company: form.company,
      website: form.website,
      experience: form.experience,
      motivation: form.motivation,
      supportingDocuments: form.supportingDocuments,
      userId: userStore.session?.user?.id,
      metadata,
    })

    submissionSuccess.value = true
    submittedApplication.value = application
    resetForm()
  } catch (error) {
    console.error('Role application submission failed:', error)
    if (error.code === ROLE_APPLICATION_ERRORS.SUPABASE_NOT_INITIALIZED) {
      supabaseUnavailable.value = true
      errorMessage.value =
        'Our database is not available right now. Please try again after the team connects EcoLink to Supabase.'
    } else if (error.code === ROLE_APPLICATION_ERRORS.DUPLICATE_PENDING) {
      duplicatePending.value = true
      errorMessage.value =
        'You already have an application under review. Our admins will notify you once it is processed.'
    } else {
      errorMessage.value = error.message || 'Unable to submit your application right now.'
    }
  } finally {
    loading.value = false
  }
}

function goBackHome() {
  router.push('/home')
}

function startNewApplication(role) {
  submissionSuccess.value = false
  submittedApplication.value = null
  setSelectedRole(role)
  updateRoleQueryParam(role)
}
</script>

<template>
  <div class="role-application">
    <section class="role-application__hero">
      <div class="hero__container">
        <h1 class="hero__title">Apply to become an EcoLink specialist</h1>
        <p class="hero__subtitle">
          Help us build a trusted carbon marketplace. Submit your credentials to join as a project
          developer or verifier. Our admin team reviews every request.
        </p>
      </div>
    </section>

    <section class="role-application__content">
      <div class="content__wrap">
        <div class="role-selector">
          <h2 class="role-selector__title">Choose your role focus</h2>
          <div class="role-selector__cards">
            <button
              v-for="(details, role) in ROLE_DETAILS"
              :key="role"
              type="button"
              class="role-card"
              :class="{ 'role-card--active': role === selectedRole }"
              @click="setSelectedRole(role)"
            >
              <div class="role-card__header">
                <h3 class="role-card__title">{{ details.title }}</h3>
                <span v-if="role === selectedRole" class="role-card__badge">Selected</span>
              </div>
              <p class="role-card__summary">{{ details.summary }}</p>
              <ul class="role-card__highlights">
                <li v-for="item in details.highlights" :key="item">{{ item }}</li>
              </ul>
            </button>
          </div>
        </div>

        <div class="application-form">
          <header class="application-form__header">
            <h2 class="application-form__title">
              {{ selectedRoleDetails?.title }} application
            </h2>
            <p class="application-form__subtitle">
              Provide enough detail for the EcoLink admin team to verify your experience. We will
              follow up by email with next steps.
            </p>
            <p v-if="!userStore.isAuthenticated" class="application-form__notice">
              You can submit an application before creating an EcoLink account. Signing up later will
              help us match your request automatically.
            </p>
          </header>

          <div v-if="submissionSuccess" class="application-success">
            <div class="application-success__icon">✅</div>
            <h3 class="application-success__title">Application received</h3>
            <p class="application-success__message">
              Thank you for applying to become an EcoLink {{ selectedRoleDetails?.title.toLowerCase()
              }}. Our admin team will review your submission and reach out at
              <strong>{{ submittedApplication?.email }}</strong>.
            </p>
            <p class="application-success__hint">
              You can close this page or start a new application for a different role if needed.
            </p>
            <div class="application-success__actions">
              <button class="btn btn--primary" type="button" @click="goBackHome">
                Return to homepage
              </button>
              <button
                class="btn btn--secondary"
                type="button"
                @click="startNewApplication(ROLE_APPLICATION_ROLES.PROJECT_DEVELOPER)"
              >
                Apply as Project Developer
              </button>
              <button
                class="btn btn--secondary"
                type="button"
                @click="startNewApplication(ROLE_APPLICATION_ROLES.VERIFIER)"
              >
                Apply as Verifier
              </button>
            </div>
          </div>

          <form v-else class="form" @submit.prevent="handleSubmit" novalidate>
            <div class="form__grid">
              <div class="form__field">
                <label for="fullName" class="form__label">Full name</label>
                <input
                  id="fullName"
                  v-model="form.fullName"
                  type="text"
                  name="fullName"
                  class="form__input"
                  autocomplete="name"
                  required
                  @input="errors.fullName = ''"
                />
                <p v-if="errors.fullName" class="form__error">{{ errors.fullName }}</p>
              </div>

              <div class="form__field">
                <label for="email" class="form__label">Contact email</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  name="email"
                  class="form__input"
                  autocomplete="email"
                  required
                  @input="errors.email = ''"
                />
                <p v-if="errors.email" class="form__error">{{ errors.email }}</p>
              </div>

              <div class="form__field">
                <label for="company" class="form__label"
                  >Organization / Company
                  <span class="form__label-optional">(optional)</span>
                </label>
                <input
                  id="company"
                  v-model="form.company"
                  type="text"
                  name="company"
                  class="form__input"
                  autocomplete="organization"
                />
              </div>

              <div class="form__field">
                <label for="website" class="form__label"
                  >Website or portfolio
                  <span class="form__label-optional">(optional)</span>
                </label>
                <input
                  id="website"
                  v-model="form.website"
                  type="url"
                  name="website"
                  class="form__input"
                  placeholder="https://"
                />
              </div>

              <div class="form__field form__field--textarea">
                <label for="experience" class="form__label">Relevant experience</label>
                <textarea
                  id="experience"
                  v-model="form.experience"
                  name="experience"
                  class="form__textarea"
                  rows="5"
                  placeholder="Share your background, certifications, and project experience."
                  required
                  @input="errors.experience = ''"
                />
                <p v-if="errors.experience" class="form__error">{{ errors.experience }}</p>
              </div>

              <div class="form__field form__field--textarea">
                <label for="motivation" class="form__label">Why do you want this role?</label>
                <textarea
                  id="motivation"
                  v-model="form.motivation"
                  name="motivation"
                  class="form__textarea"
                  rows="5"
                  placeholder="Tell us how you plan to support EcoLink users in this role."
                  required
                  @input="errors.motivation = ''"
                />
                <p v-if="errors.motivation" class="form__error">{{ errors.motivation }}</p>
              </div>

              <div class="form__field form__field--textarea">
                <label for="supportingDocuments" class="form__label"
                  >Supporting links
                  <span class="form__label-optional">(optional)</span>
                </label>
                <textarea
                  id="supportingDocuments"
                  v-model="form.supportingDocuments"
                  name="supportingDocuments"
                  class="form__textarea"
                  rows="3"
                  placeholder="Share relevant documents, registry IDs, or reference URLs."
                />
              </div>
            </div>

            <div v-if="errorMessage" class="form__alert" :class="{ 'form__alert--warn': duplicatePending }">
              {{ errorMessage }}
            </div>

            <div v-if="supabaseUnavailable" class="form__alert form__alert--info">
              Connect Supabase credentials in the environment configuration and try again. Your form
              entries are not saved yet.
            </div>

            <footer class="form__actions">
              <button class="btn btn--primary" type="submit" :disabled="loading">
                <span v-if="loading" class="btn__spinner" aria-hidden="true"></span>
                <span>{{ loading ? 'Submitting application...' : 'Submit application' }}</span>
              </button>
              <router-link to="/home" class="btn btn--ghost">Cancel</router-link>
            </footer>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.role-application {
  min-height: 100vh;
  background: var(--bg-secondary, #f5fbf7);
  padding-bottom: 4rem;
}

.role-application__hero {
  background: linear-gradient(135deg, var(--primary-color, #069e2d) 0%, #0f9d58 100%);
  padding: 4rem 1.5rem;
  color: #ffffff;
  text-align: center;
}

.hero__container {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hero__title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  margin: 0;
}

.hero__subtitle {
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  margin: 0;
  line-height: 1.6;
  opacity: 0.95;
}

.role-application__content {
  padding: 3rem 1.5rem;
}

.content__wrap {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 2.5rem;
}

.role-selector {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.role-selector__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary, #102616);
}

.role-selector__cards {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.role-card {
  text-align: left;
  padding: 1.75rem;
  background: #ffffff;
  border-radius: var(--radius-xl, 20px);
  border: 2px solid rgba(15, 157, 88, 0.1);
  box-shadow: 0 12px 24px rgba(6, 158, 45, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-card--active {
  border-color: var(--primary-color, #069e2d);
  box-shadow: 0 16px 32px rgba(6, 158, 45, 0.16);
  transform: translateY(-4px);
}

.role-card:focus-visible {
  outline: 4px solid rgba(6, 158, 45, 0.4);
  outline-offset: 3px;
}

.role-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.role-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary, #102616);
}

.role-card__badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color, #069e2d);
  background: rgba(6, 158, 45, 0.15);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.role-card__summary {
  margin: 0;
  color: var(--text-muted, #4b5d52);
  line-height: 1.6;
}

.role-card__highlights {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--text-primary, #102616);
}

.role-card__highlights li {
  line-height: 1.4;
}

.application-form {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(15, 157, 88, 0.15);
  box-shadow: 0 24px 48px rgba(6, 158, 45, 0.12);
  padding: 2.5rem;
}

.application-form__header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.application-form__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary, #102616);
}

.application-form__subtitle,
.application-form__notice {
  margin: 0;
  color: var(--text-muted, #4b5d52);
  line-height: 1.6;
}

.application-form__notice {
  font-size: 0.95rem;
  background: rgba(6, 158, 45, 0.1);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  color: var(--primary-color, #069e2d);
  border: 1px solid rgba(6, 158, 45, 0.18);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form__field--textarea {
  grid-column: 1 / -1;
}

.form__label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #102616);
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.form__label-optional {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted, #4b5d52);
}

.form__input,
.form__textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(15, 157, 88, 0.2);
  background: #f9fffb;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: var(--text-primary, #102616);
}

.form__textarea {
  resize: vertical;
  min-height: 140px;
}

.form__input:focus,
.form__textarea:focus {
  outline: none;
  border-color: var(--primary-color, #069e2d);
  box-shadow: 0 0 0 4px rgba(6, 158, 45, 0.15);
}

.form__error {
  margin: 0;
  color: #b42318;
  font-size: 0.85rem;
  font-weight: 600;
}

.form__alert {
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: rgba(180, 35, 24, 0.08);
  border: 1px solid rgba(180, 35, 24, 0.2);
  color: #7a1b10;
  font-weight: 600;
}

.form__alert--warn {
  background: rgba(255, 193, 7, 0.12);
  border-color: rgba(255, 193, 7, 0.35);
  color: #8a5b00;
}

.form__alert--info {
  background: rgba(25, 118, 210, 0.12);
  border-color: rgba(25, 118, 210, 0.35);
  color: #0d47a1;
}

.form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: flex-start;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.85rem 1.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  text-decoration: none;
}

.btn--primary {
  background: linear-gradient(135deg, var(--primary-color, #069e2d) 0%, #058e3f 100%);
  color: #ffffff;
  box-shadow: 0 12px 20px rgba(6, 158, 45, 0.18);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 26px rgba(6, 158, 45, 0.24);
}

.btn--primary:disabled {
  cursor: wait;
  opacity: 0.85;
}

.btn--secondary {
  background: rgba(6, 158, 45, 0.12);
  color: var(--primary-color, #069e2d);
}

.btn--secondary:hover {
  background: rgba(6, 158, 45, 0.18);
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
  border: 1px solid rgba(15, 157, 88, 0.25);
  color: var(--primary-color, #069e2d);
}

.btn--ghost:hover {
  background: rgba(6, 158, 45, 0.08);
}

.btn__spinner {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: rgba(255, 255, 255, 1);
  animation: spin 0.8s linear infinite;
}

.application-success {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  align-items: center;
}

.application-success__icon {
  font-size: 2.5rem;
}

.application-success__title {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 700;
}

.application-success__message,
.application-success__hint {
  margin: 0;
  color: var(--text-muted, #4b5d52);
  line-height: 1.6;
  max-width: 560px;
}

.application-success__hint {
  font-size: 0.95rem;
}

.application-success__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 1024px) {
  .content__wrap {
    grid-template-columns: 1fr;
  }

  .role-selector {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .role-application__hero {
    padding: 3rem 1rem;
  }

  .role-application__content {
    padding: 2rem 1rem;
  }

  .application-form {
    padding: 1.75rem;
  }

  .form__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 540px) {
  .hero__title {
    font-size: 1.75rem;
  }

  .application-form__title {
    font-size: 1.5rem;
  }

  .role-card {
    padding: 1.5rem;
  }

  .form__grid {
    grid-template-columns: 1fr;
  }
}
</style>








<<<<<<< HEAD


<<<<<<< HEAD

=======
>>>>>>> 191b09e226eebf78c886c5d495f26a15031099cd
=======
>>>>>>> cdeda1ddb03759c7616575d52de04771aba3c655
