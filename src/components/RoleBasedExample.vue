<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/userStore'
import { ROLES, PERMISSIONS } from '@/constants/roles'

const userStore = useUserStore()

const userInfo = computed(() => ({
  name: userStore.profile?.full_name || 'User',
  role: userStore.role,
  isAdmin: userStore.isAdmin,
  isGeneralUser: userStore.isGeneralUser,
  isProjectDeveloper: userStore.isProjectDeveloper,
  isVerifier: userStore.isVerifier,
  isBuyerInvestor: userStore.isBuyerInvestor,
  permissions: userStore.permissions,
}))

const canManageUsers = computed(() => userStore.hasPermission(PERMISSIONS.MANAGE_USERS))
const canViewAnalytics = computed(() => userStore.hasPermission(PERMISSIONS.VIEW_ANALYTICS))
const canManageProjects = computed(() => userStore.hasPermission(PERMISSIONS.MANAGE_PROJECTS))
</script>

<template>
  <div class="role-example">
    <h2>Role-Based Access Control Example</h2>

    <div class="user-info">
      <h3>Current User Information</h3>
      <p><strong>Name:</strong> {{ userInfo.name }}</p>
      <p><strong>Role:</strong> {{ userInfo.role }}</p>
      <p><strong>Is Admin:</strong> {{ userInfo.isAdmin ? 'Yes' : 'No' }}</p>
      <p><strong>Is General User:</strong> {{ userInfo.isGeneralUser ? 'Yes' : 'No' }}</p>
      <p><strong>Is Project Developer:</strong> {{ userInfo.isProjectDeveloper ? 'Yes' : 'No' }}</p>
      <p><strong>Is Verifier:</strong> {{ userInfo.isVerifier ? 'Yes' : 'No' }}</p>
      <p><strong>Is Buyer/Investor:</strong> {{ userInfo.isBuyerInvestor ? 'Yes' : 'No' }}</p>
    </div>

    <div class="permissions">
      <h3>Permission Checks</h3>
      <div class="permission-item">
        <span class="permission-name">Can Manage Users:</span>
        <span :class="['permission-status', canManageUsers ? 'allowed' : 'denied']">
          {{ canManageUsers ? '✅ Allowed' : '❌ Denied' }}
        </span>
      </div>
      <div class="permission-item">
        <span class="permission-name">Can View Analytics:</span>
        <span :class="['permission-status', canViewAnalytics ? 'allowed' : 'denied']">
          {{ canViewAnalytics ? '✅ Allowed' : '❌ Denied' }}
        </span>
      </div>
      <div class="permission-item">
        <span class="permission-name">Can Manage Projects:</span>
        <span :class="['permission-status', canManageProjects ? 'allowed' : 'denied']">
          {{ canManageProjects ? '✅ Allowed' : '❌ Denied' }}
        </span>
      </div>
    </div>

    <div class="role-specific-content">
      <h3>Role-Specific Content</h3>

      <!-- User content -->
      <div v-if="userInfo.role === ROLES.USER" class="user-content">
        <p>This content is only visible to regular users.</p>
        <p>You can manage your projects and wallet here.</p>
      </div>

      <!-- Admin content -->
      <div v-if="userInfo.isAdmin" class="admin-content">
        <p>This content is only visible to administrators.</p>
        <p>You have access to user management and system settings.</p>
      </div>

      <!-- Verifier content -->
      <div v-if="userInfo.isVerifier" class="verifier-content">
        <p>This content is only visible to verifiers.</p>
        <p>You can verify projects and review submissions.</p>
      </div>
    </div>

    <div class="permissions-list">
      <h3>Current Permissions</h3>
      <div class="permissions-grid">
        <span v-for="permission in userInfo.permissions" :key="permission" class="permission-badge">
          {{ permission }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-example {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.role-example h2 {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--ecolink-text);
}

.user-info,
.permissions,
.role-specific-content,
.permissions-list {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 20px;
}

.user-info h3,
.permissions h3,
.role-specific-content h3,
.permissions-list h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ecolink-text);
}

.user-info p {
  margin: 8px 0;
  color: var(--ecolink-text);
}

.permission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--ecolink-border);
}

.permission-item:last-child {
  border-bottom: none;
}

.permission-name {
  font-weight: 500;
  color: var(--ecolink-text);
}

.permission-status.allowed {
  color: var(--ecolink-success);
  font-weight: 600;
}

.permission-status.denied {
  color: var(--ecolink-error);
  font-weight: 600;
}

.user-content,
.admin-content,
.super-admin-content,
.verifier-content {
  padding: 16px;
  border-radius: var(--radius);
  margin: 8px 0;
}

.user-content {
  background: var(--ecolink-blue-50);
  border: 1px solid var(--ecolink-blue-200);
}

.admin-content {
  background: var(--ecolink-red-50);
  border: 1px solid var(--ecolink-red-200);
}

.super-admin-content {
  background: var(--ecolink-purple-50);
  border: 1px solid var(--ecolink-purple-200);
}

.verifier-content {
  background: var(--ecolink-green-50);
  border: 1px solid var(--ecolink-green-200);
}

.permissions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-badge {
  background: var(--ecolink-primary-100);
  color: var(--ecolink-primary-700);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
</style>
