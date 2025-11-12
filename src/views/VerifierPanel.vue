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
          <div class="access-denied-icon" aria-hidden="true">
            <span class="material-symbols-outlined">lock</span>
          </div>
          <h2>Authentication Required</h2>
          <p>You must be signed in to access the verifier panel.</p>
          <router-link to="/login" class="login-link">Go to Login</router-link>
        </div>

        <div v-else-if="!store.isVerifier" class="access-denied">
          <div class="access-denied-icon" aria-hidden="true">
            <span class="material-symbols-outlined">block</span>
          </div>
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
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
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
  overflow-x: hidden;
}

.access-denied {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.access-denied-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  border-radius: 1.25rem;
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.access-denied-icon .material-symbols-outlined {
  font-size: 2.5rem;
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
  display: block;
}

.approval-section {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .verifier-content {
    padding: 1rem 0;
  }

  .container {
    padding: 0 var(--spacing-md);
  }
}
</style>
