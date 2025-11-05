import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import {
  createProjectDeveloperGuard,
  createAdminGuard,
  createVerifierGuard,
} from '@/middleware/roleGuard'

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
    { path: '/home', name: 'home', component: HomepageView },
    { path: '/', redirect: '/home' },
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
      meta: {
        requiresAuth: true,
        requiresProjectDeveloper: true,
      },
    },
    // Buy Credits route removed - redirecting to marketplace
    // Marketplace has all the functionality for buying credits
    {
      path: '/buy-credits',
      redirect: '/marketplace',
    },
    {
      path: '/credit-portfolio',
      name: 'credit-portfolio',
      component: () => import('@/views/CreditPortfolioView.vue'),
      meta: { requiresAuth: true },
    },
    // Redirect old project routes
    { path: '/projects', redirect: '/marketplace' },
    { path: '/projects/:id', redirect: '/marketplace' },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/components/admin/AdminDashboard.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/components/admin/UserManagement.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/database',
      name: 'admin-database',
      component: () => import('@/components/admin/DatabaseManagement.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    { path: '/admin/tables', redirect: '/admin/database' },
    {
      path: '/admin/audit-logs',
      name: 'admin-audit-logs',
      component: () => import('@/components/admin/AuditLogsView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },
    },
    {
      path: '/verifier',
      name: 'verifier',
      component: () => import('@/views/VerifierPanel.vue'),
      meta: { requiresAuth: true, requiresVerifier: true },
    },
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

    // Certificate and Receipt Routes
    {
      path: '/certificates',
      name: 'certificates',
      component: () => import('@/views/CertificateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/receipts',
      name: 'receipts',
      component: () => import('@/views/ReceiptView.vue'),
      meta: { requiresAuth: true },
    },
    
    // Payment Callback
    {
      path: '/payment/callback',
      name: 'payment-callback',
      component: () => import('@/views/PaymentCallbackView.vue'),
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

// Router guard for authentication
router.beforeEach(async (to, from, next) => {
  console.log('🔍 Router guard checking:', to.name, 'from:', from.name)

  // Skip auth check for public routes
  const publicRoutes = ['login', 'register', 'homepage', 'home']
  if (publicRoutes.includes(to.name)) {
    console.log('✅ Public route, allowing access')
    next()
    return
  }

  // Get user store
  const userStore = useUserStore()
  console.log('📊 User store initial state:', {
    loading: userStore.loading,
    authenticated: userStore.isAuthenticated,
    hasSession: !!userStore.session,
  })

  // If store is loading or session is null, fetch session
  // This handles the case where page refresh happens before App.vue onMounted runs
  if (userStore.loading || !userStore.session) {
    console.log('⏳ Initializing session...')

    // Ensure we fetch the session - this handles page refresh scenarios
    if (!userStore.loading) {
      // Only start fetch if not already loading to avoid duplicate calls
      try {
        await userStore.fetchSession()
      } catch (error) {
        console.error('Error fetching session in router guard:', error)
      }
    } else {
      // Wait for existing fetch to complete
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 5000),
      )

      try {
        await Promise.race([
          new Promise((resolve) => {
            const checkLoading = () => {
              if (!userStore.loading) {
                console.log('✅ Loading completed')
                resolve()
              } else {
                setTimeout(checkLoading, 100) // Check less frequently
              }
            }
            checkLoading()
          }),
          timeout,
        ])
      } catch (error) {
        console.warn('⚠️ Auth check timeout, checking Supabase directly...')

        // Last resort: check Supabase directly if store check times out
        try {
          const { getSupabase } = await import('@/services/supabaseClient')
          const { getSession } = await import('@/services/authService')
          const session = await getSession()

          if (session?.user) {
            // Update store with session found in Supabase
            userStore.session = session
            console.log('✅ Session restored from Supabase storage')
            // Also fetch profile to get role
            await userStore.fetchUserProfile()
          }
        } catch (directCheckError) {
          console.error('Direct Supabase check failed:', directCheckError)
        }
      }
    }
  }

  // Final state check after waiting/fetching
  console.log('🔍 Final auth check:', {
    loading: userStore.loading,
    authenticated: userStore.isAuthenticated,
    hasSession: !!userStore.session,
    userEmail: userStore.session?.user?.email,
  })

  // Check if user is authenticated
  if (userStore.isAuthenticated) {
    console.log('✅ User authenticated, allowing access')

    // Allow homepage access for authenticated users (no redirect)

    // IMPORTANT: Ensure profile is loaded before checking role-specific routes
    // This prevents navigation issues where role isn't loaded yet
    if (to.meta.requiresProjectDeveloper || to.meta.requiresAdmin || to.meta.requiresVerifier) {
      if (!userStore.profile || !userStore.role || userStore.role === 'general_user') {
        console.log('⏳ Profile/role not loaded yet, fetching before route check...')
        try {
          await userStore.fetchUserProfile()
          // Small delay to ensure store is updated
          await new Promise((resolve) => setTimeout(resolve, 150))
        } catch (error) {
          console.error('Error fetching profile in router guard:', error)
        }
      }
    }

    // Check for role-specific route requirements
    if (to.meta.requiresProjectDeveloper) {
      const projectDeveloperGuard = createProjectDeveloperGuard(userStore)
      const guardResult = await projectDeveloperGuard(to, from)
      if (guardResult) {
        console.log('❌ Project Developer access required, redirecting...')
        next(guardResult)
        return
      }
    }

    // Check for admin-only routes
    if (to.meta.requiresAdmin) {
      const adminGuard = createAdminGuard(userStore)
      const guardResult = await adminGuard(to, from)
      if (guardResult) {
        console.log('❌ Admin access required, redirecting...')
        next(guardResult)
        return
      }
    }

    // Check for verifier-only routes
    if (to.meta.requiresVerifier) {
      const verifierGuard = createVerifierGuard(userStore)
      const guardResult = await verifierGuard(to, from)
      if (guardResult) {
        console.log('❌ Verifier access required, redirecting...')
        next(guardResult)
        return
      }
    }

    next()
  } else {
    // Final check: Try Supabase directly before redirecting to login
    // This handles cases where store hasn't loaded yet but session exists in localStorage
    try {
      const { getSupabase } = await import('@/services/supabaseClient')
      const supabase = getSupabase()
      if (supabase) {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (session?.user && !error) {
          console.log('✅ Found session in Supabase, restoring...')
          userStore.session = session
          await userStore.fetchUserProfile()

          // Now that we have session, redirect to role-based route if on homepage
          if (to.name === 'homepage') {
            const { getRoleDefaultRoute } = await import('@/utils/getRoleDefaultRoute')
            const defaultRoute = getRoleDefaultRoute(userStore.role || userStore.profile?.role)
            console.log('✅ Session restored, redirecting to:', defaultRoute)
            next(defaultRoute)
            return
          }

          // Allow access to the requested route
          next()
          return
        }
      }
    } catch (supabaseError) {
      console.warn('⚠️ Could not check Supabase session:', supabaseError)
    }

    // Only redirect to login if we're sure there's no session
    // Don't redirect if user is already on login/register/homepage
    if (to.name !== 'login' && to.name !== 'register' && to.name !== 'homepage') {
      // Add returnTo query param to redirect back after login
      const returnTo = encodeURIComponent(to.fullPath)
      console.log('❌ User not authenticated, redirecting to login')
      next({ name: 'login', query: { returnTo } })
    } else {
      // Allow access to login/register/homepage pages
      next()
    }
  }
})

export default router
