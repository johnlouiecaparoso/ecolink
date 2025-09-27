<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue'
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
            <p class="brand-subtitle">Join the network accelerating climate-positive projects.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="auth-panel">
      <div class="panel-card">
        <div class="panel-header">
          <h2 class="panel-title">Create your account</h2>
          <p class="panel-desc">Get started with EcoLink in minutes.</p>
        </div>
        <div class="panel-body">
          <RegisterForm />
          <div style="margin-top: 14px; text-align: center">
            <span class="panel-desc">Already have an account?</span>
            <router-link class="muted-link" to="/login" style="margin-left: 8px"
              >Sign in</router-link
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* New Logo Styling */
.auth-logo-container {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 3px solid #10b981;
  padding: 0.3rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-logo-container:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
}

.auth-logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}
</style>
