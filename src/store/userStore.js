import { defineStore } from 'pinia'
import { getSession, signOut } from '@/services/authService'

export const useUserStore = defineStore('user', {
  state: () => ({
    session: null,
    profile: null,
    loading: false,
  }),
  actions: {
    async fetchSession() {
      this.loading = true
      try {
        const session = await getSession()
        // Check if session is valid and not expired
        if (session && session.user && session.expires_at) {
          const now = Math.floor(Date.now() / 1000)
          if (session.expires_at > now) {
            this.session = session
          } else {
            // Session expired, clear it
            this.session = null
            this.clearLocalStorage()
          }
        } else {
          this.session = null
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        this.session = null
        this.clearLocalStorage()
      } finally {
        this.loading = false
      }
    },
    clearLocalStorage() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          Object.keys(window.localStorage).forEach((key) => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              window.localStorage.removeItem(key)
            }
          })
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    },
    async logout() {
      await signOut()
      this.session = null
      this.profile = null
      this.clearLocalStorage()
    },
  },
})
