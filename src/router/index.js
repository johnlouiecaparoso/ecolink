import { createRouter, createWebHistory } from 'vue-router'

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
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/users', name: 'users', component: UsersView },
    { path: '/projects', name: 'projects', component: ProjectsView },
    { path: '/marketplace', name: 'marketplace', component: MarketplaceView },
    { path: '/wallet', name: 'wallet', component: WalletView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/verifier', name: 'verifier', component: VerifierView },
    { path: '/analytics', name: 'analytics', component: AnalyticsView },
  ],
})

export default router
