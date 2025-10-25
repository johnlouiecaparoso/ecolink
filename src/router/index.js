import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'

// Lazy load components for better performance
const HomepageView = () => import(/* webpackChunkName: "homepage" */ '@/views/HomepageView.vue')
const LoginView = () => import(/* webpackChunkName: "auth" */ '@/views/LoginView.vue')
const RegisterView = () => import(/* webpackChunkName: "auth" */ '@/views/RegisterView.vue')
const MarketplaceView = () =>
  import(/* webpackChunkName: "marketplace" */ '@/views/MarketplaceView.vue')
const WalletView = () => import(/* webpackChunkName: "user" */ '@/views/WalletView.vue')
const ProfileView = () => import(/* webpackChunkName: "user" */ '@/views/ProfileView.vue')

// Hidden Components removed - all old dashboard routes now redirect to homepage
const EmailSettingsView = () =>
  import(/* webpackChunkName: "settings" */ '@/views/EmailSettingsView.vue')
const PaymentSettingsView = () =>
  import(/* webpackChunkName: "settings" */ '@/views/PaymentSettingsView.vue')
const UserPreferencesView = () =>
  import(/* webpackChunkName: "user" */ '@/views/UserPreferencesView.vue')
const SocialView = () => import(/* webpackChunkName: "user" */ '@/views/SocialView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public Routes
    { path: '/', name: 'homepage', component: HomepageView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    {
      path: '/marketplace',
      name: 'marketplace',
      component: () => import('@/views/MarketplaceViewEnhanced.vue'),
    },
    { path: '/retire', name: 'retire', component: () => import('@/views/RetireView.vue') },
    {
      path: '/mobile-test',
      name: 'mobile-test',
      component: () => import('@/views/MobileTestView.vue'),
    },

    // Redirect old dashboard routes to homepage
    {
      path: '/dashboard',
      redirect: '/',
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: WalletView,
      meta: { requiresAuth: true },
    },
    // Project and Credit Routes
    {
      path: '/submit-project',
      name: 'submit-project',
      component: () => import('@/views/SubmitProjectView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/buy-credits',
      name: 'buy-credits',
      component: () => import('@/views/BuyCreditsView.vue'),
      meta: { requiresAuth: true },
    },
    // Redirect old project routes
    { path: '/projects', redirect: '/submit-project' },
    { path: '/projects/:id', redirect: '/submit-project' },
    { path: '/admin', redirect: '/' },
    { path: '/admin/users', redirect: '/' },
    { path: '/admin/database', redirect: '/' },
    { path: '/admin/tables', redirect: '/' },
    { path: '/admin/audit-logs', redirect: '/' },
    { path: '/verifier', redirect: '/' },
    { path: '/analytics', redirect: '/' },
    { path: '/sales', redirect: '/' },

    // Settings Routes
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

    // Redirect old certificate and receipt routes
    { path: '/certificates', redirect: '/' },
    { path: '/receipts', redirect: '/' },

    // User Preference & Social Routes
    {
      path: '/preferences',
      name: 'preferences',
      component: UserPreferencesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/social',
      name: 'social',
      component: SocialView,
      meta: { requiresAuth: true },
    },
  ],
})

// Router guard is temporarily disabled to fix Pinia initialization issues
// Authentication will be handled at the component level for now

export default router
