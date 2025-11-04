<template>
  <div class="verifier-panel">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Verifier Panel</h1>
        <p class="page-description">
          Review and approve submitted environmental projects for carbon credit generation
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="verifier-content">
      <div class="container">
        <!-- Access Check -->
        <div v-if="!store.isAuthenticated" class="access-denied">
          <div class="access-denied-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>You must be signed in to access the verifier panel.</p>
          <router-link to="/login" class="login-link">Go to Login</router-link>
        </div>

        <div v-else-if="!store.isVerifier" class="access-denied">
          <div class="access-denied-icon">❌</div>
          <h2>Access Denied</h2>
          <p>Your account does not have verifier access.</p>
          <p class="hint-text">Please contact an administrator if you believe this is an error.</p>
        </div>

        <!-- Verifier Dashboard -->
        <div v-else class="verifier-dashboard">
          <!-- Project Approval Panel -->
          <div class="approval-section">
            <ProjectApprovalPanel />
          </div>

          <!-- Quick Links -->
          <div class="quick-links-section">
            <h3 class="section-title">Quick Actions</h3>
            <div class="quick-links-grid">
              <router-link to="/marketplace" class="quick-link-card">
                <div class="quick-link-icon">🏪</div>
                <h4>Marketplace</h4>
                <p>View approved projects in the marketplace</p>
              </router-link>

              <router-link to="/profile" class="quick-link-card">
                <div class="quick-link-icon">👤</div>
                <h4>Profile</h4>
                <p>Manage your verifier profile and settings</p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/userStore'
import ProjectApprovalPanel from '@/components/admin/ProjectApprovalPanel.vue'

const store = useUserStore()
</script>

<style scoped>
.verifier-panel {
  min-height: 100vh;
  background: var(--bg-primary);
}

.page-header {
  background: var(--primary-color, #10b981);
  color: white;
  padding: 2rem 0;
  border-bottom: none;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: var(--font-size-lg);
  color: #fff;
}

.verifier-content {
  padding: 2rem 0;
}

.access-denied {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.access-denied-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.access-denied h2 {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 0.5rem;
}

.access-denied p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.hint-text {
  font-size: 0.875rem;
  color: #9ca3af;
}

.login-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.login-link:hover {
  background: #059669;
}

.verifier-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.approval-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-links-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.quick-link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  color: #111827;
  transition: all 0.2s;
}

.quick-link-card:hover {
  border-color: #10b981;
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quick-link-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.quick-link-card h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.quick-link-card p {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .quick-links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
