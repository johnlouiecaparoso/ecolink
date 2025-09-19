<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref({ name: 'EcoLink User', email: 'user@ecolink.io' })

const modules = [
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Manage user accounts, roles, and permissions',
    icon: '👥',
    color: 'blue',
    route: '/users',
  },
  {
    id: 'project-registry',
    title: 'Project Registry',
    description: 'Register and manage climate projects',
    icon: '🌱',
    color: 'green',
    route: '/projects',
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Trade carbon credits and impact tokens',
    icon: '🏪',
    color: 'purple',
    route: '/marketplace',
  },
  {
    id: 'wallet-finance',
    title: 'Wallet & Finance',
    description: 'Manage payments and financial transactions',
    icon: '💳',
    color: 'orange',
    route: '/wallet',
  },
  {
    id: 'admin-panel',
    title: 'Admin Panel',
    description: 'System administration and configuration',
    icon: '⚙️',
    color: 'red',
    route: '/admin',
  },
  {
    id: 'verifier-panel',
    title: 'Verifier Panel',
    description: 'Verify and validate project claims',
    icon: '✅',
    color: 'teal',
    route: '/verifier',
  },
  {
    id: 'analytics-reports',
    title: 'Analytics & Reports',
    description: 'View insights and generate reports',
    icon: '📊',
    color: 'indigo',
    route: '/analytics',
  },
]

function navigateToModule(route) {
  router.push(route)
}
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <div class="brand-section">
          <div class="brand-badge">
            <span class="brand-initials">EC</span>
          </div>
          <div>
            <h1 class="brand-title">EcoLink</h1>
            <p class="brand-subtitle">Climate Impact Platform</p>
          </div>
        </div>
        <div class="user-section">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-email">{{ user.email }}</span>
          </div>
          <button class="btn btn-ghost" @click="router.push('/login')">Sign Out</button>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="dashboard-content">
        <section class="welcome-section">
          <h2 class="welcome-title">Welcome back, {{ user.name.split(' ')[0] }}!</h2>
          <p class="welcome-subtitle">
            Choose a module to get started with your climate impact work.
          </p>
        </section>

        <section class="modules-grid">
          <div
            v-for="module in modules"
            :key="module.id"
            class="module-card"
            :class="`module-card--${module.color}`"
            @click="navigateToModule(module.route)"
          >
            <div class="module-icon">{{ module.icon }}</div>
            <h3 class="module-title">{{ module.title }}</h3>
            <p class="module-description">{{ module.description }}</p>
            <div class="module-arrow">→</div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--ecolink-bg);
}

.dashboard-header {
  background: var(--ecolink-surface);
  border-bottom: 1px solid var(--ecolink-border);
  box-shadow: var(--shadow-md);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--ecolink-primary-500), var(--ecolink-primary-700));
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.brand-initials {
  font-weight: 800;
  letter-spacing: 0.5px;
  color: white;
  font-size: 14px;
}

.brand-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--ecolink-primary-700);
}

.brand-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--ecolink-muted);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 600;
  color: var(--ecolink-text);
}

.user-email {
  font-size: 14px;
  color: var(--ecolink-muted);
}

.dashboard-main {
  padding: 40px 24px;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-title {
  margin: 0 0 12px 0;
  font-size: 36px;
  font-weight: 800;
  color: var(--ecolink-text);
}

.welcome-subtitle {
  margin: 0;
  font-size: 18px;
  color: var(--ecolink-muted);
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.module-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 24px;
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.module-card--blue {
  border-left: 4px solid #3b82f6;
}

.module-card--green {
  border-left: 4px solid var(--ecolink-primary-500);
}

.module-card--purple {
  border-left: 4px solid #8b5cf6;
}

.module-card--orange {
  border-left: 4px solid #f59e0b;
}

.module-card--red {
  border-left: 4px solid #ef4444;
}

.module-card--teal {
  border-left: 4px solid #14b8a6;
}

.module-card--indigo {
  border-left: 4px solid #6366f1;
}

.module-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.module-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ecolink-text);
}

.module-description {
  margin: 0 0 16px 0;
  color: var(--ecolink-muted);
  line-height: 1.5;
}

.module-arrow {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 20px;
  color: var(--ecolink-primary-500);
  opacity: 0.6;
  transition: all 200ms ease;
}

.module-card:hover .module-arrow {
  opacity: 1;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .user-section {
    flex-direction: column;
    gap: 8px;
  }

  .user-info {
    align-items: center;
  }

  .modules-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .welcome-title {
    font-size: 28px;
  }
}
</style>
