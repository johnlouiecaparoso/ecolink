<template>
  <header class="header">
    <div class="header-container">
      <!-- Mobile Header Layout -->
      <div class="mobile-header-layout">
        <!-- Left Section: Hamburger Menu and Logo -->
        <div class="mobile-left-section">
          <button @click="toggleMobileMenu" class="mobile-hamburger-btn">
            <svg class="hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          <router-link to="/" class="mobile-logo">
            <div class="mobile-logo-container">
              <img
                src="/src/assets/images/ecolink-logo.png"
                alt="EcoLink Logo"
                class="mobile-logo-image"
              />
            </div>
          </router-link>
        </div>

        <!-- Right Section: Search and User Profile -->
        <div class="mobile-right-section">
          <div class="mobile-search-wrapper">
            <svg class="mobile-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <input
              placeholder="Search projects..."
              v-model="searchQuery"
              class="mobile-search-input"
            />
          </div>

          <div v-if="userStore.isAuthenticated" class="mobile-user-section">
            <div class="mobile-user-info">
              <div class="mobile-user-name">{{ userStore.profile?.full_name || 'User' }}</div>
              <div class="mobile-user-role">{{ getRoleDisplayName(userStore.role) }}</div>
            </div>
            <div class="mobile-user-avatar" @click="showUserMenu = !showUserMenu">
              <svg class="mobile-avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <!-- User Dropdown Menu -->
            <div v-if="showUserMenu" class="mobile-user-dropdown">
              <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                Profile Settings
              </router-link>
              <router-link to="/wallet" class="dropdown-item" @click="showUserMenu = false">
                Wallet
              </router-link>
              <router-link to="/preferences" class="dropdown-item" @click="showUserMenu = false">
                Preferences
              </router-link>
              <router-link to="/analytics" class="dropdown-item" @click="showUserMenu = false">
                Analytics
              </router-link>
              <router-link to="/social" class="dropdown-item" @click="showUserMenu = false">
                Social Impact
              </router-link>
              <button @click="handleLogout" class="dropdown-item logout">Logout</button>
            </div>
          </div>
          <div v-else class="mobile-auth-buttons">
            <router-link to="/login" class="mobile-auth-link">Login</router-link>
            <router-link to="/register" class="mobile-auth-link primary">Sign Up</router-link>
          </div>
        </div>
      </div>

      <!-- Desktop Navigation (Hidden on Mobile) -->
      <div class="desktop-header-layout">
        <!-- Logo -->
        <router-link to="/" class="logo desktop-logo">
          <div class="logo-container">
            <div class="logo-image-container">
              <img
                src="/src/assets/images/ecolink-logo.png"
                alt="EcoLink Logo"
                class="logo-image"
              />
            </div>
          </div>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="['nav-link', { active: isActive(item.path) }]"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Desktop Actions -->
        <div class="desktop-actions">
          <div class="search-wrapper">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <input placeholder="Search projects..." v-model="searchQuery" class="search-input" />
          </div>
          <div v-if="userStore.isAuthenticated" class="user-menu">
            <div class="user-info">
              <span class="user-name">{{ userStore.profile?.full_name || 'User' }}</span>
              <span class="user-role">{{ getRoleDisplayName(userStore.role) }}</span>
            </div>
            <div class="user-avatar" @click="showUserMenu = !showUserMenu">
              <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <!-- User Dropdown Menu -->
            <div v-if="showUserMenu" class="user-dropdown">
              <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                Profile Settings
              </router-link>
              <router-link to="/wallet" class="dropdown-item" @click="showUserMenu = false">
                Wallet
              </router-link>
              <router-link to="/certificates" class="dropdown-item" @click="showUserMenu = false">
                Certificates
              </router-link>
              <router-link to="/receipts" class="dropdown-item" @click="showUserMenu = false">
                Receipts
              </router-link>
              <!-- Hidden for now: Preferences, Analytics, Social Impact -->
              <!-- <router-link to="/preferences" class="dropdown-item" @click="showUserMenu = false">
                Preferences
              </router-link>
              <router-link to="/analytics" class="dropdown-item" @click="showUserMenu = false">
                Analytics
              </router-link>
              <router-link to="/social" class="dropdown-item" @click="showUserMenu = false">
                Social Impact
              </router-link> -->
              <button @click="handleLogout" class="dropdown-item logout">Logout</button>
            </div>
          </div>
          <div v-else class="auth-buttons">
            <router-link to="/login" class="auth-link">Login</router-link>
            <router-link to="/register" class="auth-link primary">Sign Up</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false">
      <div class="mobile-menu" @click.stop>
        <div class="mobile-content">
          <div class="mobile-header">
            <div class="mobile-title-container">
              <div class="mobile-logo">
                <img
                  src="/src/assets/images/ecolink-logo.png"
                  alt="EcoLink Logo"
                  class="mobile-logo-image"
                />
              </div>
              <h3 class="mobile-title">EcoLink</h3>
            </div>
            <button @click="mobileMenuOpen = false" class="mobile-close">
              <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <div class="mobile-search">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <input placeholder="Search projects..." v-model="searchQuery" class="search-input" />
          </div>
          <nav class="mobile-nav">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              :class="['mobile-nav-link', { active: isActive(item.path) }]"
              @click="mobileMenuOpen = false"
            >
              {{ item.label }}
            </router-link>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getRoleDisplayName } from '@/constants/roles'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const showUserMenu = ref(false)

// Toggle mobile menu
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Role-based navigation items
const navItems = computed(() => {
  // Base navigation items that are always shown
  const baseItems = [
    { path: '/', label: 'Home' },
    { path: '/marketplace', label: 'Marketplace' },
  ]

  // If user is not authenticated, only show base items
  if (!userStore.isAuthenticated) {
    return baseItems
  }

  // If user is authenticated, show main functionality items only
  const authenticatedItems = [
    ...baseItems, // Home, Marketplace
    { path: '/projects', label: 'Submit Project' },
    { path: '/retire', label: 'Retire' },
    { path: '/buy-credits', label: 'Buy Credits' },
  ]

  // Add verifier-specific navigation for verifiers and admins
  if (userStore.isVerifier || userStore.isAdmin) {
    authenticatedItems.splice(3, 0, { path: '/verifier', label: 'Verifier Panel' })
  }

  // EXPLICITLY exclude certificates and receipts from main nav (they're in profile dropdown)
  return authenticatedItems.filter(
    (item) => !item.path.includes('/certificates') && !item.path.includes('/receipts'),
  )
})

function isActive(path) {
  return route.path === path
}

function handleLogout() {
  console.log('🚨 LOGOUT BUTTON CLICKED! Starting logout process...')

  // Close the dropdown menu immediately
  showUserMenu.value = false

  // Clear all storage immediately
  try {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear()
      // Clear sessionStorage
      sessionStorage.clear()
      console.log('Storage cleared')
    }
  } catch (storageError) {
    console.warn('Storage clear error:', storageError)
  }

  // Perform logout from user store (don't wait for it)
  userStore.logout().catch((error) => {
    console.error('User store logout error:', error)
  })

  // Force immediate redirect to login page
  console.log('Redirecting to login page...')

  // Use the most reliable redirect method with a longer delay
  setTimeout(() => {
    console.log('Executing redirect now...')
    try {
      // Force a complete page reload to the login page
      window.location.replace('/login')
      console.log('Redirect initiated successfully')
    } catch (error) {
      console.error('Redirect failed, trying alternative:', error)
      window.location.href = '/login'
    }
  }, 200)
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 2px solid var(--border-green-light);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-green);
}

.header-container {
  max-width: 100%;
  margin: 0;
  display: flex;
  height: 5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  position: relative;
  width: 100%;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-container {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0.5rem 1rem;
  width: auto;
}

.logo-image-container {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 3px solid #10b981;
  padding: 0.35rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
  margin: 0;
}

.logo-image-container:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.logo-name {
  font-weight: 800;
  font-size: 1.25rem;
  color: #10b981;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.logo-buildings {
  position: absolute;
  bottom: 0.2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 0.15rem;
}

.building {
  background: #006400;
  border-radius: 0.1rem 0.1rem 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.1rem 0.05rem 0.05rem 0.05rem;
  gap: 0.05rem;
}

.building-left {
  width: 0.4rem;
  height: 0.8rem;
}

.building-right {
  width: 0.3rem;
  height: 0.6rem;
}

.window {
  width: 0.08rem;
  height: 0.08rem;
  background: #90ee90;
  border-radius: 0.02rem;
}

.logo-leaf {
  position: absolute;
  bottom: -0.1rem;
  left: 0.1rem;
  width: 0.3rem;
  height: 0.4rem;
  background: linear-gradient(45deg, #90ee90 0%, #228b22 100%);
  border-radius: 0 100% 0 100%;
  transform: rotate(-45deg);
}

.logo-leaf::before {
  content: '';
  position: absolute;
  top: 0.25rem;
  left: 0.1rem;
  width: 0.05rem;
  height: 0.15rem;
  background: #228b22;
  border-radius: 0.025rem;
}

.sparkles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  background: #90ee90;
  border-radius: 50%;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle-1 {
  width: 0.08rem;
  height: 0.08rem;
  top: 0.2rem;
  right: 0.3rem;
  animation-delay: 0s;
}

.sparkle-2 {
  width: 0.06rem;
  height: 0.06rem;
  top: 0.4rem;
  left: 0.2rem;
  animation-delay: 0.5s;
}

.sparkle-3 {
  width: 0.05rem;
  height: 0.05rem;
  top: 0.1rem;
  left: 0.4rem;
  animation-delay: 1s;
}

.sparkle-4 {
  width: 0.07rem;
  height: 0.07rem;
  top: 0.5rem;
  right: 0.1rem;
  animation-delay: 1.5s;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  position: relative;
}

.nav-link:hover {
  color: var(--primary-color);
  background: var(--bg-green-light);
  transform: translateY(-1px);
}

.nav-link.active {
  color: var(--text-light);
  background: var(--primary-color);
  font-weight: 600;
  box-shadow: var(--shadow-green);
}

.nav-link.active:hover {
  background: var(--primary-hover);
  color: var(--text-light);
}

/* Desktop Actions */
.desktop-actions {
  display: none;
  align-items: center;
  gap: 1rem;
  margin: 0;
  padding: 0.5rem 1rem;
  width: auto;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}

.search-input {
  width: 16rem;
  height: 2.25rem;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  font-size: var(--font-size-sm);
  border: 2px solid var(--border-green-light);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  outline: none;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-green);
  background: var(--bg-primary);
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: capitalize;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.user-avatar:hover {
  background: var(--bg-accent);
}

.avatar-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 12rem;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  text-decoration: none;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
  border-bottom: 1px solid var(--border-light);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

.dropdown-item.logout {
  color: var(--text-muted);
}

.dropdown-item.logout:hover {
  color: #dc2626;
  background: #fef2f2;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.auth-link {
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: var(--transition);
}

.auth-link:hover {
  background: var(--bg-accent);
}

.auth-link.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.auth-link.primary:hover {
  background: var(--primary-hover);
}

/* Mobile Header Layout */
.mobile-header-layout {
  display: none;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  padding: 0;
  margin: 0;
}

/* Show mobile header on mobile screens */
@media (max-width: 1024px) {
  .mobile-header-layout {
    display: flex !important;
  }
}

.mobile-left-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin: 0;
  padding: 0.5rem 1rem;
}

.mobile-hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--radius-md);
}

.mobile-hamburger-btn:hover {
  background: var(--bg-accent);
  color: var(--primary-color);
}

.hamburger-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-primary);
}

.mobile-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.mobile-logo-container {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 3px solid #10b981;
  padding: 0.3rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.mobile-logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.mobile-home-btn {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: var(--transition);
  white-space: nowrap;
}

.mobile-home-btn:hover {
  background: var(--primary-hover);
  color: white;
}

.mobile-right-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin: 0;
  padding: 0.5rem 1rem;
}

.mobile-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.mobile-search-icon {
  position: absolute;
  left: 0.5rem;
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
  z-index: 1;
}

.mobile-search-input {
  width: 8rem;
  height: 2rem;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  outline: none;
  transition: var(--transition);
}

.mobile-search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(6, 158, 45, 0.1);
}

.mobile-user-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.mobile-user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.mobile-user-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.2;
}

.mobile-user-role {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: capitalize;
  line-height: 1.2;
}

.mobile-user-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid var(--border-green-light);
}

.mobile-user-avatar:hover {
  background: var(--bg-accent);
  border-color: var(--primary-color);
}

.mobile-avatar-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--text-muted);
}

.mobile-user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 10rem;
}

.mobile-auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-auth-link {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: var(--transition);
}

.mobile-auth-link:hover {
  background: var(--bg-accent);
}

.mobile-auth-link.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.mobile-auth-link.primary:hover {
  background: var(--primary-hover);
}

/* Desktop Header Layout */
.desktop-header-layout {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

/* Hide desktop header on mobile */
@media (max-width: 1024px) {
  .desktop-header-layout {
    display: none !important;
  }
}

/* Mobile Actions Container */
.mobile-actions-left {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-actions-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: absolute;
    top: 50%;
    left: var(--spacing-md);
    transform: translateY(-50%);
  }

  /* Hide logo on mobile */
  .desktop-logo {
    display: none;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .mobile-header-layout {
    padding: 0.25rem 0;
    gap: 0.25rem;
  }

  .mobile-left-section {
    gap: 0.5rem;
  }

  .mobile-logo-container {
    width: 1.75rem;
    height: 1.75rem;
  }

  .mobile-home-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }

  .mobile-nav-item {
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }

  .mobile-search-input {
    width: 6rem;
    height: 1.75rem;
    font-size: 0.75rem;
  }

  .mobile-user-name {
    font-size: 0.7rem;
  }

  .mobile-user-role {
    font-size: 0.65rem;
  }

  .mobile-user-avatar {
    width: 1.5rem;
    height: 1.5rem;
  }

  .mobile-avatar-icon {
    width: 0.75rem;
    height: 0.75rem;
  }

  .mobile-auth-link {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

/* Very small screens - hide some nav items */
@media (max-width: 360px) {
  .mobile-nav-section {
    gap: 0.25rem;
  }

  .mobile-nav-item {
    font-size: 0.7rem;
    padding: 0.15rem 0.3rem;
  }

  .mobile-search-input {
    width: 5rem;
  }

  .mobile-user-info {
    display: none;
  }
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-menu-button {
    display: block;
  }
}

/* Mobile Home Button */
.mobile-home-button {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-home-button {
    display: block;
  }
}

.menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--radius-md);
}

.menu-toggle:hover {
  background: var(--bg-accent);
  color: var(--primary-color);
}

.menu-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-primary);
}

.home-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--radius-md);
  text-decoration: none;
}

.home-button:hover {
  background: var(--bg-accent);
  color: var(--primary-color);
}

.home-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-primary);
}

/* Mobile Menu Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  display: block !important;
}

.mobile-menu {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 18rem;
  background: var(--bg-primary) !important;
  border-right: 2px solid var(--border-green-light);
  box-shadow: var(--shadow-green-lg);
  z-index: 10000;
  opacity: 1 !important;
  overflow-y: auto;
  display: block !important;
}

.mobile-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  min-height: 100vh;
  position: relative;
  z-index: 1001;
  overflow-y: auto;
  width: 100%;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-green-light);
  margin-bottom: 1rem;
}

.mobile-title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-logo {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid #10b981;
  padding: 0.2rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.mobile-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.mobile-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
}

.mobile-close:hover {
  background: var(--bg-green-light);
  color: var(--primary-color);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.mobile-search {
  position: relative;
}

.mobile-search .search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}

.mobile-search .search-input {
  width: 100%;
  height: 2.5rem;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: var(--font-size-base);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  outline: none;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  color: var(--text-primary);
}

.mobile-search .search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(6, 158, 45, 0.1);
  background: var(--bg-primary);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
}

.mobile-nav-link {
  padding: 1rem 1.25rem;
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition);
  font-weight: 600;
  font-size: var(--font-size-base);
  background: #ffffff;
  border: 2px solid var(--border-green-light);
  margin: 0.5rem 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 2rem);
  min-height: 3rem;
}

.mobile-nav-link:hover {
  background: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.mobile-nav-link.active {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(6, 158, 45, 0.2);
}

/* Responsive Design */
@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }

  .desktop-actions {
    display: flex;
  }

  .mobile-menu-button {
    display: none;
  }
}

/* Mobile Styles */
@media (max-width: 1024px) {
  .mobile-menu-button {
    display: block;
  }

  .desktop-nav {
    display: none;
  }

  .desktop-actions {
    display: none;
  }
}
</style>
