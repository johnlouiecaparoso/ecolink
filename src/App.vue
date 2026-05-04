<script setup>
import { computed, onMounted, ref } from 'vue'
const showPolicyModal = ref(false)
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { usePreferencesStore } from '@/store/preferencesStore'
import { useUserStore } from '@/store/userStore'
// import { useErrorStore } from '@/store/errorStore' // Temporarily disabled
import { getSupabase } from '@/services/supabaseClient'

const route = useRoute()

// Track if app has been initially loaded to prevent showing loading screen on tab switches
const isInitialized = ref(false)

const showHeader = computed(() => {
  // Don't show header on auth pages
  return !['login', 'register', 'role-application'].includes(route.name)
})

const isAppReady = computed(() => {
  const userStore = useUserStore()
  // Only show loading screen during initial load, not on subsequent session checks
  return isInitialized.value || !userStore.loading
})

// Initialize stores and auth inside onMounted to avoid Pinia issues
onMounted(async () => {
  try {
    console.log('🚀 Initializing EcoLink app...')

    // Initialize stores after component is mounted
    const preferencesStore = usePreferencesStore()
    const userStore = useUserStore()
    // const errorStore = useErrorStore() // Temporarily disabled

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
          console.log('🔄 Auth state change:', event, session ? 'has session' : 'no session')

          if (event === 'SIGNED_OUT') {
            userStore.session = null
            userStore.profile = null
            userStore.role = 'general_user'
            userStore.permissions = []
            userStore.loading = false
            return
          }

          // If we have a session from the event, use it directly instead of fetching
          if (session && session.user) {
            console.log('✅ Using session from auth state change event')
            userStore.session = session
            userStore.loading = false
            // Fetch profile in background (don't await)
            userStore.fetchUserProfile().catch((err) => {
              console.error('Profile fetch failed:', err)
            })
            return
          }

          // If no session in event, try to fetch it (but don't clear on timeout)
          // Add timeout to prevent hanging (increased to 15 seconds for slower connections)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth state change timeout')), 15000),
          )

          // Don't show loading screen when refreshing session in background
          await Promise.race([userStore.fetchSession(false), timeoutPromise])
        } catch (error) {
          console.error('Error in auth state change:', error)
          // IMPORTANT: Don't clear session on timeout - session might still be valid
          // Only clear if we explicitly got a sign out event or no session
          // Check if we still have a valid session in storage before clearing
          try {
            const { data: { session: storedSession } } = await supabase.auth.getSession()
            if (storedSession && storedSession.user) {
              console.log('✅ Session still valid in storage, keeping it')
              userStore.session = storedSession
              userStore.loading = false
              return
            }
          } catch (checkError) {
            console.error('Error checking stored session:', checkError)
          }
          
          // Only clear if we really don't have a session
          if (event === 'SIGNED_OUT' || !session) {
            console.log('⚠️ Sign out event or no session, clearing...')
            userStore.session = null
            userStore.loading = false
          } else {
            console.log('⚠️ Timeout but session might still be valid, keeping current session')
            userStore.loading = false
          }
        }
      })

      // Initial session fetch with timeout - only if session not already loaded
      // Router guard may have already fetched it, so check first
      if (!userStore.session && !userStore.loading) {
        try {
          console.log('📡 Fetching initial session in App.vue...')
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Initial session fetch timeout')), 10000),
          )

          await Promise.race([userStore.fetchSession(), timeoutPromise])
          console.log('✅ Initial session fetch completed')

          // If we have a valid session, log it for debugging
          if (userStore.isAuthenticated) {
            console.log('✅ User is authenticated:', userStore.session.user.email)
            console.log(
              '✅ Session expires at:',
              new Date(userStore.session.expires_at * 1000).toLocaleString(),
            )
          } else {
            console.log('ℹ️ No active session found')
          }
        } catch (error) {
          console.error('Initial session fetch failed:', error)
          // Continue without session - app should still work
          userStore.loading = false
        }
      } else {
        // Session already loaded (by router guard) or currently loading
        console.log(
          userStore.session
            ? '✅ Session already loaded from router guard'
            : '⏳ Session fetch already in progress',
        )
      }
    } else {
      // Supabase errors are already logged in supabaseClient
      // Only show this if it's a different issue
      userStore.loading = false
    }

    // Mark app as initialized so loading screen won't show on tab switches
    isInitialized.value = true
    console.log('✅ App initialization completed')
  } catch (error) {
    console.error('❌ Failed to initialize app:', error)
    // Ensure loading state is cleared even on error
    const userStore = useUserStore()
    userStore.loading = false
    // Still mark as initialized to prevent stuck loading screen
    isInitialized.value = true
  }
})
</script>

<template>
  <ErrorBoundary>
    <!-- Loading Screen -->
    <div v-if="!isAppReady" class="loading-screen">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2>Loading EcoLink...</h2>
        <p>Please wait while we initialize your session</p>
      </div>
    </div>

    <!-- Main App -->
    <div v-else>
      <Header v-if="showHeader" />
      <router-view />

      <!-- Footer -->
      <footer v-if="showHeader" class="app-footer">
        <div class="footer-container">
          <p class="footer-copy">&copy; {{ new Date().getFullYear() }} EcoLink. All rights reserved.</p>
          <div class="footer-links">
            <button type="button" class="footer-link" @click="showPolicyModal = true">Terms &amp; Conditions</button>
            <span class="footer-sep">·</span>
            <button type="button" class="footer-link" @click="showPolicyModal = true">Privacy Policy</button>
            <span class="footer-sep">·</span>
            <button type="button" class="footer-link" @click="showPolicyModal = true">Carbon Credits Policy</button>
          </div>
        </div>
      </footer>

      <!-- Policy / Terms Modal -->
      <div v-if="showPolicyModal" class="policy-modal-overlay" @click.self="showPolicyModal = false">
        <div class="policy-modal">
          <div class="policy-modal-top">
            <h2>Carbon Credits Terms &amp; Conditions</h2>
            <button type="button" class="policy-close-btn" @click="showPolicyModal = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="policy-modal-body">
            <section class="policy-section">
              <h3>1. Credit Eligibility &amp; Standards</h3>
              <p>EcoLink only lists carbon credits meeting internationally recognized standards. Each credit = <strong>1 metric tonne CO₂e</strong> reduced/removed.</p>
              <ul>
                <li><strong>Additionality</strong> — Reduction would not have occurred without the project.</li>
                <li><strong>Permanence</strong> — Reductions must be lasting and not easily reversed.</li>
                <li><strong>Measurability</strong> — Accurately quantified using approved methodologies.</li>
                <li><strong>Verifiability</strong> — Independent third-party auditors verify all reductions.</li>
              </ul>
            </section>
            <section class="policy-section">
              <h3>2. Verification Standards</h3>
              <p>Accepted standards: <strong>VCS (Verra)</strong>, <strong>Gold Standard</strong>, <strong>Climate Action Reserve</strong>, <strong>American Carbon Registry</strong>.</p>
            </section>
            <section class="policy-section">
              <h3>3. Credit Retirement</h3>
              <p>Retired credits are <strong>permanently removed</strong> from circulation — they cannot be traded, resold, or reused. Each retirement is recorded with a unique certificate.</p>
            </section>
            <section class="policy-section">
              <h3>4. Marketplace Rules</h3>
              <p>All credits must be verified before listing. Pricing is transparent. All transactions are final once payment is confirmed. Market manipulation is strictly prohibited.</p>
            </section>
            <section class="policy-section">
              <h3>5. Buyer Guidelines</h3>
              <p>Credits transfer immediately upon payment. <strong>All sales are final.</strong> Refunds only for verified technical errors within 48 hours.</p>
            </section>
            <section class="policy-section">
              <h3>6. Environmental Integrity</h3>
              <p>Each credit has a unique serial number. No double counting. Projects undergo periodic monitoring and re-verification.</p>
            </section>
            <section class="policy-section">
              <h3>7. Platform Terms</h3>
              <p>Platform fee displayed at checkout. Users must provide accurate info. Misuse may result in suspension. Records retained for audit.</p>
            </section>
            <section class="policy-section">
              <h3>8. Developer Requirements</h3>
              <p>Projects must use approved methodologies. Annual monitoring reports mandatory. Non-compliance may result in delisting.</p>
            </section>
          </div>
          <div class="policy-modal-footer">
            <p class="policy-footer-info">Last updated: May 2026 · support@ecolink.com</p>
            <button class="policy-accept-btn" @click="showPolicyModal = false">I Understand &amp; Accept</button>
          </div>
        </div>
      </div>

      <!-- Global Toast Notifications -->
      <div id="toast-container" class="toast-container"></div>
    </div>
  </ErrorBoundary>
</template>

<style>
/* Loading Screen Styles */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: #374151;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.loading-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

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
  --font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  font-optical-sizing: auto;
  font-variation-settings: "wdth" 100;
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

/* ── Footer ── */
.app-footer {
  background: var(--bg-secondary, #f8fdf8);
  border-top: 1px solid var(--border-color, #d1e7dd);
  padding: 1.25rem 1.5rem;
  text-align: center;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.footer-copy {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted, #718096);
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  background: none;
  border: none;
  color: var(--primary-color, #069e2d);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.15rem 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.footer-link:hover {
  color: var(--primary-dark, #04773b);
  text-decoration: underline;
}

.footer-sep {
  color: var(--text-muted, #718096);
  font-size: 0.75rem;
}

/* ── Policy Modal ── */
.policy-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: policyFadeIn 0.25s ease;
}

@keyframes policyFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.policy-modal {
  width: min(720px, 100%);
  max-height: calc(100vh - 3rem);
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  animation: policySlideUp 0.3s ease;
  overflow: hidden;
}

@keyframes policySlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.policy-modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #d1e7dd);
  flex-shrink: 0;
}

.policy-modal-top h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary, #1a1a1a);
}

.policy-close-btn {
  background: var(--bg-secondary, #f8fdf8);
  border: 1px solid var(--border-color, #d1e7dd);
  color: var(--text-muted, #718096);
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.policy-close-btn:hover {
  background: var(--error-light, #f8d7da);
  color: var(--error-color, #dc3545);
  border-color: var(--error-color, #dc3545);
}

.policy-close-btn .material-symbols-outlined {
  font-size: 1.1rem;
}

.policy-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

.policy-section {
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-light, #e8f5e8);
}

.policy-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.policy-section h3 {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--primary-color, #069e2d);
  margin: 0 0 0.3rem;
}

.policy-section p {
  color: var(--text-secondary, #4a5568);
  line-height: 1.55;
  margin: 0;
  font-size: 0.8125rem;
}

.policy-section ul {
  margin: 0.35rem 0 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.policy-section ul li {
  color: var(--text-secondary, #4a5568);
  font-size: 0.8125rem;
  line-height: 1.5;
  margin-bottom: 0.2rem;
}

/* Green footer */
.policy-modal-footer {
  padding: 1rem 1.5rem;
  background: var(--primary-color, #069e2d);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-radius: 0 0 1rem 1rem;
}

.policy-footer-info {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.8);
}

.policy-accept-btn {
  padding: 0.6rem 1.75rem;
  background: #fff;
  color: var(--primary-color, #069e2d);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.policy-accept-btn:hover {
  background: var(--primary-light, #e8f5e8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .policy-modal {
    border-radius: 0.75rem;
    max-height: calc(100vh - 2rem);
  }
  .policy-modal-top h2 {
    font-size: 1rem;
  }
  .policy-modal-body {
    padding: 1rem;
  }
  .policy-modal-footer {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
    border-radius: 0 0 0.75rem 0.75rem;
  }
}
</style>
