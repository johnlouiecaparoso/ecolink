/**
 * Get the default route for a user based on their role
 * @param {string} role - User role
 * @returns {string} Default route path
 */
import { ROLES } from '@/constants/roles'

export function getRoleDefaultRoute(role) {
  switch (role) {
    case ROLES.ADMIN:
    case 'admin':
    case 'super_admin':
    case ROLES.VERIFIER:
    case 'verifier':
    case ROLES.PROJECT_DEVELOPER:
    case 'project_developer':
    case ROLES.BUYER_INVESTOR:
    case 'buyer_investor':
    case ROLES.GENERAL_USER:
    case 'general_user':
    case 'user':
    default:
      return '/home'
  }
}
