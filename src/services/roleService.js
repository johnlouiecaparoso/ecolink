import { getSupabase } from '@/services/supabaseClient'
import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isSuperAdmin,
  isVerifier,
  canAccessRoute,
} from '@/constants/roles'

export class RoleService {
  constructor() {
    this.supabase = getSupabase()
  }

  /**
   * Get user role from profile
   * @param {string} userId - User ID
   * @returns {Promise<string>} User role
   */
  async getUserRole(userId) {
    if (!this.supabase || !userId) return ROLES.USER

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return ROLES.USER // Default to user role
      }

      return data?.role || ROLES.USER
    } catch (error) {
      console.error('Error in getUserRole:', error)
      return ROLES.USER
    }
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise<boolean>} Success status
   */
  async updateUserRole(userId, role) {
    if (!this.supabase || !userId || !Object.values(ROLES).includes(role)) {
      return false
    }

    try {
      const { error } = await this.supabase.from('profiles').update({ role }).eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateUserRole:', error)
      return false
    }
  }

  /**
   * Check if user has specific permission
   * @param {string} userRole - User role
   * @param {string} permission - Permission to check
   * @returns {boolean} Has permission
   */
  hasPermission(userRole, permission) {
    return hasPermission(userRole, permission)
  }

  /**
   * Check if user has any of the specified permissions
   * @param {string} userRole - User role
   * @param {string[]} permissions - Permissions to check
   * @returns {boolean} Has any permission
   */
  hasAnyPermission(userRole, permissions) {
    return hasAnyPermission(userRole, permissions)
  }

  /**
   * Check if user has all specified permissions
   * @param {string} userRole - User role
   * @param {string[]} permissions - Permissions to check
   * @returns {boolean} Has all permissions
   */
  hasAllPermissions(userRole, permissions) {
    return hasAllPermissions(userRole, permissions)
  }

  /**
   * Check if user is admin
   * @param {string} userRole - User role
   * @returns {boolean} Is admin
   */
  isAdmin(userRole) {
    return isAdmin(userRole)
  }

  /**
   * Check if user is super admin
   * @param {string} userRole - User role
   * @returns {boolean} Is super admin
   */
  isSuperAdmin(userRole) {
    return isSuperAdmin(userRole)
  }

  /**
   * Check if user is verifier
   * @param {string} userRole - User role
   * @returns {boolean} Is verifier
   */
  isVerifier(userRole) {
    return isVerifier(userRole)
  }

  /**
   * Check if user can access specific route
   * @param {string} userRole - User role
   * @param {string} routePath - Route path
   * @returns {boolean} Can access route
   */
  canAccessRoute(userRole, routePath) {
    return canAccessRoute(userRole, routePath)
  }

  /**
   * Get all users with their roles (admin only)
   * @returns {Promise<Array>} Users with roles
   */
  async getAllUsersWithRoles() {
    if (!this.supabase) return []

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(
          `
          id,
          full_name,
          role,
          kyc_level,
          created_at,
          updated_at
        `,
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users with roles:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllUsersWithRoles:', error)
      return []
    }
  }

  /**
   * Get role statistics (admin only)
   * @returns {Promise<Object>} Role statistics
   */
  async getRoleStatistics() {
    if (!this.supabase) return {}

    try {
      const { data, error } = await this.supabase.from('profiles').select('role')

      if (error) {
        console.error('Error fetching role statistics:', error)
        return {}
      }

      const stats = data.reduce((acc, profile) => {
        const role = profile.role || ROLES.USER
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {})

      return stats
    } catch (error) {
      console.error('Error in getRoleStatistics:', error)
      return {}
    }
  }

  /**
   * Get permissions for a role
   * @param {string} role - User role
   * @returns {Array} Array of permissions
   */
  getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || []
  }

  /**
   * Validate role assignment (check if current user can assign role)
   * @param {string} currentUserRole - Current user's role
   * @param {string} targetRole - Role to be assigned
   * @returns {boolean} Can assign role
   */
  canAssignRole(currentUserRole, targetRole) {
    // Only super admins can assign super admin role
    if (targetRole === ROLES.SUPER_ADMIN) {
      return currentUserRole === ROLES.SUPER_ADMIN
    }

    // Only admins and super admins can assign admin role
    if (targetRole === ROLES.ADMIN) {
      return currentUserRole === ROLES.ADMIN || currentUserRole === ROLES.SUPER_ADMIN
    }

    // Admins and super admins can assign any role
    return currentUserRole === ROLES.ADMIN || currentUserRole === ROLES.SUPER_ADMIN
  }
}

// Export singleton instance
export const roleService = new RoleService()
