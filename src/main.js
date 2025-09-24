import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { getSupabase } from '@/services/supabaseClient'
import { useUserStore } from '@/store/userStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize the user store and keep session in sync with auth state changes
async function initializeAuth() {
  try {
    const supabase = getSupabase()
    if (supabase) {
      const store = useUserStore()

      // Keep session in sync with auth state changes (email confirm, sign in/out in other tabs)
      supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          console.log('Auth state change:', event, session ? 'has session' : 'no session')
          await store.fetchSession()
        } catch (error) {
          console.error('Error in auth state change:', error)
          // Clear the session on error
          store.session = null
        }
      })
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error)
  }
}

// Initialize auth before mounting the app
initializeAuth()

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              if (confirm('New version available! Reload to update?')) {
                window.location.reload()
              }
            }
          })
        })
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error)
      })
  })
}

app.mount('#app')
