<template>
  <div class="admin-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-description">Manage users, projects, and system settings</p>
      </div>
    </div>
    <div class="admin-stats">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-number">{{ loading ? '...' : stats.totalUsers }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Projects</h3>
        <p class="stat-number">{{ loading ? '...' : stats.activeProjects }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Projects</h3>
        <p class="stat-number">{{ loading ? '...' : stats.pendingProjects }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Credits</h3>
        <p class="stat-number">{{ loading ? '...' : stats.totalCredits.toLocaleString() }}</p>
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
import { getPlatformOverview, getCreditStats } from '@/services/analyticsService'
import { getSupabase, getSupabaseAsync } from '@/services/supabaseClient'
import { diagnoseAdminDashboard } from '@/utils/diagnoseAdminDashboard'
import { debugAdminQueries } from '@/utils/debugAdminQueries'
import ProjectApprovalPanel from './ProjectApprovalPanel.vue'

const stats = ref({
  totalUsers: 0,
  activeProjects: 0,
  pendingProjects: 0,
  totalCredits: 0,
})

const loading = ref(true)

onMounted(async () => {
  await loadStats()

  // If stats are all zero, run diagnostics
  if (stats.value.totalUsers === 0 && stats.value.activeProjects === 0) {
    console.warn('⚠️ All stats are zero, running diagnostics...')
    console.log(
      '💡 You can also run debugAdminQueries() or diagnoseAdminDashboard() in console manually',
    )
    setTimeout(async () => {
      try {
        // Run enhanced debug queries first
        const debugResult = await debugAdminQueries()
        console.log('📊 Debug result:', debugResult)

        // Also run full diagnostics
        const result = await diagnoseAdminDashboard()
        if (!result.success || stats.value.totalUsers === 0) {
          console.error('❌ Diagnostics found issues. Check logs above for details.')
          console.log('💡 To debug queries: await debugAdminQueries()')
          console.log('💡 To full diagnose: await diagnoseAdminDashboard()')
        }
      } catch (err) {
        console.error('❌ Diagnostic function error:', err)
      }
    }, 2000) // Wait 2 seconds to let stats finish loading
  }
})

async function loadStats() {
  try {
    loading.value = true

    // Ensure Supabase is initialized before proceeding
    let supabase = getSupabase()
    if (!supabase) {
      console.log('Supabase not ready, initializing...')
      supabase = await getSupabaseAsync()
    }

    if (!supabase) {
      console.error('Supabase client not initialized in AdminDashboard')
      stats.value = {
        totalUsers: 0,
        activeProjects: 0,
        pendingProjects: 0,
        totalCredits: 0,
      }
      return
    }

    // Fetch real-time data from multiple sources in parallel
    const [platformOverview, creditStatsData, projectsResult, creditsResult] = await Promise.all([
      getPlatformOverview().catch((error) => {
        console.error('Error fetching platform overview:', error)
        return {
          totalUsers: 0,
          activeProjects: 0,
          totalTransactions: 0,
          totalCreditsSold: 0,
        }
      }),
      getCreditStats().catch((error) => {
        console.error('Error fetching credit stats:', error)
        return { totalCreditsSold: 0 }
      }),
      projectApprovalService.getAllProjects().catch((error) => {
        console.error('Error fetching all projects:', error)
        return []
      }),
      supabase
        .from('project_credits')
        .select('total_credits')
        .then((result) => {
          if (result.error) {
            console.error('Error fetching project credits:', result.error)
            return { data: null, error: result.error }
          }
          return result
        })
        .catch((error) => {
          console.error('Error in project_credits query:', error)
          return { data: null, error }
        }),
    ])

    // Calculate total users from profiles - try multiple sources
    stats.value.totalUsers = platformOverview.totalUsers || 0
    console.log('Total users from platform overview:', stats.value.totalUsers)

    // If platform overview returned 0, try direct query as fallback
    if (stats.value.totalUsers === 0) {
      console.log('⚠️ Platform overview returned 0 users, trying direct query...')
      try {
        // Direct query to profiles table
        const { count: directCount, error: directError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })

        if (!directError && directCount !== null) {
          stats.value.totalUsers = directCount
          console.log('✅ Direct query succeeded, user count:', directCount)
        } else if (directError) {
          console.error('❌ Direct query failed:', directError)
          // Try selecting data and counting
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id')

          if (!profilesError && profilesData) {
            stats.value.totalUsers = profilesData.length
            console.log('✅ Data select succeeded, user count:', profilesData.length)
          } else {
            console.error('❌ Data select also failed:', profilesError)
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback query exception:', fallbackError)
      }
    }

    // Get project counts from real data
    const allProjects = Array.isArray(projectsResult) ? projectsResult : []
    stats.value.activeProjects = allProjects.filter((p) => p.status === 'approved').length
    stats.value.pendingProjects = allProjects.filter((p) => p.status === 'pending').length
    console.log('Projects loaded:', {
      total: allProjects.length,
      active: stats.value.activeProjects,
      pending: stats.value.pendingProjects,
    })

    // Calculate total credits from project_credits table (sum of all credits)
    if (creditsResult.data && !creditsResult.error) {
      stats.value.totalCredits = creditsResult.data.reduce(
        (sum, credit) => sum + (parseInt(credit.total_credits) || 0),
        0,
      )
      console.log('Total credits from project_credits:', stats.value.totalCredits)
    } else {
      // Fallback to total credits sold if project_credits unavailable
      stats.value.totalCredits =
        creditStatsData.totalCreditsSold || platformOverview.totalCreditsSold || 0
      console.log('Total credits from fallback:', stats.value.totalCredits)
    }
  } catch (error) {
    console.error('Error loading admin stats:', error)
    // Set defaults on error
    stats.value = {
      totalUsers: 0,
      activeProjects: 0,
      pendingProjects: 0,
      totalCredits: 0,
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: var(--bg-secondary, #f8fdf8);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Page Header */
.page-header {
  padding: 2rem 0;
  border-bottom: none;
  background: var(--primary-color, #10b981);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1.1rem;
  color: #fff;
}

.admin-dashboard .admin-stats,
.admin-dashboard .admin-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
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
