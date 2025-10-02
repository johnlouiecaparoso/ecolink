<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useUserStore } from '@/store/userStore'
import { useErrorStore } from '@/store/errorStore'
import { getSupabase } from '@/services/supabaseClient'

const route = useRoute()

const showHeader = computed(() => {
  // Don't show header on auth pages
  return !['login', 'register'].includes(route.name)
})

// Initialize stores and auth inside onMounted to avoid Pinia issues
onMounted(async () => {
  try {
    console.log('🚀 Initializing EcoLink app...')

    // Initialize stores after component is mounted
    const preferencesStore = usePreferencesStore()
    const userStore = useUserStore()
    const errorStore = useErrorStore()

    // Apply initial theme
    preferencesStore.applyTheme()
    preferencesStore.applyAccessibilitySettings()

    // Initialize auth after stores are ready with timeout
    const supabase = getSupabase()
    if (supabase) {
      console.log('🔐 Setting up auth state listener...')

      // Keep session in sync with auth state changes (email confirm, sign in/out in other tabs)
      supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          console.log('Auth state change:', event, session ? 'has session' : 'no session')

          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth state change timeout')), 8000),
          )

          await Promise.race([userStore.fetchSession(), timeoutPromise])
        } catch (error) {
          console.error('Error in auth state change:', error)
          // Clear the session on error and continue
          userStore.session = null
          userStore.loading = false
        }
      })

      // Initial session fetch with timeout
      try {
        console.log('📡 Fetching initial session...')
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Initial session fetch timeout')), 5000),
        )

        await Promise.race([userStore.fetchSession(), timeoutPromise])
        console.log('✅ Initial session fetch completed')
      } catch (error) {
        console.error('Initial session fetch failed:', error)
        // Continue without session - app should still work
        userStore.loading = false
      }
    } else {
      console.warn('⚠️ Supabase client not available')
      userStore.loading = false
    }

    console.log('✅ App initialization completed')
  } catch (error) {
    console.error('❌ Failed to initialize app:', error)
    // Ensure loading state is cleared even on error
    const userStore = useUserStore()
    userStore.loading = false
  }
})
</script>

<template>
  <ErrorBoundary>
    <div>
      <Header v-if="showHeader" />
      <router-view />
      <!-- Global Toast Notifications -->
      <div id="toast-container" class="toast-container"></div>

      <!-- Global Error Notifications -->
      <!-- Error notifications temporarily disabled during Pinia fix -->
    </div>
  </ErrorBoundary>
</template>

<style>
:root {
  /* Core Green Colors */
  --primary-color: #069e2d;
  --primary-hover: #058e3f;
  --primary-dark: #04773b;
  --primary-light: #e8f5e8;
  --primary-lighter: #f0f9f0;
  --primary-lightest: #f8fdf8;

  /* Text Colors */
  --text-primary: #1a1a1a;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  --text-light: #ffffff;
  --text-green: #04773b;

  /* Background Colors - White & Green Theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fdf8;
  --bg-tertiary: #f0f9f0;
  --bg-muted: #e8f5e8;
  --bg-accent: #d4edda;
  --bg-green: #069e2d;
  --bg-green-light: #e8f5e8;
  --bg-green-dark: #04773b;

  /* Border Colors */
  --border-color: #d1e7dd;
  --border-light: #e8f5e8;
  --border-green: #069e2d;
  --border-green-light: #d4edda;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.625rem;
  --radius-xl: 0.75rem;

  /* Shadows with Green Tints */
  --shadow-sm: 0 1px 2px rgba(6, 158, 45, 0.1);
  --shadow-md: 0 4px 6px rgba(6, 158, 45, 0.15);
  --shadow-lg: 0 10px 15px rgba(6, 158, 45, 0.2);
  --shadow-xl: 0 20px 25px rgba(6, 158, 45, 0.25);
  --shadow-green: 0 4px 12px rgba(6, 158, 45, 0.3);
  --shadow-green-lg: 0 8px 24px rgba(6, 158, 45, 0.4);

  /* Status Colors */
  --success-color: #069e2d;
  --success-light: #d4edda;
  --warning-color: #ffc107;
  --warning-light: #fff3cd;
  --error-color: #dc3545;
  --error-light: #f8d7da;
  --info-color: #17a2b8;
  --info-light: #d1ecf1;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-6xl: 3.75rem;

  /* Transitions */
  --transition: all 0.15s ease-in-out;

  /* Mobile breakpoints */
  --mobile-sm: 480px;
  --mobile-md: 768px;
  --tablet: 1024px;
}

html,
body,
#app {
  height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--bg-primary) 50%, #f0f8f0 100%);
}

/* Mobile auth layout */
@media (max-width: 768px) {
  .auth-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}

.auth-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-hover) 50%,
    var(--primary-dark) 100%
  );
  color: white;
  position: relative;
  overflow: hidden;
}

/* Mobile auth hero */
@media (max-width: 768px) {
  .auth-hero {
    padding: var(--spacing-lg);
    min-height: 200px;
  }
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
}

.hero-card {
  max-width: 32rem;
  position: relative;
}

/* Mobile hero card */
@media (max-width: 768px) {
  .hero-card {
    max-width: 100%;
    text-align: center;
  }
}

/* Auth panel mobile styles */
@media (max-width: 768px) {
  .auth-panel {
    padding: var(--spacing-md);
  }

  .panel-card {
    padding: var(--spacing-lg);
    margin: 0;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }

  .panel-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
  }

  .panel-title {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-sm);
  }

  .panel-desc {
    font-size: var(--font-size-base);
  }
}

/* Global mobile utility classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--spacing-sm);
  }
}

/* Mobile-first responsive text */
.text-responsive {
  font-size: clamp(0.875rem, 2.5vw, 1.125rem);
}

.title-responsive {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}

/* Touch-friendly buttons */
.btn-touch {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
}

@media (max-width: 768px) {
  .btn-touch {
    min-height: 48px;
    padding: 0.875rem 1.25rem;
  }
}

/* Hide on mobile */
.hide-mobile {
  display: block;
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none;
  }
}

/* Show only on mobile */
.show-mobile {
  display: none;
}

@media (max-width: 768px) {
  .show-mobile {
    display: block;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.brand-badge {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-lg);
}

/* Auth Logo Styles */
.auth-logo {
  position: relative;
  width: 2rem;
  height: 1.5rem;
}

.auth-logo-cloud {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(144, 238, 144, 0.8) 0%, rgba(34, 139, 34, 0.8) 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-logo-buildings {
  position: absolute;
  bottom: 0.15rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 0.1rem;
}

.auth-building {
  background: rgba(0, 100, 0, 0.8);
  border-radius: 0.08rem 0.08rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.08rem 0.04rem 0.04rem 0.04rem;
  gap: 0.04rem;
}

.auth-building-left {
  width: 0.3rem;
  height: 0.6rem;
}

.auth-building-right {
  width: 0.25rem;
  height: 0.45rem;
}

.auth-window {
  width: 0.06rem;
  height: 0.06rem;
  background: rgba(144, 238, 144, 0.8);
  border-radius: 0.015rem;
}

.auth-logo-leaf {
  position: absolute;
  bottom: -0.08rem;
  left: 0.08rem;
  width: 0.25rem;
  height: 0.3rem;
  background: linear-gradient(45deg, rgba(144, 238, 144, 0.8) 0%, rgba(34, 139, 34, 0.8) 100%);
  border-radius: 0 100% 0 100%;
  transform: rotate(-45deg);
}

.auth-logo-leaf::before {
  content: '';
  position: absolute;
  top: 0.2rem;
  left: 0.08rem;
  width: 0.04rem;
  height: 0.12rem;
  background: rgba(34, 139, 34, 0.8);
  border-radius: 0.02rem;
}

.auth-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.auth-sparkle {
  position: absolute;
  background: rgba(144, 238, 144, 0.6);
  border-radius: 50%;
  animation: authSparkle 2s ease-in-out infinite;
}

.auth-sparkle-1 {
  width: 0.06rem;
  height: 0.06rem;
  top: 0.15rem;
  right: 0.25rem;
  animation-delay: 0s;
}

.auth-sparkle-2 {
  width: 0.05rem;
  height: 0.05rem;
  top: 0.3rem;
  left: 0.15rem;
  animation-delay: 0.5s;
}

.auth-sparkle-3 {
  width: 0.04rem;
  height: 0.04rem;
  top: 0.08rem;
  left: 0.3rem;
  animation-delay: 1s;
}

.auth-sparkle-4 {
  width: 0.05rem;
  height: 0.05rem;
  top: 0.35rem;
  right: 0.08rem;
  animation-delay: 1.5s;
}

@keyframes authSparkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.brand-initials {
  font-weight: 700;
  font-size: var(--font-size-lg);
  letter-spacing: 0.05em;
}

.brand-title {
  margin: 0;
  font-size: var(--font-size-4xl);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  margin: 0.75rem 0 0 0;
  font-size: var(--font-size-lg);
  opacity: 0.9;
  font-weight: 400;
  line-height: 1.5;
}

.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-xl);
  background: var(--bg-primary);
}

.panel-card {
  width: 100%;
  max-width: 28rem;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.panel-header {
  padding: var(--spacing-xl) var(--spacing-xl) 0 var(--spacing-xl);
  text-align: center;
}

.panel-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.panel-desc {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--text-muted);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.panel-body {
  padding: 0 var(--spacing-xl) var(--spacing-xl) var(--spacing-xl);
}

.form-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.input {
  display: grid;
  gap: var(--spacing-sm);
}

.input label {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  letter-spacing: 0.025em;
}

.input input,
.input select,
.input textarea {
  width: 100%;
  padding: 0.875rem var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-muted);
  outline: none;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.input input:focus,
.input select:focus,
.input textarea:focus {
  border-color: var(--primary-color);
  box-shadow:
    0 0 0 3px rgba(6, 158, 45, 0.1),
    var(--shadow-md);
  background: var(--bg-primary);
}

.input input::placeholder,
.input textarea::placeholder {
  color: var(--text-muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 0.875rem var(--spacing-lg);
  border: 0;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-base);
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--border-color);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: var(--primary-hover);
}

.muted-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: var(--transition);
}

.muted-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-hero {
    min-height: 20rem;
    padding: var(--spacing-xl);
  }

  .hero-card {
    max-width: 100%;
  }

  .brand-title {
    font-size: var(--font-size-3xl);
  }

  .brand-subtitle {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 640px) {
  .auth-hero {
    padding: var(--spacing-lg);
    min-height: 16rem;
  }

  .auth-panel {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  .panel-card {
    max-width: 100%;
  }

  .panel-header {
    padding: var(--spacing-lg) var(--spacing-lg) 0 var(--spacing-lg);
  }

  .panel-body {
    padding: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
  }

  .brand {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .brand-title {
    font-size: var(--font-size-2xl);
  }

  .panel-title {
    font-size: var(--font-size-2xl);
  }
}

/* Toast Container */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 350px;
}
</style>
