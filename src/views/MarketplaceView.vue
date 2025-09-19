<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="module-page">
    <header class="module-header">
      <button class="btn btn-ghost" @click="router.push('/dashboard')">← Back to Dashboard</button>
      <h1 class="module-title">Marketplace</h1>
      <p class="module-subtitle">Trade carbon credits and impact tokens</p>
    </header>

    <main class="module-content">
      <div class="placeholder-card">
        <div class="placeholder-icon">🏪</div>
        <h2>Marketplace Module</h2>
        <p>This module will contain marketplace functionality including:</p>
        <ul>
          <li>Carbon credit trading</li>
          <li>Impact token marketplace</li>
          <li>Project investment opportunities</li>
          <li>Price discovery and analytics</li>
          <li>Transaction history</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
.module-page {
  min-height: 100vh;
  background: var(--ecolink-bg);
}

.module-header {
  background: var(--ecolink-surface);
  border-bottom: 1px solid var(--ecolink-border);
  padding: 24px;
}

.module-title {
  margin: 16px 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--ecolink-text);
}

.module-subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--ecolink-muted);
}

.module-content {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.placeholder-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 48px;
  text-align: center;
  box-shadow: var(--shadow-md);
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.placeholder-card h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--ecolink-text);
}

.placeholder-card p {
  margin: 0 0 16px 0;
  color: var(--ecolink-muted);
}

.placeholder-card ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
  color: var(--ecolink-muted);
}

.placeholder-card li {
  margin-bottom: 8px;
}
</style>
