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
        console.log('🔄 Fetching session...')

        // CRITICAL FIX: Give Supabase time to restore session from localStorage
        // Supabase restores session asynchronously on initialization
        // First attempt - immediate
        let session = await getSession()

        // If no session found, wait a bit and retry (Supabase might still be restoring)
        if (!session) {
          console.log(
            '⏳ No session on first attempt, waiting for Supabase to restore from storage...',
          )
          await new Promise((resolve) => setTimeout(resolve, 300)) // Wait 300ms
          session = await getSession()
        }

        // Second retry if still no session
        if (!session) {
          console.log('⏳ Still no session, second retry...')
          await new Promise((resolve) => setTimeout(resolve, 500)) // Wait 500ms more
          session = await getSession()
        }

        // Check if session is valid and not expired
        if (session && session.user && session.expires_at) {
          const now = Math.floor(Date.now() / 1000)
          if (session.expires_at > now) {
            console.log('✅ Valid session found for user:', session.user.email)
            this.session = session
            // Fetch user profile and role when session is valid
            await this.fetchUserProfile()
          } else {
            console.log('⚠️ Session expired, clearing...')
            // Session expired, clear it and storage
            this.session = null
            this.clearUserData()
          }
        } else {
          // CRITICAL FIX: DO NOT clear localStorage here!
          // Supabase manages its own session storage - we should NOT delete it
          // Only clear in-memory session, but leave localStorage alone
          // This allows session to be restored on next page load if Supabase
          // hasn't finished initializing yet
          console.log(
            'ℹ️ No valid session found in store (localStorage may still have valid session)',
          )
          this.session = null
          // DO NOT call clearUserData() - it would delete valid Supabase tokens!
          // Only clear in-memory state
          this.profile = null
          this.role = ROLES.GENERAL_USER
          this.permissions = []
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        // CRITICAL FIX: On error, don't clear localStorage either
        // Network errors shouldn't delete valid sessions
        this.session = null
        // Only clear in-memory state, preserve localStorage
        this.profile = null
        this.role = ROLES.GENERAL_USER
        this.permissions = []
      } finally {
        this.loading = false
      }
    },
    async fetchUserProfile() {
      if (!this.session?.user?.id) return

      try {
        console.log('Fetching profile for user:', this.session.user.id)

        // IMPORTANT: Check if this is a test account first
        const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
        const testAccountIds = [
          '11111111-1111-1111-1111-111111111111', // admin
          '22222222-2222-2222-2222-222222222222', // verifier
          '33333333-3333-3333-3333-333333333333', // user
          '44444444-4444-4444-4444-444444444444', // developer
        ]
        const isTestAccount = isDevelopment && testAccountIds.includes(this.session.user.id)

        // For test accounts, use role already set in store (from login) and create mock profile
        if (isTestAccount) {
          if (import.meta.env.DEV) {
            console.log('[DEV] Test account detected - using role from store:', this.role)
          }

          // Import test accounts to get profile data
          const { TEST_ACCOUNTS } = await import('@/utils/testAccounts')

          // Find test account by ID
          const testAccount = Object.values(TEST_ACCOUNTS).find(
            (acc) => acc.mockSession?.user?.id === this.session.user.id,
          )

          // Create mock profile (don't try to fetch from Supabase)
          this.profile = {
            id: this.session.user.id,
            full_name: testAccount?.name || 'Test User',
            email: testAccount?.email || this.session.user.email,
            role: this.role || testAccount?.role || ROLES.GENERAL_USER,
            company: '',
            location: '',
            bio: '',
            kyc_level: 0,
            avatar_url: null,
            phone: '',
            website: '',
            notification_preferences: {
              emailNotifications: { enabled: true },
              projectUpdates: { enabled: true },
              marketAlerts: { enabled: false },
              newsletter: { enabled: true },
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          // Ensure role is set from test account if not already set
          if (!this.role && testAccount) {
            this.role = testAccount.role
          }

          // Normalize role
          const normalizedRole =
            typeof this.role === 'string' ? this.role.toLowerCase().trim() : ROLES.GENERAL_USER
          this.role = normalizedRole

          this.updatePermissions()

          if (import.meta.env.DEV) {
            console.log('✅ [DEV] Test account profile loaded:', {
              role: this.role,
              isAdmin: this.isAdmin,
              isVerifier: this.isVerifier,
              isProjectDeveloper: this.isProjectDeveloper,
            })
          }

          return
        }

        // For real users, fetch from Supabase
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000),
        )

        const profile = await Promise.race([getProfile(this.session.user.id), timeoutPromise])

        this.profile = profile
        // Normalize role - ensure it matches ROLES constants exactly
        const roleFromProfile = profile.role || ROLES.GENERAL_USER
        // Convert to lowercase and ensure it matches expected format
        const normalizedRole =
          typeof roleFromProfile === 'string'
            ? roleFromProfile.toLowerCase().trim()
            : ROLES.GENERAL_USER

        this.role = normalizedRole
        this.updatePermissions()

        // Debug logging
        if (import.meta.env.DEV) {
          console.log('✅ User profile loaded successfully:', {
            profileId: profile.id,
            roleFromProfile: profile.role,
            normalizedRole: normalizedRole,
            isAdmin: roleService.isAdmin(normalizedRole),
            isVerifier: roleService.isVerifier(normalizedRole),
            isProjectDeveloper: roleService.isProjectDeveloper(normalizedRole),
            ROLES_ADMIN: ROLES.ADMIN,
            ROLES_VERIFIER: ROLES.VERIFIER,
            ROLES_PROJECT_DEVELOPER: ROLES.PROJECT_DEVELOPER,
          })
        }
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
