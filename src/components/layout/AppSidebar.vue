<template>
  <aside class="app-sidebar">
    <div class="sidebar-brand">
      <div class="brand-badge"><span class="brand-initials">EC</span></div>
      <div class="brand-text">EcoLink</div>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="nav-item"
        :class="{ active: $route.path === item.route }"
        @click="navigateTo(item.route)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar-spacer"></div>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-details">
          <div class="user-name">{{ userProfile?.full_name || 'User' }}</div>
          <div class="user-role">{{ userRoleDisplay }}</div>
        </div>
      </div>
      <button class="nav-item logout" type="button" @click="onSignOut">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Log out</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getProfile } from '@/services/profileService'
import { ROLES, PERMISSIONS } from '@/constants/roles'

export default {
  name: 'AppSidebar',
  setup() {
    const router = useRouter()
    const store = useUserStore()
    const userProfile = ref(null)

    const allNavItems = [
      {
        id: 'overview',
        label: 'Dashboard',
        route: '/dashboard',
        icon: '🏠',
        permission: PERMISSIONS.VIEW_DASHBOARD,
      },
      {
        id: 'projects',
        label: 'Projects',
        route: '/projects',
        icon: '🌱',
        permission: PERMISSIONS.MANAGE_PROJECTS,
      },
      {
        id: 'wallet',
        label: 'Wallet',
        route: '/wallet',
        icon: '💰',
        permission: PERMISSIONS.MANAGE_WALLET,
      },
      {
        id: 'marketplace',
        label: 'Marketplace',
        route: '/marketplace',
        icon: '🏪',
        permission: PERMISSIONS.VIEW_MARKETPLACE,
      },
      {
        id: 'users',
        label: 'Users',
        route: '/users',
        icon: '👥',
        permission: PERMISSIONS.MANAGE_USERS,
      },
      {
        id: 'verifier',
        label: 'Verifier',
        route: '/verifier',
        icon: '✅',
        permission: PERMISSIONS.VIEW_VERIFIER_PANEL,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        route: '/analytics',
        icon: '📊',
        permission: PERMISSIONS.VIEW_ANALYTICS,
      },
      {
        id: 'admin',
        label: 'Admin',
        route: '/admin',
        icon: '⚙️',
        permission: PERMISSIONS.VIEW_ADMIN_PANEL,
      },
      {
        id: 'database',
        label: 'Database',
        route: '/database',
        icon: '🗄️',
        permission: PERMISSIONS.MANAGE_DATABASE,
      },
      {
        id: 'tables',
        label: 'Tables',
        route: '/tables',
        icon: '📋',
        permission: PERMISSIONS.MANAGE_TABLES,
      },
    ]

    const navItems = computed(() => {
      return allNavItems.filter((item) => {
        if (!item.permission) return true
        return store.hasPermission(item.permission)
      })
    })

    const userInitials = computed(() => {
      if (userProfile.value?.full_name) {
        return userProfile.value.full_name
          .split(' ')
          .map((name) => name[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }
      return 'U'
    })

    const userRoleDisplay = computed(() => {
      const role = userProfile.value?.role || store.role
      switch (role) {
        case ROLES.SUPER_ADMIN:
          return 'Super Admin'
        case ROLES.ADMIN:
          return 'Administrator'
        case ROLES.VERIFIER:
          return 'Verifier'
        case ROLES.USER:
        default:
          return 'User'
      }
    })

    async function loadUserProfile() {
      if (store.session?.user?.id) {
        try {
          const profile = await getProfile(store.session.user.id)
          userProfile.value = profile
        } catch (error) {
          console.error('Error loading user profile:', error)
        }
      }
    }

    function navigateTo(route) {
      router.push(route)
    }

    async function onSignOut() {
      try {
        await store.logout()
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    onMounted(() => {
      loadUserProfile()
    })

    return {
      navItems,
      userProfile,
      userInitials,
      userRoleDisplay,
      navigateTo,
      onSignOut,
    }
  },
}
</script>

<style scoped>
.app-sidebar {
  width: 280px;
  height: 100vh;
  background: #1a202c;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid #2d3748;
}

.brand-badge {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  font-size: 0.875rem;
  font-weight: 500;
}

.nav-item:hover {
  background: #2d3748;
  color: white;
}

.nav-item.active {
  background: #3182ce;
  color: white;
}

.nav-item.logout {
  color: #fc8181;
}

.nav-item.logout:hover {
  background: #742a2a;
  color: white;
}

.nav-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.nav-label {
  flex: 1;
}

.sidebar-spacer {
  flex: 1;
}

.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #2d3748;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  margin-bottom: 0.75rem;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background: #4a5568;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: #a0aec0;
  text-transform: capitalize;
}

/* Responsive */
@media (max-width: 768px) {
  .app-sidebar {
    width: 100%;
    height: auto;
    position: relative;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .nav-item {
    flex: 1;
    min-width: 120px;
    justify-content: center;
    padding: 0.5rem;
  }

  .nav-label {
    display: none;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
