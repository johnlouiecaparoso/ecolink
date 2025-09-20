// User roles and permissions
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  VERIFIER: 'verifier',
  SUPER_ADMIN: 'super_admin',
}

// Permission definitions
export const PERMISSIONS = {
  // User permissions
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_MARKETPLACE: 'view_marketplace',
  MANAGE_WALLET: 'manage_wallet',
  VIEW_PROFILE: 'view_profile',
  UPDATE_PROFILE: 'update_profile',

  // Admin permissions
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_DATABASE: 'manage_database',
  MANAGE_TABLES: 'manage_tables',
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',

  // Verifier permissions
  VERIFY_PROJECTS: 'verify_projects',
  VIEW_VERIFIER_PANEL: 'view_verifier_panel',

  // Super admin permissions
  MANAGE_ROLES: 'manage_roles',
  MANAGE_ALL_USERS: 'manage_all_users',
  SYSTEM_ADMINISTRATION: 'system_administration',
}

// Define base permissions for each role
const USER_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.MANAGE_PROJECTS,
  PERMISSIONS.VIEW_MARKETPLACE,
  PERMISSIONS.MANAGE_WALLET,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.UPDATE_PROFILE,
]

const VERIFIER_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.VERIFY_PROJECTS,
  PERMISSIONS.VIEW_VERIFIER_PANEL,
]

const ADMIN_PERMISSIONS = [
  ...USER_PERMISSIONS, // Inherit user permissions
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.VIEW_ANALYTICS,
  PERMISSIONS.MANAGE_DATABASE,
  PERMISSIONS.MANAGE_TABLES,
  PERMISSIONS.VIEW_ADMIN_PANEL,
  PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
]

const SUPER_ADMIN_PERMISSIONS = [
  ...ADMIN_PERMISSIONS, // Inherit admin permissions
  PERMISSIONS.MANAGE_ROLES,
  PERMISSIONS.MANAGE_ALL_USERS,
  PERMISSIONS.SYSTEM_ADMINISTRATION,
]

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: USER_PERMISSIONS,
  [ROLES.VERIFIER]: VERIFIER_PERMISSIONS,
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
  [ROLES.SUPER_ADMIN]: SUPER_ADMIN_PERMISSIONS,
}

// Route-based permission mapping
export const ROUTE_PERMISSIONS = {
  '/dashboard': PERMISSIONS.VIEW_DASHBOARD,
  '/projects': PERMISSIONS.MANAGE_PROJECTS,
  '/marketplace': PERMISSIONS.VIEW_MARKETPLACE,
  '/wallet': PERMISSIONS.MANAGE_WALLET,
  '/admin': PERMISSIONS.VIEW_ADMIN_PANEL,
  '/users': PERMISSIONS.MANAGE_USERS,
  '/analytics': PERMISSIONS.VIEW_ANALYTICS,
  '/database': PERMISSIONS.MANAGE_DATABASE,
  '/tables': PERMISSIONS.MANAGE_TABLES,
  '/verifier': PERMISSIONS.VIEW_VERIFIER_PANEL,
}

// Helper functions
export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

export function hasAnyPermission(userRole, permissions) {
  if (!userRole || !permissions || !Array.isArray(permissions)) return false
  return permissions.some((permission) => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole, permissions) {
  if (!userRole || !permissions || !Array.isArray(permissions)) return false
  return permissions.every((permission) => hasPermission(userRole, permission))
}

export function isAdmin(userRole) {
  return userRole === ROLES.ADMIN || userRole === ROLES.SUPER_ADMIN
}

export function isSuperAdmin(userRole) {
  return userRole === ROLES.SUPER_ADMIN
}

export function isVerifier(userRole) {
  return userRole === ROLES.VERIFIER
}

export function canAccessRoute(userRole, routePath) {
  const permission = ROUTE_PERMISSIONS[routePath]
  if (!permission) return true // No permission required
  return hasPermission(userRole, permission)
}
