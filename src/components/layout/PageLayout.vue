<template>
  <div class="page-layout">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content -->
    <div class="main-content">
      <!-- Top Navigation Bar -->
      <header class="top-nav">
        <div class="nav-left">
          <button class="nav-btn home-btn" @click="goHome" title="Go to Home">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">Home</span>
          </button>
          <div class="breadcrumb">
            <span class="breadcrumb-item">{{ pageTitle }}</span>
          </div>
        </div>

        <div class="nav-right">
          <div class="user-info">
            <div class="user-avatar">{{ userInitials }}</div>
            <div class="user-details">
              <div class="user-name">{{ userProfile?.full_name || 'User' }}</div>
              <div class="user-role">{{ userRoleDisplay }}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getProfile } from '@/services/profileService'
import { ROLES } from '@/constants/roles'
import AppSidebar from './AppSidebar.vue'

const router = useRouter()
const route = useRoute()
const store = useUserStore()

const userProfile = ref(null)

const pageTitle = computed(() => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/projects': 'Projects',
    '/wallet': 'Wallet',
    '/marketplace': 'Marketplace',
    '/users': 'User Management',
    '/analytics': 'Analytics & Reports',
    '/verifier': 'Verifier Panel',
    '/admin': 'Admin Panel',
    '/database': 'Database Management',
    '/tables': 'Table Management',
  }
  return titles[route.path] || 'EcoLink'
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

function goHome() {
  router.push('/dashboard')
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.page-layout {
  display: flex;
  min-height: 100vh;
  background: var(--ecolink-bg);
}

.main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.top-nav {
  background: var(--ecolink-surface);
  border-bottom: 1px solid var(--ecolink-border);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--ecolink-primary-500);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.875rem;
}

.nav-btn:hover {
  background: var(--ecolink-primary-600);
  transform: translateY(-1px);
}

.home-btn {
  background: var(--ecolink-primary-500);
}

.nav-icon {
  font-size: 1rem;
}

.nav-text {
  font-weight: 600;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ecolink-muted);
  font-size: 0.875rem;
}

.breadcrumb-item {
  font-weight: 600;
  color: var(--ecolink-text);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--ecolink-primary-50);
  border-radius: 8px;
  border: 1px solid var(--ecolink-primary-200);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  background: var(--ecolink-primary-500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ecolink-text);
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  color: var(--ecolink-muted);
  text-transform: capitalize;
}

.page-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .top-nav {
    padding: 1rem;
  }

  .nav-left {
    gap: 0.5rem;
  }

  .nav-text {
    display: none;
  }

  .breadcrumb {
    display: none;
  }

  .user-details {
    display: none;
  }
}
</style>
