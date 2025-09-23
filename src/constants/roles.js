// User roles and permissions
export const ROLES = {
  GENERAL_USER: 'user', // Changed to match database
  PROJECT_DEVELOPER: 'project_developer',
  VERIFIER: 'verifier',
  BUYER_INVESTOR: 'buyer_investor',
  ADMIN: 'admin',
}

// Permission definitions
export const PERMISSIONS = {
  // General User permissions
  SIGN_UP: 'sign_up',
  VIEW_CREDITS: 'view_credits',
  MANAGE_WALLET: 'manage_wallet',
  BUY_VIA_GCASH_MAYA: 'buy_via_gcash_maya',
  VIEW_CERTIFICATES: 'view_certificates',

  // Project Developer permissions
  SUBMIT_PROJECTS: 'submit_projects',
  TRACK_STATUS: 'track_status',
  CREDIT_ISSUANCE: 'credit_issuance',
  SALES_DASHBOARD: 'sales_dashboard',

  // Verifier permissions
  ACCESS_PROJECTS: 'access_projects',
  REVIEW_PROJECTS: 'review_projects',
  APPROVE_PROJECTS: 'approve_projects',
  UPLOAD_REPORTS: 'upload_reports',

  // Buyer/Investor permissions
  SEARCH_PROJECTS: 'search_projects',
  BUY_CREDITS: 'buy_credits',
  DOWNLOAD_RECEIPTS: 'download_receipts',

  // Admin permissions
  AUDIT_LOGS: 'audit_logs',
  APPROVE_USERS: 'approve_users',
  APPROVE_PROJECTS: 'approve_projects',
  GENERATE_REPORTS: 'generate_reports',
  MANAGE_USERS: 'manage_users',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_DATABASE: 'manage_database',
  MANAGE_TABLES: 'manage_tables',
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',

  // Common permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_PROFILE: 'view_profile',
  UPDATE_PROFILE: 'update_profile',
}

// Define base permissions for each role
const GENERAL_USER_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.UPDATE_PROFILE,
  PERMISSIONS.SIGN_UP,
  PERMISSIONS.VIEW_CREDITS,
  PERMISSIONS.MANAGE_WALLET,
  PERMISSIONS.BUY_VIA_GCASH_MAYA,
  PERMISSIONS.VIEW_CERTIFICATES,
]

const PROJECT_DEVELOPER_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.UPDATE_PROFILE,
  PERMISSIONS.SUBMIT_PROJECTS,
  PERMISSIONS.TRACK_STATUS,
  PERMISSIONS.CREDIT_ISSUANCE,
  PERMISSIONS.SALES_DASHBOARD,
]

const VERIFIER_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.UPDATE_PROFILE,
  PERMISSIONS.ACCESS_PROJECTS,
  PERMISSIONS.REVIEW_PROJECTS,
  PERMISSIONS.APPROVE_PROJECTS,
  PERMISSIONS.UPLOAD_REPORTS,
]

const BUYER_INVESTOR_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.UPDATE_PROFILE,
  PERMISSIONS.SEARCH_PROJECTS,
  PERMISSIONS.BUY_CREDITS,
  PERMISSIONS.DOWNLOAD_RECEIPTS,
]

const ADMIN_PERMISSIONS = [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.UPDATE_PROFILE,
  PERMISSIONS.AUDIT_LOGS,
  PERMISSIONS.APPROVE_USERS,
  PERMISSIONS.APPROVE_PROJECTS,
  PERMISSIONS.GENERATE_REPORTS,
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.VIEW_ANALYTICS,
  PERMISSIONS.MANAGE_DATABASE,
  PERMISSIONS.MANAGE_TABLES,
  PERMISSIONS.VIEW_ADMIN_PANEL,
  PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
]

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.GENERAL_USER]: GENERAL_USER_PERMISSIONS,
  [ROLES.PROJECT_DEVELOPER]: PROJECT_DEVELOPER_PERMISSIONS,
  [ROLES.VERIFIER]: VERIFIER_PERMISSIONS,
  [ROLES.BUYER_INVESTOR]: BUYER_INVESTOR_PERMISSIONS,
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
}

// Route-based permission mapping
export const ROUTE_PERMISSIONS = {
  '/dashboard': PERMISSIONS.VIEW_DASHBOARD,
  '/projects': PERMISSIONS.SUBMIT_PROJECTS,
  '/marketplace': PERMISSIONS.SEARCH_PROJECTS,
  '/wallet': PERMISSIONS.MANAGE_WALLET,
  '/admin': PERMISSIONS.VIEW_ADMIN_PANEL,
  '/users': PERMISSIONS.MANAGE_USERS,
  '/analytics': PERMISSIONS.VIEW_ANALYTICS,
  '/database': PERMISSIONS.MANAGE_DATABASE,
  '/tables': PERMISSIONS.MANAGE_TABLES,
  '/verifier': PERMISSIONS.ACCESS_PROJECTS,
  '/certificates': PERMISSIONS.VIEW_CERTIFICATES,
  '/sales': PERMISSIONS.SALES_DASHBOARD,
  '/buy-credits': PERMISSIONS.BUY_CREDITS,
  '/receipts': PERMISSIONS.DOWNLOAD_RECEIPTS,
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
  return userRole === ROLES.ADMIN
}

export function isGeneralUser(userRole) {
  return userRole === ROLES.GENERAL_USER
}

export function isProjectDeveloper(userRole) {
  return userRole === ROLES.PROJECT_DEVELOPER
}

export function isVerifier(userRole) {
  return userRole === ROLES.VERIFIER
}

export function isBuyerInvestor(userRole) {
  return userRole === ROLES.BUYER_INVESTOR
}

export function canAccessRoute(userRole, routePath) {
  const permission = ROUTE_PERMISSIONS[routePath]
  if (!permission) return true // No permission required
  return hasPermission(userRole, permission)
}

export function getDefaultRouteForRole(userRole) {
  // Redirect all users to homepage (new interface) instead of old dashboard
  return '/'
}

// Helper function to get role display name
export function getRoleDisplayName(userRole) {
  switch (userRole) {
    case ROLES.ADMIN:
      return 'Administrator'
    case ROLES.VERIFIER:
      return 'Verifier'
    case ROLES.PROJECT_DEVELOPER:
      return 'Project Developer'
    case ROLES.BUYER_INVESTOR:
      return 'Buyer/Investor'
    case ROLES.GENERAL_USER:
    default:
      return 'General User'
  }
}

// Helper function to check if role is a standard user (not admin/verifier)
export function isStandardUser(userRole) {
  return [ROLES.GENERAL_USER, ROLES.PROJECT_DEVELOPER, ROLES.BUYER_INVESTOR].includes(userRole)
}

// Helper function to check if role is a management user
export function isManagementUser(userRole) {
  return [ROLES.ADMIN, ROLES.VERIFIER].includes(userRole)
}
