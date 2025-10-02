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

// Hidden Components (Dashboard System) - Optimized lazy loading
const DashboardView = () =>
  import(/* webpackChunkName: "dashboard" */ '@/_hidden/views/DashboardView.vue')
const ProjectsView = () =>
  import(/* webpackChunkName: "projects" */ '@/_hidden/views/ProjectsView.vue')
const ProjectDetailView = () =>
  import(/* webpackChunkName: "projects" */ '@/_hidden/views/ProjectDetailView.vue')
const VerifierView = () =>
  import(/* webpackChunkName: "admin" */ '@/_hidden/views/VerifierView.vue')
const AdminView = () => import(/* webpackChunkName: "admin" */ '@/_hidden/views/AdminView.vue')
const AnalyticsView = () =>
  import(/* webpackChunkName: "analytics" */ '@/_hidden/views/AnalyticsView.vue')
const UsersView = () => import(/* webpackChunkName: "admin" */ '@/_hidden/views/UsersView.vue')
const DatabaseManagementView = () =>
  import(/* webpackChunkName: "admin" */ '@/_hidden/views/DatabaseManagementView.vue')
const TableManagementView = () =>
  import(/* webpackChunkName: "admin" */ '@/_hidden/views/TableManagementView.vue')
const AuditLogsView = () =>
  import(/* webpackChunkName: "admin" */ '@/_hidden/views/AuditLogsView.vue')
const CertificatesView = () =>
  import(/* webpackChunkName: "user" */ '@/_hidden/views/CertificatesView.vue')
const SalesView = () => import(/* webpackChunkName: "user" */ '@/_hidden/views/SalesView.vue')
const BuyCreditsView = () =>
  import(/* webpackChunkName: "user" */ '@/_hidden/views/BuyCreditsView.vue')
const ReceiptsView = () => import(/* webpackChunkName: "user" */ '@/_hidden/views/ReceiptsView.vue')
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

    // Authenticated User Routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
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
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: ProjectDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/buy-credits',
      name: 'buy-credits',
      component: BuyCreditsView,
      meta: { requiresAuth: true },
    },

    // Admin Routes
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: UsersView,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/admin/database',
      name: 'admin-database',
      component: DatabaseManagementView,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/admin/tables',
      name: 'admin-tables',
      component: TableManagementView,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/admin/audit-logs',
      name: 'admin-audit-logs',
      component: AuditLogsView,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
      },
    },

    // Verifier Routes
    {
      path: '/verifier',
      name: 'verifier',
      component: VerifierView,
      meta: {
        requiresAuth: true,
        roles: ['verifier', 'admin'],
      },
    },

    // Analytics Routes
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView,
      meta: {
        requiresAuth: true,
        roles: ['admin', 'project_developer'],
      },
    },

    // Sales Routes
    {
      path: '/sales',
      name: 'sales',
      component: SalesView,
      meta: {
        requiresAuth: true,
        roles: ['project_developer', 'admin'],
      },
    },

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
