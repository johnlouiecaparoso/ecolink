<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const router = useRouter()
const store = useUserStore()

const user = ref({ name: 'EcoLink User', email: 'user@ecolink.io' })
const showDebug = ref(import.meta.env?.MODE !== 'production')
const storageKeys = ref([])
const windowOrigin = ref('')

function refreshStorageKeys() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      storageKeys.value = Object.keys(window.localStorage).filter((k) => k.startsWith('sb-'))
    } else {
      storageKeys.value = []
    }
  } catch (e) {
    storageKeys.value = []
  }
}
refreshStorageKeys()

// Set window origin safely
if (typeof window !== 'undefined') {
  windowOrigin.value = window.location.origin
}

const metrics = ref([
  { id: 'mrr', title: 'Current MRR', value: '$12.4k' },
  { id: 'customers', title: 'Current Customers', value: '16,601' },
  { id: 'active', title: 'Active Customers', value: '33%' },
  { id: 'churn', title: 'Churn Rate', value: '2%' },
])

const navItems = [
  { id: 'overview', label: 'Overview', route: '/dashboard' },
  { id: 'transactions', label: 'Transactions', route: '/marketplace' },
  { id: 'customers', label: 'Customers', route: '/users' },
  { id: 'reports', label: 'Reports', route: '/analytics' },
  { id: 'settings', label: 'Settings', route: '/admin' },
  { id: 'developer', label: 'Developer', route: '/verifier' },
]

function navigateTo(route) {
  router.push(route)
}

async function onSignOut() {
  await store.logout().catch(() => {})
  // Ensure local state is cleared and navigate regardless of remote result
  store.session = null
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('sb-')) window.localStorage.removeItem(key)
      })
    }
  } catch {}
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
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
          @click="navigateTo(item.route)"
        >
          {{ item.label }}
        </button>
      </nav>
      <div class="sidebar-spacer"></div>
      <button class="nav-item logout" type="button" @click="onSignOut">Log out</button>
    </aside>

    <div class="content">
      <header class="topbar">
        <h1 class="page-title">Dashboard</h1>
        <div class="user-inline">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-email">{{ user.email }}</div>
        </div>
      </header>

      <main class="main">
        <section class="metrics">
          <div v-for="m in metrics" :key="m.id" class="metric-card">
            <div class="metric-title">{{ m.title }}</div>
            <div class="metric-value">{{ m.value }}</div>
          </div>
        </section>

        <section class="grid">
          <div class="card large">
            <div class="card-title">Trend</div>
            <div class="placeholder">Chart placeholder</div>
          </div>
          <div class="card">
            <div class="card-title">Sales</div>
            <div class="placeholder">Donut placeholder</div>
          </div>
          <div class="card">
            <div class="card-title">Transactions</div>
            <div class="placeholder">List placeholder</div>
          </div>
          <div class="card large">
            <div class="card-title">Support Tickets</div>
            <div class="placeholder">Table placeholder</div>
          </div>
          <div class="card large">
            <div class="card-title">Customer Demographic</div>
            <div class="placeholder">Map placeholder</div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: var(--ecolink-bg);
}

.sidebar {
  background: var(--ecolink-primary-700);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 18px 8px;
}
.brand-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--ecolink-primary-500), var(--ecolink-primary-700));
  display: grid;
  place-items: center;
}
.brand-initials {
  color: #fff;
  font-weight: 800;
}
.brand-text {
  font-weight: 800;
  font-size: 18px;
}

.sidebar-nav {
  display: grid;
  gap: 8px;
}
.nav-item {
  text-align: left;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
}
.logout {
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 14px;
}
.sidebar-spacer {
  flex: 1;
}

.content {
  display: grid;
  grid-template-rows: auto 1fr;
}
.topbar {
  background: var(--ecolink-surface);
  border-bottom: 1px solid var(--ecolink-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}
.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--ecolink-primary-700);
}
.user-inline {
  text-align: right;
}
.user-name {
  font-weight: 600;
}
.user-email {
  font-size: 12px;
  color: var(--ecolink-muted);
}

.main {
  padding: 20px;
}
.debug {
  margin-bottom: 14px;
  padding: 10px;
  background: #fff8e1;
  border: 1px solid #f0d48a;
  color: #7a5b00;
  border-radius: 10px;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.metric-card {
  background: var(--ecolink-primary-700);
  color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-md);
}
.metric-title {
  opacity: 0.9;
  font-size: 13px;
}
.metric-value {
  font-size: 28px;
  font-weight: 800;
  margin-top: 8px;
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}
.card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 16px;
}
.card.large {
  grid-column: span 2;
}
.card-title {
  font-weight: 700;
  margin-bottom: 10px;
}
.placeholder {
  height: 220px;
  border: 1px dashed var(--ecolink-border);
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--ecolink-muted);
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .card.large {
    grid-column: auto;
  }
}
</style>
