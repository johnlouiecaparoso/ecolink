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

app.mount('#app')
