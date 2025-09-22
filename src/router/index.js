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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    // General User routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, roles: [ROLES.GENERAL_USER] },
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

    // Buyer/Investor routes
    {
      path: '/marketplace',
      name: 'marketplace',
      component: MarketplaceView,
      meta: { requiresAuth: true, roles: [ROLES.BUYER_INVESTOR] },
    },
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

  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // If no valid session, redirect to login
    if (!store.session || !store.session.user) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // Check role-based access
    if (to.meta.roles && to.meta.roles.length > 0) {
      const userRole = store.role
      if (!to.meta.roles.includes(userRole)) {
        console.warn(`Access denied: User with role '${userRole}' cannot access route '${to.path}'`)
        // Redirect to appropriate default route based on user role
        const defaultRoute = getDefaultRouteForRole(userRole)
        return { name: defaultRoute.replace('/', '') }
      }
    }
  }

  // If user is logged in and trying to access login/register, redirect to appropriate dashboard
  if ((to.name === 'login' || to.name === 'register') && store.session && store.session.user) {
    const defaultRoute = getDefaultRouteForRole(store.role)
    return { name: defaultRoute.replace('/', '') }
  }
})

export default router
