<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getAllProjects, updateProjectStatus } from '@/services/projectService'
import { generateProjectCertificate } from '@/services/certificateService'
import { notifyProjectApproved, notifyProjectRejected } from '@/services/emailService'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

const router = useRouter()
const userStore = useUserStore()

// State
const projects = ref([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const statusFilter = ref('')
const selectedProject = ref(null)
const showVerificationModal = ref(false)
const verificationNotes = ref('')
const verificationAction = ref('')

// Computed properties
const filteredProjects = computed(() => {
  let filtered = projects.value

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.location.toLowerCase().includes(term),
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter((project) => project.status === statusFilter.value)
  }

  return filtered
})

const projectStats = computed(() => {
  const stats = {
    total: projects.value.length,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  }

  projects.value.forEach((project) => {
    if (stats.hasOwnProperty(project.status)) {
      stats[project.status]++
    }
  })

  return stats
})

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

// Methods
async function loadProjects() {
  loading.value = true
  error.value = ''

  try {
    const result = await getAllProjects()
    projects.value = result.projects || []
  } catch (err) {
    error.value = 'Failed to load projects'
    console.error('Error loading projects:', err)
  } finally {
    loading.value = false
  }
}

function openVerificationModal(project, action) {
  selectedProject.value = project
  verificationAction.value = action
  verificationNotes.value = ''
  showVerificationModal.value = true
}

function closeVerificationModal() {
  showVerificationModal.value = false
  selectedProject.value = null
  verificationAction.value = ''
  verificationNotes.value = ''
}

async function handleVerification() {
  if (!selectedProject.value || !verificationAction.value) return

  try {
    // Update project status
    await updateProjectStatus(
      selectedProject.value.id,
      verificationAction.value,
      verificationNotes.value,
    )

    // Generate certificate and send notifications if project is approved
    if (verificationAction.value === 'approved') {
      try {
        const verificationData = {
          standard: 'EcoLink Standard',
          verifier_notes: verificationNotes.value,
          verifier_id: userStore.user?.id,
          verification_date: new Date().toISOString(),
        }

        await generateProjectCertificate(selectedProject.value.id, verificationData)
        console.log('Certificate generated successfully for project:', selectedProject.value.title)

        // Send approval notification email
        await notifyProjectApproved(
          selectedProject.value.id,
          selectedProject.value.user_id,
          verificationNotes.value,
        )
        console.log('Project approval notification sent')
      } catch (certError) {
        console.error('Error generating certificate:', certError)
        // Don't fail the entire operation if certificate generation fails
        error.value = 'Project approved but certificate generation failed'
      }
    }

    // Send rejection notification if project is rejected
    if (verificationAction.value === 'rejected') {
      try {
        await notifyProjectRejected(
          selectedProject.value.id,
          selectedProject.value.user_id,
          verificationNotes.value,
          'Please review the project requirements and consider resubmitting with the suggested improvements.',
        )
        console.log('Project rejection notification sent')
      } catch (emailError) {
        console.error('Error sending rejection notification:', emailError)
        // Don't fail the entire operation if email sending fails
      }
    }

    await loadProjects() // Reload projects
    closeVerificationModal()
  } catch (err) {
    error.value = 'Failed to update project status'
    console.error('Error updating project status:', err)
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'badge-pending'
    case 'under_review':
      return 'badge-under-review'
    case 'approved':
      return 'badge-approved'
    case 'rejected':
      return 'badge-rejected'
    default:
      return 'badge-default'
  }
}

function getStatusLabel(status) {
  const statusMap = {
    pending: 'Pending Review',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return statusMap[status] || status
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

function clearFilters() {
  searchTerm.value = ''
  statusFilter.value = ''
}

// Lifecycle
onMounted(() => {
  loadProjects()
})
</script>

<template>
  <div class="verifier-view">
    <header class="page-header">
      <div class="header-content">
        <button class="btn btn-ghost" @click="router.push('/dashboard')">
          ← Back to Dashboard
        </button>
        <h1 class="page-title">Verifier Panel</h1>
        <p class="page-subtitle">Verify and validate project claims</p>
      </div>
    </header>

    <main class="page-content">
      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Project Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ projectStats.total }}</div>
          <div class="stat-label">Total Projects</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-number">{{ projectStats.pending }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
        <div class="stat-card under-review">
          <div class="stat-number">{{ projectStats.under_review }}</div>
          <div class="stat-label">Under Review</div>
        </div>
        <div class="stat-card approved">
          <div class="stat-number">{{ projectStats.approved }}</div>
          <div class="stat-label">Approved</div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-number">{{ projectStats.rejected }}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filters">
          <UiInput v-model="searchTerm" placeholder="Search projects..." class="search-input" />
          <select v-model="statusFilter" class="filter-select">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <UiButton variant="outline" @click="clearFilters" size="small">Clear Filters</UiButton>
        </div>
      </div>

      <!-- Projects List -->
      <div class="projects-section">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading projects...</p>
        </div>

        <div v-else-if="filteredProjects.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Projects Found</h3>
          <p v-if="projects.length === 0">No projects have been submitted for verification yet.</p>
          <p v-else>No projects match your current filters. Try adjusting your search criteria.</p>
        </div>

        <div v-else class="projects-grid">
          <div v-for="project in filteredProjects" :key="project.id" class="project-card">
            <div class="project-header">
              <h3 class="project-title">{{ project.title }}</h3>
              <span :class="['status-badge', getStatusBadgeClass(project.status)]">
                {{ getStatusLabel(project.status) }}
              </span>
            </div>

            <div class="project-meta">
              <span class="project-category">{{ project.category }}</span>
              <span class="project-location">📍 {{ project.location }}</span>
            </div>

            <p class="project-description">
              {{ project.description.substring(0, 150)
              }}{{ project.description.length > 150 ? '...' : '' }}
            </p>

            <div class="project-footer">
              <span class="project-date">Submitted {{ formatDate(project.created_at) }}</span>
              <div class="project-actions">
                <UiButton
                  v-if="project.status === 'pending'"
                  size="small"
                  variant="outline"
                  @click="openVerificationModal(project, 'under_review')"
                >
                  Start Review
                </UiButton>
                <UiButton
                  v-if="project.status === 'under_review'"
                  size="small"
                  @click="openVerificationModal(project, 'approved')"
                >
                  Approve
                </UiButton>
                <UiButton
                  v-if="project.status === 'under_review'"
                  size="small"
                  variant="outline"
                  @click="openVerificationModal(project, 'rejected')"
                  class="reject-btn"
                >
                  Reject
                </UiButton>
                <UiButton
                  v-if="project.status === 'approved' || project.status === 'rejected'"
                  size="small"
                  variant="outline"
                  @click="openVerificationModal(project, 'under_review')"
                >
                  Re-review
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Verification Modal -->
    <div v-if="showVerificationModal" class="modal-overlay" @click="closeVerificationModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>
            {{
              verificationAction === 'approved'
                ? 'Approve Project'
                : verificationAction === 'rejected'
                  ? 'Reject Project'
                  : verificationAction === 'under_review'
                    ? 'Start Review'
                    : 'Update Status'
            }}
          </h2>
          <button class="close-btn" @click="closeVerificationModal">×</button>
        </div>

        <div class="modal-content">
          <div class="project-info">
            <h3>{{ selectedProject?.title }}</h3>
            <p><strong>Category:</strong> {{ selectedProject?.category }}</p>
            <p><strong>Location:</strong> {{ selectedProject?.location }}</p>
          </div>

          <div class="verification-form">
            <label class="form-label">Verification Notes *</label>
            <textarea
              v-model="verificationNotes"
              class="form-textarea"
              placeholder="Add your verification notes, findings, or comments..."
              rows="4"
              required
            ></textarea>
            <div class="field-help">{{ verificationNotes.length }}/500 characters</div>
          </div>
        </div>

        <div class="modal-actions">
          <UiButton variant="outline" @click="closeVerificationModal">Cancel</UiButton>
          <UiButton @click="handleVerification" :disabled="!verificationNotes.trim()">
            {{
              verificationAction === 'approved'
                ? 'Approve Project'
                : verificationAction === 'rejected'
                  ? 'Reject Project'
                  : verificationAction === 'under_review'
                    ? 'Start Review'
                    : 'Update Status'
            }}
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verifier-view {
  min-height: 100vh;
  background: var(--ecolink-bg);
}

.page-header {
  background: var(--ecolink-surface);
  border-bottom: 1px solid var(--ecolink-border);
  padding: 24px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin: 16px 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--ecolink-text);
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--ecolink-muted);
}

.page-content {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.error-message {
  background: var(--ecolink-error-bg);
  color: var(--ecolink-error);
  padding: 12px 16px;
  border-radius: var(--radius);
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
}

.stat-card.pending {
  border-left: 4px solid #f59e0b;
}

.stat-card.under-review {
  border-left: 4px solid #3b82f6;
}

.stat-card.approved {
  border-left: 4px solid #10b981;
}

.stat-card.rejected {
  border-left: 4px solid #ef4444;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--ecolink-text);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--ecolink-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filters-section {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 32px;
}

.filters {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  background: var(--ecolink-bg);
  color: var(--ecolink-text);
  font-size: 14px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--ecolink-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--ecolink-border);
  border-top: 3px solid var(--ecolink-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--ecolink-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ecolink-text);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.project-card {
  background: var(--ecolink-surface);
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  padding: 24px;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: var(--ecolink-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.project-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ecolink-text);
  flex: 1;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.badge-under-review {
  background: #dbeafe;
  color: #1e40af;
}

.badge-approved {
  background: #d1fae5;
  color: #065f46;
}

.badge-rejected {
  background: #fecaca;
  color: #991b1b;
}

.project-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--ecolink-muted);
}

.project-category {
  font-weight: 500;
  color: var(--ecolink-text);
}

.project-description {
  margin: 0 0 16px 0;
  color: var(--ecolink-text);
  line-height: 1.5;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--ecolink-border);
}

.project-date {
  font-size: 12px;
  color: var(--ecolink-muted);
}

.project-actions {
  display: flex;
  gap: 8px;
}

.reject-btn {
  color: var(--ecolink-error);
  border-color: var(--ecolink-error);
}

.reject-btn:hover {
  background: var(--ecolink-error);
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--ecolink-surface);
  border-radius: var(--radius);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--ecolink-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--ecolink-muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--ecolink-text);
}

.modal-content {
  padding: 0 24px;
}

.project-info {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--ecolink-bg);
  border-radius: var(--radius);
}

.project-info h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ecolink-text);
}

.project-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--ecolink-text);
}

.verification-form {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--ecolink-text);
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--ecolink-border);
  border-radius: var(--radius);
  background: var(--ecolink-bg);
  color: var(--ecolink-text);
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--ecolink-primary);
  box-shadow: 0 0 0 3px var(--ecolink-primary-50);
}

.field-help {
  margin-top: 4px;
  color: var(--ecolink-muted);
  font-size: 12px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid var(--ecolink-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-content {
    padding: 16px;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .project-actions {
    justify-content: center;
  }

  .modal {
    margin: 20px;
    max-width: calc(100% - 40px);
  }
}
</style>
