import { defineStore } from 'pinia'
import { getSession, signOut } from '@/services/authService'
import { getProfile, updateProfile } from '@/services/profileService'
import { roleService } from '@/services/roleService'
import { logUserAction } from '@/services/auditService'
import { ROLES } from '@/constants/roles'

export const useUserStore = defineStore('user', {
  state: () => ({
    session: null,
    profile: null,
    loading: false,
    role: ROLES.GENERAL_USER,
    permissions: [],
  }),
  getters: {
    isAuthenticated: (state) => !!state.session?.user,
    isAdmin: (state) => roleService.isAdmin(state.role),
    isGeneralUser: (state) => roleService.isGeneralUser(state.role),
    isProjectDeveloper: (state) => roleService.isProjectDeveloper(state.role),
    isVerifier: (state) => roleService.isVerifier(state.role),
    isBuyerInvestor: (state) => roleService.isBuyerInvestor(state.role),
    hasPermission: (state) => (permission) => roleService.hasPermission(state.role, permission),
    hasAnyPermission: (state) => (permissions) =>
      roleService.hasAnyPermission(state.role, permissions),
    hasAllPermissions: (state) => (permissions) =>
      roleService.hasAllPermissions(state.role, permissions),
    canAccessRoute: (state) => (routePath) => roleService.canAccessRoute(state.role, routePath),
  },
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
            // Fetch user profile and role when session is valid
            await this.fetchUserProfile()
          } else {
            // Session expired, clear it
            this.session = null
            this.clearUserData()
          }
        } else {
          this.session = null
          this.clearUserData()
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        this.session = null
        this.clearUserData()
      } finally {
        this.loading = false
      }
    },
    async fetchUserProfile() {
      if (!this.session?.user?.id) return

      try {
        console.log('Fetching profile for user:', this.session.user.id)

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000),
        )

        const profile = await Promise.race([getProfile(this.session.user.id), timeoutPromise])

        this.profile = profile
        this.role = profile.role || ROLES.GENERAL_USER
        this.updatePermissions()
        console.log('User profile loaded successfully:', profile)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        console.log('Continuing without profile - user can still use the app')

        // Set default values and continue
        this.profile = null
        this.role = ROLES.GENERAL_USER
        this.updatePermissions()

        // Don't throw error - let the app continue to work
      }
    },

    async updateUserProfile(profileData) {
      if (!this.session?.user?.id) {
        throw new Error('User not authenticated')
      }

      try {
        const updatedProfile = await updateProfile(this.session.user.id, profileData)
        this.profile = updatedProfile
        console.log('Profile updated in store:', updatedProfile)
        return updatedProfile
      } catch (error) {
        console.error('Failed to update profile in store:', error)
        throw error
      }
    },
    updatePermissions() {
      // Update permissions based on current role
      this.permissions = roleService.getRolePermissions(this.role) || []
    },
    async updateUserRole(newRole) {
      if (!this.session?.user?.id) return false

      try {
        const success = await roleService.updateUserRole(this.session.user.id, newRole)
        if (success) {
          this.role = newRole
          this.updatePermissions()
        }
        return success
      } catch (error) {
        console.error('Error updating user role:', error)
        return false
      }
    },
    clearUserData() {
      this.session = null
      this.profile = null
      this.role = ROLES.GENERAL_USER
      this.permissions = []
      this.clearLocalStorage()
    },
    clearLocalStorage() {
      try {
        if (typeof window !== 'undefined') {
          // Clear localStorage
          if (window.localStorage) {
            Object.keys(window.localStorage).forEach((key) => {
              if (
                key.startsWith('sb-') ||
                key.includes('supabase') ||
                key.includes('auth') ||
                key.includes('user')
              ) {
                window.localStorage.removeItem(key)
              }
            })
          }

          // Clear sessionStorage
          if (window.sessionStorage) {
            Object.keys(window.sessionStorage).forEach((key) => {
              if (
                key.startsWith('sb-') ||
                key.includes('supabase') ||
                key.includes('auth') ||
                key.includes('user')
              ) {
                window.sessionStorage.removeItem(key)
              }
            })
          }

          // Clear any cookies related to authentication
          if (document.cookie) {
            document.cookie.split(';').forEach((cookie) => {
              const eqPos = cookie.indexOf('=')
              const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
              if (name.includes('supabase') || name.includes('auth') || name.includes('session')) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
              }
            })
          }
        }
      } catch (e) {
        console.warn('Error clearing storage:', e)
        // Ignore storage errors but continue
      }
    },
    async logout() {
      const userId = this.session?.user?.id

      try {
        // Log logout action before clearing data
        if (userId) {
          await logUserAction('LOGOUT_SUCCESS', 'user', userId, null, {
            timestamp: new Date().toISOString(),
          })
        }

        // Sign out from Supabase
        await signOut()

        // Clear all user data
        this.clearUserData()

        // Force clear any remaining session data
        this.clearLocalStorage()

        // Reset to initial state
        this.session = null
        this.profile = null
        this.role = ROLES.GENERAL_USER
        this.permissions = []
        this.loading = false
      } catch (error) {
        console.error('Error during logout:', error)
        // Even if signOut fails, clear local data
        this.clearUserData()
      }
    },
  },
})
