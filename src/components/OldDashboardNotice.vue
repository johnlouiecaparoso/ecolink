<template>
  <div class="old-dashboard-notice">
    <div class="notice-content">
      <div class="notice-icon">🚧</div>
      <h3>Dashboard Under Maintenance</h3>
      <p>
        The dashboard is currently being updated with a new interface. Please use the navigation
        menu to access the new features.
      </p>
      <div class="notice-actions">
        <button @click="$router.push('/')" class="notice-button primary">Go to Homepage</button>
        <button @click="$router.push('/marketplace')" class="notice-button secondary">
          Browse Marketplace
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OldDashboardNotice',
}
</script>

<style scoped>
.old-dashboard-notice {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: var(--spacing-md);
}

.notice-content {
  max-width: 32rem;
  text-align: center;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.notice-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.notice-content h3 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.notice-content p {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.notice-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.notice-button {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  min-width: 8rem;
}

.notice-button.primary {
  background: var(--primary-color);
  color: white;
}

.notice-button.primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.notice-button.secondary {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.notice-button.secondary:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .notice-actions {
    flex-direction: column;
    align-items: center;
  }

  .notice-button {
    width: 100%;
    max-width: 16rem;
  }
}
</style>
