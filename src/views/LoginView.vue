<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'

const route = useRoute()
const showRegisteredBanner = computed(() => route.query.registered === '1')
</script>

<template>
  <div class="auth-layout">
    <section class="auth-hero">
      <div class="hero-card">
        <div class="brand">
          <div class="brand-badge">
            <!-- New EcoLink Logo for Auth Pages -->
            <div class="auth-logo-container">
              <img
                src="/src/assets/images/ecolink-logo.png"
                alt="EcoLink Logo"
                class="auth-logo-image"
              />
            </div>
          </div>
          <div>
            <h1 class="brand-title">ECOLINK</h1>
            <p class="brand-subtitle">Connecting projects, verifiers, and impact-driven capital.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="auth-panel">
      <div class="panel-card">
        <div class="panel-header">
          <h2 class="panel-title">Welcome back</h2>
          <p class="panel-desc">Sign in to access your EcoLink dashboard.</p>
        </div>
        <div class="panel-body">
          <div v-if="showRegisteredBanner" class="success-banner">
            Registration successful. Please log in.
          </div>
          <LoginForm />
          <div style="margin-top: 14px; text-align: center">
            <span class="panel-desc">New to EcoLink?</span>
            <router-link class="muted-link" to="/register" style="margin-left: 8px"
              >Create an account</router-link
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.success-banner {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

/* New Logo Styling */
.auth-logo-container {
  width: 5rem !important;
  height: 5rem !important;
  min-width: 5rem !important;
  min-height: 5rem !important;
  max-width: 5rem !important;
  max-height: 5rem !important;
  border-radius: 50% !important;
  border: 2px solid #10b981;
  padding: 0.1rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 1;
}

.auth-logo-container:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
}

.auth-logo-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 50% !important;
  display: block !important;
  max-width: 100% !important;
  max-height: 100% !important;
}
</style>
