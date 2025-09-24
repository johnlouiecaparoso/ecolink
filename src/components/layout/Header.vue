<template>
  <header class="header">
    <div class="header-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <div class="logo-container">
          <!-- New EcoLink Logo -->
          <div class="logo-graphic">
            <!-- Cloud shape with buildings and leaf -->
            <div class="logo-cloud">
              <div class="logo-buildings">
                <div class="building building-left">
                  <div class="window"></div>
                  <div class="window"></div>
                  <div class="window"></div>
                </div>
                <div class="building building-right">
                  <div class="window"></div>
                  <div class="window"></div>
                </div>
              </div>
              <div class="logo-leaf"></div>
            </div>
            <!-- Sparkle effects -->
            <div class="sparkles">
              <div class="sparkle sparkle-1"></div>
              <div class="sparkle sparkle-2"></div>
              <div class="sparkle sparkle-3"></div>
              <div class="sparkle sparkle-4"></div>
            </div>
          </div>
          <span class="logo-name">ECOLINK</span>
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

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.logo-graphic {
  position: relative;
  width: 2.5rem;
  height: 1.8rem;
}

.logo-cloud {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #90ee90 0%, #228b22 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
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

.logo-name {
  font-weight: 800;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  letter-spacing: 0.05em;
  background: linear-gradient(90deg, #90ee90 0%, #228b22 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
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
  height: 100vh;
  width: 18rem;
  background: #ffffff !important;
  border-left: 1px solid var(--border-color);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 1 !important;
}

.mobile-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: #ffffff !important;
  height: 100%;
  position: relative;
  z-index: 1001;
  opacity: 1 !important;
}

.mobile-search {
  position: relative;
  background: #ffffff !important;
  z-index: 1002;
  opacity: 1 !important;
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
  border: 2px solid #e5e7eb;
  border-radius: var(--radius-lg);
  background: #ffffff !important;
  outline: none;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1003;
  color: var(--text-primary);
  opacity: 1 !important;
}

.mobile-search .search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(6, 158, 45, 0.1);
  background: #ffffff !important;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-link {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition);
  font-weight: 500;
  font-size: var(--font-size-base);
  background: #ffffff !important;
  border: 1px solid #e5e7eb;
  margin-bottom: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1004;
  opacity: 1 !important;
}

.mobile-nav-link:hover {
  background: var(--primary-light) !important;
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.mobile-nav-link.active {
  background: var(--primary-color) !important;
  color: white;
  font-weight: 600;
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(6, 158, 45, 0.2);
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #ffffff !important;
  position: relative;
  z-index: 1005;
  opacity: 1 !important;
}

.mobile-demo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  padding: 0 1rem;
  font-size: var(--font-size-base);
  font-weight: 600;
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-lg);
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  opacity: 1 !important;
}

.mobile-demo-button:hover {
  background: var(--primary-hover);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(6, 158, 45, 0.3);
}

.mobile-profile-button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  height: 2.5rem;
  padding: 0 1rem;
  font-size: var(--font-size-base);
  font-weight: 500;
  border: 2px solid #e5e7eb;
  border-radius: var(--radius-lg);
  background: #ffffff !important;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1006;
  opacity: 1 !important;
}

.mobile-profile-button:hover {
  background: var(--primary-light) !important;
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
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
