import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import {
  createRoleGuard,
  createAdminGuard,
  createVerifierGuard,
  getDefaultRouteForRole,
} from '@/middleware/roleGuard'
import { ROLES } from '@/constants/roles'

const HomeView = () => import('@/views/HomeView.vue')
const HomepageView = () => import('@/views/HomepageView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const UsersView = () => import('@/views/UsersView.vue')
const ProjectsView = () => import('@/views/ProjectsView.vue')
const MarketplaceView = () => import('@/views/MarketplaceView.vue')
const WalletView = () => import('@/views/WalletView.vue')
const AdminView = () => import('@/views/AdminView.vue')
const VerifierView = () => import('@/views/VerifierView.vue')
const AnalyticsView = () => import('@/views/AnalyticsView.vue')
const DatabaseManagementView = () => import('@/views/DatabaseManagementView.vue')
const TableManagementView = () => import('@/views/TableManagementView.vue')
const AuditLogsView = () => import('@/views/AuditLogsView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'homepage', component: HomepageView },
    { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    // General User routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: WalletView,
      meta: { requiresAuth: true, roles: [ROLES.GENERAL_USER] },
    },
    {
      path: '/certificates',
      name: 'certificates',
      component: () => import('@/views/CertificatesView.vue'),
      meta: { requiresAuth: true, roles: [ROLES.GENERAL_USER] },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: ProfileView, // Using ProfileView for now, can create separate SettingsView later
      meta: { requiresAuth: true },
    },

    // Project Developer routes
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView,
      meta: { requiresAuth: true, roles: [ROLES.PROJECT_DEVELOPER] },
    },
    {
      path: '/sales',
      name: 'sales',
      component: () => import('@/views/SalesView.vue'),
      meta: { requiresAuth: true, roles: [ROLES.PROJECT_DEVELOPER] },
    },

    // Marketplace (publicly accessible)
    {
      path: '/marketplace',
      name: 'marketplace',
      component: MarketplaceView,
    },
    {
      path: '/project/:id',
      name: 'project-detail',
      component: () => import('@/views/ProjectDetailView.vue'),
    },
    {
      path: '/retire',
      name: 'retire',
      component: () => import('@/views/RetireView.vue'),
    },

    // Buyer/Investor routes
    {
      path: '/buy-credits',
      name: 'buy-credits',
      component: () => import('@/views/BuyCreditsView.vue'),
      meta: { requiresAuth: true, roles: [ROLES.BUYER_INVESTOR] },
    },
    {
      path: '/receipts',
      name: 'receipts',
      component: () => import('@/views/ReceiptsView.vue'),
      meta: { requiresAuth: true, roles: [ROLES.BUYER_INVESTOR] },
    },

    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView,
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },
    {
      path: '/database',
      name: 'database',
      component: DatabaseManagementView,
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },
    {
      path: '/tables',
      name: 'tables',
      component: TableManagementView,
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },
    {
      path: '/audit-logs',
      name: 'audit-logs',
      component: AuditLogsView,
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
    },

    // Verifier routes
    {
      path: '/verifier',
      name: 'verifier',
      component: VerifierView,
      meta: { requiresAuth: true, roles: [ROLES.VERIFIER] },
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
  const publicRoutes = ['login', 'register']

  // If user is not authenticated and trying to access a protected route
  if (!store.session || !store.session.user) {
    // If trying to access homepage or any route that's not login/register, redirect to login
    if (to.name === 'homepage' || (!publicRoutes.includes(to.name) && !to.meta.requiresAuth)) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // If trying to access a route that requires auth, redirect to login
    if (to.meta.requiresAuth) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  } else {
    // User is authenticated
    // If trying to access login/register, redirect to homepage (new interface)
    if (publicRoutes.includes(to.name)) {
      return { name: 'homepage' }
    }

    // Allow authenticated users to access homepage (new interface)
    // Remove the redirect to old dashboard

    // Temporarily redirect old dashboard routes to homepage (new interface)
    // Note: /wallet and /profile are kept accessible as they are part of the new interface
    const oldDashboardRoutes = [
      '/dashboard',
      '/certificates',
      '/projects',
      '/sales',
      '/admin',
      '/users',
      '/analytics',
      '/database',
      '/tables',
      '/audit-logs',
      '/verifier',
      '/buy-credits',
      '/receipts',
    ]
    if (oldDashboardRoutes.includes(to.path)) {
      return { name: 'homepage' }
    }

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
