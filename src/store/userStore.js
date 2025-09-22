import { defineStore } from 'pinia'
import { getSession, signOut } from '@/services/authService'
import { getProfile } from '@/services/profileService'
import { roleService } from '@/services/roleService'
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
        const profile = await getProfile(this.session.user.id)
        this.profile = profile
        this.role = profile.role || ROLES.GENERAL_USER
        this.updatePermissions()
      } catch (error) {
        console.error('Error fetching user profile:', error)
        this.role = ROLES.GENERAL_USER
        this.updatePermissions()
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
      this.clearUserData()
    },
  },
})
