import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { analytics } from '@/utils/analytics'
import { initializeMobile } from '@/utils/mobile'
import { optimizeImageLoading } from '@/utils/imageOptimization'
import { setupServiceWorkerCache } from '@/utils/cache'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Mount the app - Cache buster: 2024-10-02-FINAL
app.mount('#app')

// Initialize analytics
analytics.initialize()

// Initialize mobile optimizations
initializeMobile()

// Initialize performance optimizations
optimizeImageLoading()
setupServiceWorkerCache()

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
