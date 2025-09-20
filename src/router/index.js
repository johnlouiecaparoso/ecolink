import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'

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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    { path: '/users', name: 'users', component: UsersView, meta: { requiresAuth: true } },
    { path: '/projects', name: 'projects', component: ProjectsView, meta: { requiresAuth: true } },
    {
      path: '/marketplace',
      name: 'marketplace',
      component: MarketplaceView,
      meta: { requiresAuth: true },
    },
    { path: '/wallet', name: 'wallet', component: WalletView, meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAuth: true } },
    { path: '/verifier', name: 'verifier', component: VerifierView, meta: { requiresAuth: true } },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView,
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

  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // If no valid session, redirect to login
    if (!store.session || !store.session.user) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }

  // If user is logged in and trying to access login/register, redirect to dashboard
  if ((to.name === 'login' || to.name === 'register') && store.session && store.session.user) {
    return { name: 'dashboard' }
  }
})

export default router
