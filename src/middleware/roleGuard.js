import { ROLES, PERMISSIONS } from '@/constants/roles'

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

    const userRole = userStore.role
    const routePath = to.path

    // Check if user can access the route based on their role
    if (!userStore.canAccessRoute(routePath)) {
      console.warn(`Access denied: User with role '${userRole}' cannot access '${routePath}'`)

      // Redirect based on user role
      if (userRole === ROLES.VERIFIER) {
        return { name: 'verifier' }
      } else if (userRole === ROLES.ADMIN) {
        return { name: 'admin' }
      } else if (userRole === ROLES.PROJECT_DEVELOPER) {
        return { name: 'projects' }
      } else if (userRole === ROLES.BUYER_INVESTOR) {
        return { name: 'marketplace' }
      } else {
        return { name: 'dashboard' }
      }
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

    if (!userStore.isAdmin) {
      console.warn(
        `Admin access denied: User with role '${userStore.role}' cannot access admin routes`,
      )
      return { name: 'dashboard' }
    }

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

    if (!userStore.isVerifier) {
      console.warn(
        `Verifier access denied: User with role '${userStore.role}' cannot access verifier routes`,
      )
      return { name: 'dashboard' }
    }

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
      return { name: 'dashboard' }
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
  switch (userRole) {
    case ROLES.ADMIN:
      return '/admin'
    case ROLES.VERIFIER:
      return '/verifier'
    case ROLES.PROJECT_DEVELOPER:
      return '/projects'
    case ROLES.BUYER_INVESTOR:
      return '/marketplace'
    case ROLES.GENERAL_USER:
    default:
      return '/dashboard'
  }
}
