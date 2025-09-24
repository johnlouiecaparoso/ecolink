import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import {
  createRoleGuard,
  createAdminGuard,
  createVerifierGuard,
  getDefaultRouteForRole,
} from '@/middleware/roleGuard'
import { ROLES } from '@/constants/roles'

// New Interface Components Only
const HomepageView = () => import('@/views/HomepageView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const MarketplaceView = () => import('@/views/MarketplaceView.vue')
const WalletView = () => import('@/views/WalletView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // New Interface Routes Only
    { path: '/', name: 'homepage', component: HomepageView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },

    // Public Marketplace
    { path: '/marketplace', name: 'marketplace', component: MarketplaceView },
    { path: '/retire', name: 'retire', component: () => import('@/views/RetireView.vue') },

    // User Routes (New Interface)
    { path: '/wallet', name: 'wallet', component: WalletView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach(async (to) => {
  const store = useUserStore()

  // Try to fetch session if we don't have one
  if (store.session === null) {
    await store.fetchSession()
  }

  // Public routes that don't require authentication
  const publicRoutes = ['login', 'register', 'homepage', 'marketplace', 'retire']

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

    // Allow authenticated users to access homepage (new interface)
    // Remove the redirect to old dashboard

    // Redirect ALL old dashboard routes to homepage (new interface)
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
      '/home', // Old home route
      '/project-detail', // Old project detail route
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
