import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getDefaultRouteForRole } from '@/middleware/roleGuard'
import { ROLES } from '@/constants/roles'

// New Interface Components
const HomepageView = () => import('@/views/HomepageView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const MarketplaceView = () => import('@/views/MarketplaceView.vue')
const WalletView = () => import('@/views/WalletView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')

// Hidden Components (Dashboard System)
const ProjectsView = () => import('@/_hidden/views/ProjectsView.vue')
const ProjectDetailView = () => import('@/_hidden/views/ProjectDetailView.vue')
const VerifierView = () => import('@/_hidden/views/VerifierView.vue')
const AdminView = () => import('@/_hidden/views/AdminView.vue')
const AnalyticsView = () => import('@/_hidden/views/AnalyticsView.vue')
const UsersView = () => import('@/_hidden/views/UsersView.vue')
const DatabaseManagementView = () => import('@/_hidden/views/DatabaseManagementView.vue')
const TableManagementView = () => import('@/_hidden/views/TableManagementView.vue')
const AuditLogsView = () => import('@/_hidden/views/AuditLogsView.vue')
const CertificatesView = () => import('@/_hidden/views/CertificatesView.vue')
const SalesView = () => import('@/_hidden/views/SalesView.vue')
const BuyCreditsView = () => import('@/_hidden/views/BuyCreditsView.vue')
const ReceiptsView = () => import('@/_hidden/views/ReceiptsView.vue')
const EmailSettingsView = () => import('@/views/EmailSettingsView.vue')
const PaymentSettingsView = () => import('@/views/PaymentSettingsView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public Routes
    { path: '/', name: 'homepage', component: HomepageView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/marketplace', name: 'marketplace', component: MarketplaceView },
    { path: '/retire', name: 'retire', component: () => import('@/views/RetireView.vue') },

    // Authenticated User Routes
    { path: '/wallet', name: 'wallet', component: WalletView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    {
      path: '/email-settings',
      name: 'email-settings',
      component: EmailSettingsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/payment-settings',
      name: 'payment-settings',
      component: PaymentSettingsView,
      meta: { requiresAuth: true },
    },

    // Project Management Routes
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.PROJECT_DEVELOPER, ROLES.ADMIN],
      },
    },
    {
      path: '/project-detail/:id',
      name: 'project-detail',
      component: ProjectDetailView,
      meta: { requiresAuth: true },
    },

    // Verifier Routes
    {
      path: '/verifier',
      name: 'verifier',
      component: VerifierView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.VERIFIER, ROLES.ADMIN],
      },
    },

    // Admin Routes
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.ADMIN],
      },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.ADMIN],
      },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.ADMIN],
      },
    },
    {
      path: '/database',
      name: 'database',
      component: DatabaseManagementView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.ADMIN],
      },
    },
    {
      path: '/tables',
      name: 'tables',
      component: TableManagementView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.ADMIN],
      },
    },
    {
      path: '/audit-logs',
      name: 'audit-logs',
      component: AuditLogsView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.ADMIN],
      },
    },

    // Marketplace & Trading Routes
    {
      path: '/buy-credits',
      name: 'buy-credits',
      component: BuyCreditsView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.BUYER_INVESTOR, ROLES.GENERAL_USER, ROLES.ADMIN],
      },
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesView,
      meta: {
        requiresAuth: true,
        roles: [ROLES.PROJECT_DEVELOPER, ROLES.ADMIN],
      },
    },

    // Certificate & Receipt Routes
    {
      path: '/certificates',
      name: 'certificates',
      component: CertificatesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/receipts',
      name: 'receipts',
      component: ReceiptsView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const store = useUserStore()

  // Try to fetch session if we don't have one
  if (store.session === null) {
    await store.fetchSession()
  }

  // Public routes that don't require authentication
  // const publicRoutes = ['login', 'register', 'homepage', 'marketplace', 'retire']

  // If user is not authenticated
  if (!store.session || !store.session.user) {
    // Allow access to login/register pages
    if (to.name === 'login' || to.name === 'register') {
      return // Allow access
    }

    // Redirect all other routes to login
    return { name: 'login', query: { redirect: to.fullPath } }
  } else {
    // User is authenticated
    // If trying to access login/register, redirect to homepage
    if (to.name === 'login' || to.name === 'register') {
      return { name: 'homepage' }
    }

    // Allow authenticated users to access all routes
    // Route access is now controlled by role-based meta properties

    // Check role-based access for protected routes
    if (to.meta.requiresAuth && to.meta.roles && to.meta.roles.length > 0) {
      const userRole = store.role
      if (!to.meta.roles.includes(userRole)) {
        console.warn(`Access denied: User with role '${userRole}' cannot access route '${to.path}'`)
        // Redirect to appropriate default route based on user role
        const defaultRoute = getDefaultRouteForRole(userRole)
        return { path: defaultRoute }
      }
    }
  }
})

export default router
