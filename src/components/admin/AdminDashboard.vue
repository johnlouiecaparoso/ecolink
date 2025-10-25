<template>
  <div class="admin-dashboard">
    <div class="admin-stats">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-number">{{ stats.totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Projects</h3>
        <p class="stat-number">{{ stats.activeProjects }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Projects</h3>
        <p class="stat-number">{{ stats.pendingProjects }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Credits</h3>
        <p class="stat-number">{{ stats.totalCredits.toLocaleString() }}</p>
      </div>
    </div>

    <div class="admin-content">
      <!-- Project Approval Section -->
      <div class="admin-section">
        <h2>Project Approval</h2>
        <p>Review and approve pending projects for marketplace listing.</p>
        <ProjectApprovalPanel />
      </div>

      <!-- Admin Tools Section -->
      <div class="admin-section">
        <h2>Admin Tools</h2>
        <p>System administration and management tools.</p>

        <div class="admin-tools-grid">
          <router-link to="/admin/users" class="admin-tool-card">
            <div class="tool-icon">👥</div>
            <h3>User Management</h3>
            <p>Manage user accounts, roles, and permissions</p>
          </router-link>

          <router-link to="/admin/database" class="admin-tool-card">
            <div class="tool-icon">🗄️</div>
            <h3>Database Management</h3>
            <p>Manage database tables, data, and relationships</p>
          </router-link>

          <router-link to="/admin/audit-logs" class="admin-tool-card">
            <div class="tool-icon">📋</div>
            <h3>Audit Logs</h3>
            <p>View system activity and user actions</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { projectApprovalService } from '@/services/projectApprovalService'
import ProjectApprovalPanel from './ProjectApprovalPanel.vue'

const stats = ref({
  totalUsers: 0,
  activeProjects: 0,
  pendingProjects: 0,
  totalCredits: 0,
})

onMounted(async () => {
  await loadStats()
})

async function loadStats() {
  try {
    // Get all projects to calculate stats
    const allProjects = await projectApprovalService.getAllProjects()

    stats.value.activeProjects = allProjects.filter((p) => p.status === 'approved').length
    stats.value.pendingProjects = allProjects.filter((p) => p.status === 'pending').length
    stats.value.totalCredits = allProjects.filter((p) => p.status === 'approved').length * 500 // Rough estimate

    // TODO: Add user count from user service when available
    stats.value.totalUsers = 3 // Test accounts for now
  } catch (error) {
    console.error('Error loading admin stats:', error)
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.admin-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-section h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.admin-section p {
  margin: 0 0 1.5rem 0;
  color: #666;
}

.admin-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.admin-tool-card {
  display: block;
  padding: 1.5rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.admin-tool-card:hover {
  background: #e9ecef;
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.admin-tool-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.admin-tool-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.admin-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-section h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.admin-section p {
  color: #666;
  line-height: 1.5;
}
</style>
