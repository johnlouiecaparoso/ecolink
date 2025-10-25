<template>
  <div class="project-approval-panel">
    <div class="panel-header">
      <h2>Project Approval Panel</h2>
      <p>Review and approve pending projects</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="loadPendingProjects" class="retry-btn">Retry</button>
    </div>

    <!-- No Projects -->
    <div v-else-if="pendingProjects.length === 0" class="no-projects">
      <div class="no-projects-icon">📋</div>
      <h3>No Pending Projects</h3>
      <p>There are currently no projects awaiting approval.</p>
    </div>

    <!-- Projects List -->
    <div v-else class="projects-list">
      <div v-for="project in pendingProjects" :key="project.id" class="project-card">
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
          <button @click="approveProject(project.id)" :disabled="processing" class="approve-btn">
            ✅ Approve Project
          </button>
          <button @click="rejectProject(project.id)" :disabled="processing" class="reject-btn">
            ❌ Reject Project
          </button>
        </div>

        <!-- Processing State -->
        <div v-if="processingProjects.includes(project.id)" class="processing-overlay">
          <div class="spinner small"></div>
          <span>Processing...</span>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { projectApprovalService } from '@/services/projectApprovalService'

const loading = ref(true)
const error = ref(null)
const successMessage = ref(null)
const pendingProjects = ref([])
const processing = ref(false)
const processingProjects = ref([])

onMounted(() => {
  loadPendingProjects()
})

async function loadPendingProjects() {
  loading.value = true
  error.value = null

  try {
    const projects = await projectApprovalService.getPendingProjects()
    pendingProjects.value = projects
    console.log('Loaded pending projects:', projects)
  } catch (err) {
    console.error('Error loading pending projects:', err)
    error.value = err.message || 'Failed to load pending projects'
  } finally {
    loading.value = false
  }
}

async function approveProject(projectId) {
  processingProjects.value.push(projectId)
  processing.value = true

  try {
    const result = await projectApprovalService.approveProject(projectId, 'Approved by admin')
    console.log('Project approved:', result)

    // Remove from pending list
    pendingProjects.value = pendingProjects.value.filter((p) => p.id !== projectId)

    successMessage.value = `Project "${result.project.title}" has been approved and credits generated!`
    setTimeout(() => {
      successMessage.value = null
    }, 5000)
  } catch (err) {
    console.error('Error approving project:', err)
    error.value = err.message || 'Failed to approve project'
  } finally {
    processingProjects.value = processingProjects.value.filter((id) => id !== projectId)
    processing.value = processingProjects.value.length > 0
  }
}

async function rejectProject(projectId) {
  const project = pendingProjects.value.find((p) => p.id === projectId)
  if (!project) return

  const reason = prompt('Please provide a reason for rejection:')
  if (!reason) return

  processingProjects.value.push(projectId)
  processing.value = true

  try {
    // Update project status to rejected
    const { getSupabase } = await import('@/services/supabaseClient')
    const supabase = getSupabase()

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

    // Remove from pending list
    pendingProjects.value = pendingProjects.value.filter((p) => p.id !== projectId)

    successMessage.value = `Project "${project.title}" has been rejected.`
    setTimeout(() => {
      successMessage.value = null
    }, 5000)
  } catch (err) {
    console.error('Error rejecting project:', err)
    error.value = err.message || 'Failed to reject project'
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
  margin: 0;
  color: #666;
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

.approve-btn:disabled,
.reject-btn:disabled {
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
