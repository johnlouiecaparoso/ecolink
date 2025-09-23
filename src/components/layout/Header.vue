<template>
  <header class="header">
    <div class="header-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <span class="logo-text">E</span>
        </div>
        <span class="logo-name">EcoLink</span>
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
        <button class="demo-button">Book a Demo</button>
        <div class="user-avatar">
          <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <div class="mobile-menu-button">
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="menu-toggle">
          <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false">
      <div class="mobile-menu" @click.stop>
        <div class="mobile-content">
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
          <div class="mobile-actions">
            <button class="mobile-demo-button">Book a Demo</button>
            <button class="mobile-profile-button">
              <svg class="profile-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      searchQuery: '',
      mobileMenuOpen: false,
      navItems: [
        { path: '/', label: 'Home' },
        { path: '/marketplace', label: 'Marketplace' },
        { path: '/retire', label: 'Retire' },
        { path: '/wallet', label: 'Wallet' },
        { path: '/profile', label: 'Profile' },
      ],
    }
  },
  computed: {
    isActive() {
      return (path) => this.$route.path === path
    },
  },
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: white;
}

.logo-name {
  font-weight: 700;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
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
  padding: 0.5rem 0;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.active {
  color: var(--primary-color);
  font-weight: 500;
}

/* Desktop Actions */
.desktop-actions {
  display: none;
  align-items: center;
  gap: 1rem;
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
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  outline: none;
  transition: var(--transition);
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(6, 158, 45, 0.1);
}

.demo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  padding: 0 0.75rem;
  font-size: var(--font-size-sm);
  font-weight: 500;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.demo-button:hover {
  background: var(--bg-accent);
  color: var(--text-primary);
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
}

.avatar-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: block;
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
}

.menu-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-primary);
}

/* Mobile Menu Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.5);
}

.mobile-menu {
  position: fixed;
  right: 0;
  top: 0;
  height: 100%;
  width: 18rem;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
}

.mobile-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
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
  height: 2.25rem;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  font-size: var(--font-size-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  outline: none;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-link {
  padding: 0.5rem;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition);
}

.mobile-nav-link:hover {
  background: var(--primary-light);
}

.mobile-nav-link.active {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: 500;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.mobile-demo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  padding: 0 0.75rem;
  font-size: var(--font-size-sm);
  font-weight: 500;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.mobile-profile-button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  height: 2.25rem;
  padding: 0 0.75rem;
  font-size: var(--font-size-sm);
  font-weight: 500;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.mobile-profile-button:hover {
  background: var(--bg-accent);
}

.profile-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  color: var(--text-muted);
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
</style>
