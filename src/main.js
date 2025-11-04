import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { analytics } from '@/utils/analytics'
import { initializeMobile } from '@/utils/mobile'
import { optimizeImageLoading } from '@/utils/imageOptimization'
import { setupServiceWorkerCache } from '@/utils/cache'
import { initSupabase } from '@/services/supabaseClient'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize Supabase client
initSupabase()

// Mount the app - Cache buster: 2024-10-02-V3-SINGLE-BOX-LOGIN
app.mount('#app')

// Gentle cache invalidation after app is mounted
if (typeof window !== 'undefined') {
  // Only clear caches after app is fully loaded
  setTimeout(() => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (name.includes('ecolink')) {
            caches.delete(name)
          }
        })
      })
    }
  }, 1000)

  // Version check without forced reload
  const currentVersion = '1.0.0'
  const storedVersion = localStorage.getItem('app-version')
  if (storedVersion !== currentVersion) {
    localStorage.setItem('app-version', currentVersion)
    console.log('App version updated to:', currentVersion)
  }
}

// Initialize analytics
analytics.initialize()

// Initialize mobile optimizations
initializeMobile()

// Initialize performance optimizations
optimizeImageLoading()
setupServiceWorkerCache()

// Handle browser extension context errors (harmless)
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Extension context invalidated')) {
    // This is a browser extension error, not our app - ignore it
    console.debug('Browser extension context invalidated (harmless)')
    event.preventDefault()
  }
})

// Handle unhandled promise rejections (like DOMException from service workers)
window.addEventListener('unhandledrejection', (event) => {
  // Silently ignore DOMException errors from service worker registration
  if (event.reason?.name === 'DOMException' && 
      (event.reason?.message?.includes('not, or is no longer, usable') ||
       event.reason?.message?.includes('Service Worker'))) {
    // Service worker errors are optional and not critical
    event.preventDefault()
    console.debug('Service Worker registration error (optional, safely ignored)')
    return
  }
  
  // Log other unhandled rejections for debugging
  console.warn('Unhandled promise rejection:', event.reason)
})
