<script setup>
import { computed, ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'

// Fixed route injection issues - no route dependency
const showRegisteredBanner = ref(false)
// Cache buster: ${new Date().toISOString()}
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
        <div v-if="showRegisteredBanner" class="success-banner">
          Registration successful. Please log in.
        </div>
        <LoginForm />
        <div class="panel-footer">
          <span class="panel-desc">New to EcoLink?</span>
          <router-link class="muted-link" to="/register">Create an account</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Enhanced Auth Layout with Modern Styling */
.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-primary) 50%, #f0f8f0 100%);
  position: relative;
  overflow: hidden;
}

/* Animated background pattern */
.auth-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(16,185,129,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(16,185,129,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(16,185,129,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(16,185,129,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(16,185,129,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
  z-index: 0;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .auth-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}

/* Enhanced Auth Hero Section */
.auth-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-hover) 50%,
    var(--primary-dark) 100%
  );
  color: white;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.auth-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
  animation: float 15s ease-in-out infinite;
}

.hero-card {
  max-width: 32rem;
  position: relative;
  z-index: 2;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;
}

.brand-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Enhanced Logo Styling */
.auth-logo-container {
  width: 6rem !important;
  height: 6rem !important;
  min-width: 6rem !important;
  min-height: 6rem !important;
  max-width: 6rem !important;
  max-height: 6rem !important;
  border-radius: 50% !important;
  border: 3px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  aspect-ratio: 1;
  backdrop-filter: blur(10px);
  position: relative;
}

.auth-logo-container::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.3)
  );
  border-radius: 50%;
  z-index: -1;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.auth-logo-container:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.2);
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

.brand-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.05em;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out;
}

.brand-subtitle {
  font-size: 1.25rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  line-height: 1.6;
  max-width: 28rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Auth Panel */
.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: #ffffff;
  min-height: 100vh;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

/* Enhanced Panel Card */
.panel-card {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 28px;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.08),
    0 12px 30px rgba(6, 158, 45, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  display: flex;
  flex-direction: column;
}

.panel-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 35px 80px rgba(0, 0, 0, 0.12),
    0 18px 40px rgba(6, 158, 45, 0.18);
}

/* Success Banner */
.success-banner {
  margin: 1.5rem 1.5rem 0 1.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid #10b981;
  border-radius: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #059669;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideInDown 0.5s ease-out;
}

.success-banner::before {
  content: '✓';
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Footer */
.panel-footer {
  padding: 1.5rem 2rem 2rem 2rem;
  text-align: center;
  border-top: 1px solid rgba(229, 231, 235, 0.3);
  background: rgba(249, 250, 251, 0.5);
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.panel-desc {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.muted-link {
  color: #10b981;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  position: relative;
  overflow: hidden;
  line-height: 1.5;
  white-space: nowrap;
}

.muted-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.muted-link:hover {
  color: #059669;
  background: rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
}

.muted-link:hover::before {
  left: 100%;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .auth-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .auth-hero {
    padding: 2rem 1rem;
    min-height: 200px;
  }

  .auth-panel {
    padding: 1rem;
    min-height: auto;
  }

  .panel-card {
    max-width: 100%;
    border-radius: 24px;
  }

  .brand-title {
    font-size: 2.5rem;
  }

  .brand-subtitle {
    font-size: 1rem;
  }

  .auth-logo-container {
    width: 5rem !important;
    height: 5rem !important;
    min-width: 5rem !important;
    min-height: 5rem !important;
    max-width: 5rem !important;
    max-height: 5rem !important;
  }

  .panel-footer {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    gap: 0.5rem;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .auth-hero {
    padding: 1.5rem 1rem;
  }

  .auth-panel {
    padding: 0.75rem;
  }

  .panel-card {
    border-radius: 20px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .auth-logo-container {
    width: 4rem !important;
    height: 4rem !important;
    min-width: 4rem !important;
    min-height: 4rem !important;
    max-width: 4rem !important;
    max-height: 4rem !important;
  }

  .panel-footer {
    padding: 0.75rem 1rem 1rem 1rem;
    gap: 0.5rem;
    flex-direction: column;
  }
}
</style>
