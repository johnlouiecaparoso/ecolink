<template>
  <div class="project-approval-panel">
    <div class="panel-header">
      <h2>Project Management Panel</h2>
      <p>Manage all projects (pending, approved, and rejected)</p>
      <div class="filter-tabs">
        <button 
          :class="['filter-tab', { active: statusFilter === 'all' }]"
          @click="statusFilter = 'all'"
        >
          All Projects ({{ allProjects.length }})
        </button>
        <button 
          :class="['filter-tab', { active: statusFilter === 'pending' }]"
          @click="statusFilter = 'pending'"
        >
          Pending ({{ allProjects.filter(p => p.status === 'pending').length }})
        </button>
        <button 
          :class="['filter-tab', { active: statusFilter === 'approved' }]"
          @click="statusFilter = 'approved'"
        >
          Approved ({{ allProjects.filter(p => p.status === 'approved').length }})
        </button>
        <button 
          :class="['filter-tab', { active: statusFilter === 'rejected' }]"
          @click="statusFilter = 'rejected'"
        >
          Rejected ({{ allProjects.filter(p => p.status === 'rejected').length }})
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="error-state">
      <p class="error-message">{{ errorMessage }}</p>
      <button @click="loadPendingProjects" class="retry-btn">Retry</button>
    </div>

    <!-- No Projects -->
    <div v-else-if="displayedProjects.length === 0" class="no-projects">
      <div class="no-projects-icon">📋</div>
      <h3>No Projects Found</h3>
      <p v-if="statusFilter === 'all'">There are currently no projects in the system.</p>
      <p v-else>There are currently no {{ statusFilter }} projects.</p>
    </div>

    <!-- Projects List -->
    <div v-else class="projects-list">
      <div v-for="project in displayedProjects" :key="project.id" class="project-card">
        <!-- Status Badge -->
        <div class="project-status-badge" :class="project.status">
          {{ project.status.toUpperCase() }}
        </div>
        <div class="project-header">
          <h3 class="project-title">{{ project.title }}</h3>
          <span class="project-category">{{ project.category }}</span>
        </div>

        <div class="project-details">
          <div class="detail-row"><strong>Location:</strong> {{ project.location }}</div>
          <div class="detail-row">
            <strong>Submitted:</strong> {{ formatDate(project.created_at) }}
          </div>
          <div class="detail-row">
            <strong>Expected Impact:</strong>
          </div>
          <p class="project-impact">{{ project.expected_impact }}</p>
        </div>

        <div class="project-description">
          <strong>Description:</strong>
          <p>{{ project.description }}</p>
        </div>

        <div class="project-actions">
          <button 
            v-if="project.status === 'pending'"
            @click.stop.prevent="approveProject(project.id)" 
            :disabled="processing || processingProjects.includes(project.id)" 
            class="approve-btn"
            type="button"
          >
            ✅ Approve Project
          </button>
          <button 
            v-if="project.status === 'pending'"
            @click="rejectProject(project.id)" 
            :disabled="processing" 
            class="reject-btn"
          >
            ❌ Reject Project
          </button>
          <button 
            @click="deleteProject(project.id)" 
            :disabled="processing" 
            class="delete-btn"
            title="Delete project permanently (Admin only)"
          >
            🗑️ Delete Project
          </button>
        </div>

        <!-- Processing State -->
        <div v-if="processingProjects.includes(project.id)" class="processing-overlay" style="pointer-events: none;">
          <div class="spinner small"></div>
          <span>Processing...</span>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Modern Prompt Modal -->
    <ModernPrompt
      :is-open="promptState.isOpen"
      :type="promptState.type"
      :title="promptState.title"
      :message="promptState.message"
      :confirm-text="promptState.confirmText"
      :cancel-text="promptState.cancelText"
      :show-cancel="promptState.showCancel"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @close="handleClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { projectApprovalService } from '@/services/projectApprovalService'
import { useUserStore } from '@/store/userStore'
import { useModernPrompt } from '@/composables/useModernPrompt'
import { getSupabase } from '@/services/supabaseClient'
import { projectService } from '@/services/projectService'
import ModernPrompt from '@/components/ui/ModernPrompt.vue'

const { promptState, confirm, success, error: showErrorPrompt, warning, handleConfirm, handleCancel, handleClose } = useModernPrompt()

const userStore = useUserStore()
const loading = ref(true)
const errorMessage = ref(null)
const successMessage = ref(null)
const allProjects = ref([])
const pendingProjects = ref([])
const statusFilter = ref('all')
const processing = ref(false)
const processingProjects = ref([])

// Computed property for displayed projects based on filter
const displayedProjects = computed(() => {
  if (statusFilter.value === 'all') {
    return allProjects.value
  }
  return allProjects.value.filter(p => p.status === statusFilter.value)
})

onMounted(() => {
  loadPendingProjects()
})

async function loadPendingProjects(forceRefresh = false) {
  loading.value = true
  errorMessage.value = null

  try {
    // If force refresh, clear the list first to ensure fresh data
    if (forceRefresh) {
      allProjects.value = []
      pendingProjects.value = []
      console.log('🔄 Force refreshing projects list from database...')
    }
    
    // Note: The marketplace cleanup function runs automatically when marketplace loads
    // This ensures orphaned records are cleaned up, but we don't need to call it here
    // since we're fetching directly from projects table which only shows existing projects
    
    // Load all projects from Supabase database
    // This fetches fresh data - deleted projects are physically removed and won't appear
    const allProjectsData = await projectApprovalService.getAllProjects()
    
    // Filter out any null/undefined entries (shouldn't happen, but safety check)
    const validProjects = (allProjectsData || []).filter(p => p != null && p.id != null)
    
    // Clear and set fresh data
    allProjects.value = validProjects
    
    // Update pending projects count
    pendingProjects.value = allProjects.value.filter(p => p.status === 'pending')
    
    console.log('✅ Loaded projects from Supabase database:', {
      total: allProjects.value.length,
      pending: pendingProjects.value.length,
      approved: allProjects.value.filter(p => p.status === 'approved').length,
      rejected: allProjects.value.filter(p => p.status === 'rejected').length,
      note: 'Deleted projects are physically removed from database and will not appear here'
    })
  } catch (err) {
    console.error('❌ Error loading projects:', err)
    errorMessage.value = err.message || 'Failed to load projects'
  } finally {
    loading.value = false
  }
}

async function approveProject(projectId) {
  console.log('🔵 APPROVE BUTTON CLICKED - Project ID:', projectId)
  console.log('🔵 Current state:', {
    allProjectsCount: allProjects.value.length,
    pendingProjectsCount: pendingProjects.value.length,
    processingCount: processingProjects.value.length,
    isProcessing: processing.value,
    projectId: projectId
  })
  
  // Prevent multiple simultaneous calls for same project
  if (processingProjects.value.includes(projectId)) {
    console.warn('⚠️ Project approval already in progress for:', projectId)
    return
  }

  const project = allProjects.value.find((p) => p.id === projectId)
  console.log('🔵 Found project:', project ? { id: project.id, title: project.title, status: project.status } : 'NOT FOUND')
  
  if (!project) {
    console.error('❌ Project not found:', projectId)
    console.error('❌ Available project IDs:', allProjects.value.map(p => ({ id: p.id, status: p.status, title: p.title })))
    await showErrorPrompt({
      title: 'Project Not Found',
      message: 'The project could not be found. Please refresh the page and try again.',
      confirmText: 'OK',
    })
    return
  }

  // Check if project is actually pending
  console.log('🔵 Project status check:', { projectId, status: project.status, isPending: project.status === 'pending' })
  if (project.status !== 'pending') {
    console.warn('⚠️ Attempted to approve non-pending project:', { projectId, status: project.status })
    await showErrorPrompt({
      title: 'Invalid Project Status',
      message: `This project is already ${project.status}. Only pending projects can be approved.`,
      confirmText: 'OK',
    })
    return
  }

  // Show confirmation prompt
  const confirmed = await confirm({
    type: 'success',
    title: 'Approve Project?',
    message: `Are you sure you want to approve "${project.title}"? This will generate carbon credits and make the project available in the marketplace.`,
    confirmText: 'Approve',
    cancelText: 'Cancel',
  })

  if (!confirmed) {
    return
  }

  processingProjects.value.push(projectId)
  processing.value = true

  try {
    console.log('🔍 Before approveProject call:', {
      isAuthenticated: userStore.isAuthenticated,
      hasSession: !!userStore.session,
      userEmail: userStore.session?.user?.email,
      role: userStore.role
    })
    
    const result = await projectApprovalService.approveProject(projectId, 'Approved by admin')
    console.log('Project approved:', result)

    // Update project status in all lists
    const projectIndex = allProjects.value.findIndex(p => p.id === projectId)
    if (projectIndex !== -1) {
      allProjects.value[projectIndex].status = 'approved'
    }
    pendingProjects.value = pendingProjects.value.filter((p) => p.id !== projectId)

    // Reload the list to ensure consistency
    await loadPendingProjects()

    // Show modern success prompt
    await success({
      title: 'Project Approved! ✅',
      message: `"${result.project.title}" has been approved and carbon credits have been generated. The project is now available in the marketplace.`,
      confirmText: 'OK',
    })
  } catch (err) {
    console.error('Error approving project:', err)
    await showErrorPrompt({
      title: 'Approval Failed',
      message: err.message || 'Failed to approve project. Please try again.',
      confirmText: 'OK',
    })
  } finally {
    processingProjects.value = processingProjects.value.filter((id) => id !== projectId)
    processing.value = processingProjects.value.length > 0
  }
}

async function rejectProject(projectId) {
  const project = allProjects.value.find((p) => p.id === projectId)
  if (!project) return

  // Show confirmation prompt with reason input
  const confirmed = await confirm({
    type: 'warning',
    title: 'Reject Project?',
    message: `Are you sure you want to reject "${project.title}"? This action cannot be undone. Please provide a reason in the next step.`,
    confirmText: 'Continue',
    cancelText: 'Cancel',
  })

  if (!confirmed) {
    return
  }

  // Get rejection reason using a modern prompt
  // Note: For a more advanced solution, we could create an input prompt component
  // For now, we'll use a simple approach
  const reason = prompt('Please provide a reason for rejection:')
  if (!reason || reason.trim() === '') {
    await warning({
      title: 'Reason Required',
      message: 'A rejection reason is required. Please try again.',
      confirmText: 'OK',
      showCancel: false,
    })
    return
  }

  processingProjects.value.push(projectId)
  processing.value = true

  try {
    // Update project status to rejected
    const supabase = getSupabase()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { error } = await supabase
      .from('projects')
      .update({
        status: 'rejected',
        verification_notes: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)

    if (error) {
      throw new Error(error.message)
    }

    // Update project status in all lists
    const projectIndex = allProjects.value.findIndex(p => p.id === projectId)
    if (projectIndex !== -1) {
      allProjects.value[projectIndex].status = 'rejected'
    }
    pendingProjects.value = pendingProjects.value.filter((p) => p.id !== projectId)

    // Reload the list to ensure consistency
    await loadPendingProjects()

    // Show modern success prompt
    await success({
      title: 'Project Rejected',
      message: `"${project.title}" has been rejected. The developer has been notified.`,
      confirmText: 'OK',
    })
  } catch (err) {
    console.error('Error rejecting project:', err)
    await showErrorPrompt({
      title: 'Rejection Failed',
      message: err.message || 'Failed to reject project. Please try again.',
      confirmText: 'OK',
    })
  } finally {
    processingProjects.value = processingProjects.value.filter((id) => id !== projectId)
    processing.value = processingProjects.value.length > 0
  }
}

async function deleteProject(projectId) {
  const project = allProjects.value.find((p) => p.id === projectId)
  if (!project) {
    console.warn('⚠️ Project not found in list:', projectId)
    return
  }

  // Prevent multiple simultaneous calls for same project
  if (processingProjects.value.includes(projectId)) {
    console.warn('⚠️ Project deletion already in progress for:', projectId)
    return
  }

  // Check if user is admin
  if (!userStore.isAdmin) {
    await showErrorPrompt({
      title: 'Access Denied',
      message: 'Only administrators can delete projects.',
      confirmText: 'OK',
    })
    return
  }

  // Show confirmation prompt with warning
  const confirmed = await confirm({
    type: 'warning',
    title: 'Delete Project?',
    message: `⚠️ WARNING: Are you sure you want to permanently delete "${project.title}"?\n\nThis action cannot be undone and will:\n- Remove the project from the system\n- Delete all associated credits and listings\n- Delete all related data\n\nThis is a permanent action!`,
    confirmText: 'Delete Permanently',
    cancelText: 'Cancel',
  })

  if (!confirmed) {
    return
  }

  processingProjects.value.push(projectId)
  processing.value = true

  try {
    console.log('🗑️ Admin deleting project:', projectId)
    
    // Use admin delete function which bypasses status checks
    const result = await projectService.adminDeleteProject(projectId)
    
    if (!result) {
      throw new Error('Delete operation returned false')
    }

    console.log('✅ Project deleted successfully:', projectId)

    // Remove from all lists immediately (optimistic update)
    allProjects.value = allProjects.value.filter((p) => p.id !== projectId)
    pendingProjects.value = pendingProjects.value.filter((p) => p.id !== projectId)

    // Force a complete refresh of the list from database to verify deletion
    console.log('🔄 Reloading projects list from database to verify deletion...')
    
    // Wait a moment to ensure database operation completes
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Force refresh the list - this will fetch fresh data from Supabase
    await loadPendingProjects(true)
    
    // Double-check: Verify the project is not in the list
    const stillExists = allProjects.value.find(p => p.id === projectId)
    if (stillExists) {
      console.error('❌ CRITICAL: Project still appears in list after deletion!', projectId)
      throw new Error('Project deletion verification failed - project still appears in the list')
    }
    
    console.log('✅ Verification: Project confirmed removed from interface and database')

    // Show modern success prompt
    await success({
      title: 'Project Deleted! 🗑️',
      message: `"${project.title}" has been permanently deleted from the system and database.`,
      confirmText: 'OK',
    })
  } catch (err) {
    console.error('❌ Error deleting project:', err)
    await showErrorPrompt({
      title: 'Deletion Failed',
      message: err.message || 'Failed to delete project. Please check console for details and try again.',
      confirmText: 'OK',
    })
  } finally {
    processingProjects.value = processingProjects.value.filter((id) => id !== projectId)
    processing.value = processingProjects.value.length > 0
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.project-approval-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.panel-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.panel-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
}

.panel-header p {
  margin: 0 0 1rem 0;
  color: #666;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.filter-tab.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.loading-state,
.error-state,
.no-projects {
  text-align: center;
  padding: 48px 24px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin: 0 8px 0 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #dc3545;
  margin-bottom: 16px;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.no-projects-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-projects h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.no-projects p {
  margin: 0;
  color: #666;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  background: #f8f9fa;
}

.project-status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-status-badge.pending {
  background: #ffc107;
  color: #856404;
}

.project-status-badge.approved {
  background: #28a745;
  color: white;
}

.project-status-badge.rejected {
  background: #dc3545;
  color: white;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.project-title {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.project-category {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.project-details {
  margin-bottom: 16px;
}

.detail-row {
  margin-bottom: 8px;
  color: #555;
}

.project-impact {
  margin: 8px 0 0 0;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 4px;
  color: #1565c0;
  font-style: italic;
}

.project-description {
  margin-bottom: 20px;
}

.project-description strong {
  color: #333;
}

.project-description p {
  margin: 8px 0 0 0;
  color: #666;
  line-height: 1.5;
}

.project-actions {
  display: flex;
  gap: 12px;
}

.approve-btn,
.reject-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.approve-btn {
  background: #28a745;
  color: white;
}

.approve-btn:hover:not(:disabled) {
  background: #218838;
}

.reject-btn {
  background: #dc3545;
  color: white;
}

.reject-btn:hover:not(:disabled) {
  background: #c82333;
}

.delete-btn {
  background: #6c757d;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #5a6268;
}

.approve-btn:disabled,
.reject-btn:disabled,
.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid #c3e6cb;
}
</style>
