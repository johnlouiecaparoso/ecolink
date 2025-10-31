import { ROLES, PERMISSIONS } from '@/constants/roles'
import { getRoleDefaultRoute } from '@/utils/getRoleDefaultRoute'

/**
 * Role-based route guard middleware
 * @param {Object} to - Route being navigated to
 * @param {Object} from - Route being navigated from
 * @param {Object} userStore - User store instance
 * @returns {Object|undefined} Navigation guard result
 */
export function createRoleGuard(userStore) {
  return async (to, from) => {
    // If no session, let the auth guard handle it
    if (!userStore.isAuthenticated) {
      return undefined
    }

    // Ensure profile/role is loaded before making decisions
    if (!userStore.profile) {
      try {
        await userStore.fetchUserProfile()
      } catch {}
    }

    const userRole = userStore.role
    const routePath = to.path

    // Check if user can access the route based on their role
    if (!userStore.canAccessRoute(routePath)) {
      console.warn(`Access denied: User with role '${userRole}' cannot access '${routePath}'`)

      // Redirect to the user's default route (centralized mapping)
      const path = getRoleDefaultRoute(userRole)
      return { path }
    }

    return undefined
  }
}

/**
 * Admin-only route guard
 * @param {Object} userStore - User store instance
 * @returns {Function} Route guard function
 */
export function createAdminGuard(userStore) {
  return async (to, from) => {
    if (!userStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // CRITICAL: Always fetch profile to ensure role is up-to-date
    // This handles cases where profile wasn't loaded yet or role changed
    if (!userStore.profile || !userStore.role || userStore.role === ROLES.GENERAL_USER) {
      console.log('[AdminGuard] Profile/role missing, fetching...', {
        hasProfile: !!userStore.profile,
        currentRole: userStore.role,
      })
      try {
        await userStore.fetchUserProfile()
        // Give it a moment to update the store
        await new Promise((resolve) => setTimeout(resolve, 200))
        console.log('[AdminGuard] After fetch:', {
          role: userStore.role,
          isAdmin: userStore.isAdmin,
          ROLES_ADMIN: ROLES.ADMIN,
        })
      } catch (error) {
        console.error('Error fetching profile in admin guard:', error)
        // Don't block access if fetch fails - let the route handle it
      }
    }

    // Double-check role after profile fetch
    console.log('[AdminGuard] Final check:', {
      role: userStore.role,
      isAdmin: userStore.isAdmin,
      ROLES_ADMIN: ROLES.ADMIN,
      roleMatch: userStore.role === ROLES.ADMIN,
    })

    if (!userStore.isAdmin) {
      console.warn(
        `❌ Admin access denied: User with role '${userStore.role}' cannot access admin routes`,
        {
          role: userStore.role,
          ROLES_ADMIN: ROLES.ADMIN,
          match: userStore.role === ROLES.ADMIN,
        },
      )
      const path = getRoleDefaultRoute(userStore.role)
      return { path }
    }

    console.log('✅ Admin access granted')

    return undefined
  }
}

/**
 * Verifier-only route guard
 * @param {Object} userStore - User store instance
 * @returns {Function} Route guard function
 */
export function createVerifierGuard(userStore) {
  return async (to, from) => {
    if (!userStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // CRITICAL: Always fetch profile to ensure role is up-to-date
    // This handles cases where profile wasn't loaded yet or role changed
    if (!userStore.profile || !userStore.role || userStore.role === ROLES.GENERAL_USER) {
      console.log('[VerifierGuard] Profile/role missing, fetching...', {
        hasProfile: !!userStore.profile,
        currentRole: userStore.role,
      })
      try {
        await userStore.fetchUserProfile()
        // Give it a moment to update the store
        await new Promise((resolve) => setTimeout(resolve, 200))
        console.log('[VerifierGuard] After fetch:', {
          role: userStore.role,
          isVerifier: userStore.isVerifier,
          ROLES_VERIFIER: ROLES.VERIFIER,
        })
      } catch (error) {
        console.error('Error fetching profile in verifier guard:', error)
        // Don't block access if fetch fails - let the route handle it
      }
    }

    // Double-check role after profile fetch
    console.log('[VerifierGuard] Final check:', {
      role: userStore.role,
      isVerifier: userStore.isVerifier,
      ROLES_VERIFIER: ROLES.VERIFIER,
      roleMatch: userStore.role === ROLES.VERIFIER,
    })

    if (!userStore.isVerifier) {
      console.warn(
        `❌ Verifier access denied: User with role '${userStore.role}' cannot access verifier routes`,
        {
          role: userStore.role,
          ROLES_VERIFIER: ROLES.VERIFIER,
          match: userStore.role === ROLES.VERIFIER,
        },
      )
      const path = getRoleDefaultRoute(userStore.role)
      return { path }
    }

    console.log('✅ Verifier access granted')

    return undefined
  }
}

/**
 * Project Developer-only route guard
 * @param {Object} userStore - User store instance
 * @returns {Function} Route guard function
 */
export function createProjectDeveloperGuard(userStore) {
  return async (to, from) => {
    if (!userStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // CRITICAL: Always fetch profile to ensure role is up-to-date
    // This handles cases where profile wasn't loaded yet or role changed
    if (!userStore.profile || !userStore.role || userStore.role === ROLES.GENERAL_USER) {
      console.log('[ProjectDeveloperGuard] Profile/role missing, fetching...', {
        hasProfile: !!userStore.profile,
        currentRole: userStore.role,
      })
      try {
        await userStore.fetchUserProfile()
        // Give it a moment to update the store
        await new Promise((resolve) => setTimeout(resolve, 200))
        console.log('[ProjectDeveloperGuard] After fetch:', {
          role: userStore.role,
          isProjectDeveloper: userStore.isProjectDeveloper,
          ROLES_PROJECT_DEVELOPER: ROLES.PROJECT_DEVELOPER,
        })
      } catch (error) {
        console.error('Error fetching profile in project developer guard:', error)
        // Don't block access if fetch fails - let the route handle it
      }
    }

    // Double-check role after profile fetch
    console.log('[ProjectDeveloperGuard] Final check:', {
      role: userStore.role,
      isProjectDeveloper: userStore.isProjectDeveloper,
      ROLES_PROJECT_DEVELOPER: ROLES.PROJECT_DEVELOPER,
      roleMatch: userStore.role === ROLES.PROJECT_DEVELOPER,
    })

    if (!userStore.isProjectDeveloper) {
      console.warn(
        `❌ Project Developer access denied: User with role '${userStore.role}' cannot access submit project routes`,
        {
          role: userStore.role,
          ROLES_PROJECT_DEVELOPER: ROLES.PROJECT_DEVELOPER,
          match: userStore.role === ROLES.PROJECT_DEVELOPER,
        },
      )
      const path = getRoleDefaultRoute(userStore.role)
      return { path }
    }

    console.log('✅ Project Developer access granted')

    return undefined
  }
}

/**
 * Permission-based route guard
 * @param {string|string[]} requiredPermissions - Required permissions
 * @param {Object} userStore - User store instance
 * @returns {Function} Route guard function
 */
export function createPermissionGuard(requiredPermissions, userStore) {
  return async (to, from) => {
    if (!userStore.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions]

    if (!userStore.hasAnyPermission(permissions)) {
      console.warn(
        `Permission denied: User with role '${userStore.role}' lacks required permissions:`,
        permissions,
      )
      const path = getRoleDefaultRoute(userStore.role)
      return { path }
    }

    return undefined
  }
}

/**
 * Role-based redirect helper
 * @param {string} userRole - User role
 * @returns {string} Default route for role
 */
export function getDefaultRouteForRole(userRole) {
  // Deprecated: use centralized mapping
  return getRoleDefaultRoute(userRole)
}
