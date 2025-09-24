<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { projectService } from '@/services/projectService'
import ProjectForm from '@/components/ProjectForm.vue'
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
const categoryFilter = ref('')
const showProjectForm = ref(false)
const editingProject = ref(null)
const selectedProject = ref(null)
const showProjectModal = ref(false)

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

  // Filter by category
  if (categoryFilter.value) {
    filtered = filtered.filter((project) => project.category === categoryFilter.value)
  }

  return filtered
})

const statusOptions = computed(() => {
  const statuses = projectService.getProjectStatuses()
  return [{ value: '', label: 'All Statuses' }, ...statuses]
})

const categoryOptions = computed(() => {
  const categories = projectService.getProjectCategories()
  return [
    { value: '', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ]
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

// Methods
async function loadProjects() {
  loading.value = true
  error.value = ''

  try {
    projects.value = await projectService.getUserProjects()
  } catch (err) {
    error.value = 'Failed to load projects'
    console.error('Error loading projects:', err)
  } finally {
    loading.value = false
  }
}

function openProjectForm(project = null) {
  editingProject.value = project
  showProjectForm.value = true
}

function closeProjectForm() {
  showProjectForm.value = false
  editingProject.value = null
}

function openProjectModal(project) {
  selectedProject.value = project
  showProjectModal.value = true
}

function closeProjectModal() {
  showProjectModal.value = false
  selectedProject.value = null
}

async function handleProjectSuccess() {
  await loadProjects()
  closeProjectForm()
}

async function deleteProject(project) {
  if (
    !confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)
  ) {
    return
  }

  try {
    await projectService.deleteProject(project.id)
    await loadProjects()
  } catch (err) {
    error.value = 'Failed to delete project'
    console.error('Error deleting project:', err)
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
    pending: 'Pending',
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
  })
}

function clearFilters() {
  searchTerm.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
}

// Lifecycle
onMounted(() => {
  loadProjects()
})
</script>

<template>
  <div class="projects-view">
    <div class="page-header">
      <div class="header-content">
        <h1>My Projects</h1>
        <p>Manage your environmental projects and track their status</p>
      </div>
      <UiButton @click="openProjectForm()" class="create-btn"> + Create New Project </UiButton>
    </div>

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
      <div class="stat-card">
        <div class="stat-number">{{ projectStats.pending }}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ projectStats.under_review }}</div>
        <div class="stat-label">Under Review</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ projectStats.approved }}</div>
        <div class="stat-label">Approved</div>
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
        <select v-model="categoryFilter" class="filter-select">
          <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <UiButton variant="outline" @click="clearFilters" size="small"> Clear Filters </UiButton>
      </div>
    </div>

    <!-- Projects List -->
    <div class="projects-section">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading your projects...</p>
      </div>

      <div v-else-if="filteredProjects.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <h3>No Projects Found</h3>
        <p v-if="projects.length === 0">
          You haven't created any projects yet. Start by creating your first environmental project!
        </p>
        <p v-else>No projects match your current filters. Try adjusting your search criteria.</p>
        <UiButton @click="openProjectForm()" v-if="projects.length === 0">
          Create Your First Project
        </UiButton>
      </div>

      <div v-else class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="openProjectModal(project)"
        >
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
            <span class="project-date">Created {{ formatDate(project.created_at) }}</span>
            <div class="project-actions" @click.stop>
              <UiButton
                size="small"
                variant="outline"
                @click="openProjectForm(project)"
                :disabled="project.status !== 'pending'"
              >
                Edit
              </UiButton>
              <UiButton
                size="small"
                variant="outline"
                @click="deleteProject(project)"
                :disabled="project.status !== 'pending'"
                class="delete-btn"
              >
                Delete
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Form Modal -->
    <div v-if="showProjectForm" class="modal-overlay" @click="closeProjectForm">
      <div class="modal" @click.stop>
        <ProjectForm
          :project="editingProject"
          :mode="editingProject ? 'edit' : 'create'"
          @success="handleProjectSuccess"
          @cancel="closeProjectForm"
        />
      </div>
    </div>

    <!-- Project Detail Modal -->
    <div v-if="showProjectModal" class="modal-overlay" @click="closeProjectModal">
      <div class="modal project-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedProject?.title }}</h2>
          <button class="close-btn" @click="closeProjectModal">×</button>
        </div>

        <div class="modal-content">
          <div class="project-detail-meta">
            <div class="meta-item">
              <strong>Status:</strong>
              <span :class="['status-badge', getStatusBadgeClass(selectedProject?.status)]">
                {{ getStatusLabel(selectedProject?.status) }}
              </span>
            </div>
            <div class="meta-item">
              <strong>Category:</strong>
              <span>{{ selectedProject?.category }}</span>
            </div>
            <div class="meta-item">
              <strong>Location:</strong>
              <span>📍 {{ selectedProject?.location }}</span>
            </div>
            <div class="meta-item">
              <strong>Created:</strong>
              <span>{{ formatDate(selectedProject?.created_at) }}</span>
            </div>
          </div>

          <div class="project-detail-section">
            <h3>Description</h3>
            <p>{{ selectedProject?.description }}</p>
          </div>

          <div class="project-detail-section">
            <h3>Expected Impact</h3>
            <p>{{ selectedProject?.expected_impact }}</p>
          </div>

          <div v-if="selectedProject?.verification_notes" class="project-detail-section">
            <h3>Verification Notes</h3>
            <p>{{ selectedProject.verification_notes }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <UiButton variant="outline" @click="closeProjectModal"> Close </UiButton>
          <UiButton
            @click="openProjectForm(selectedProject)"
            :disabled="selectedProject?.status !== 'pending'"
          >
            Edit Project
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--ecolink-text);
}

.header-content p {
  margin: 0;
  color: var(--ecolink-muted);
  font-size: 16px;
}

.create-btn {
  flex-shrink: 0;
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
  cursor: pointer;
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
  background: var(--ecolink-yellow-100);
  color: var(--ecolink-yellow-700);
}

.badge-under-review {
  background: var(--ecolink-blue-100);
  color: var(--ecolink-blue-700);
}

.badge-approved {
  background: var(--ecolink-green-100);
  color: var(--ecolink-green-700);
}

.badge-rejected {
  background: var(--ecolink-red-100);
  color: var(--ecolink-red-700);
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

.delete-btn {
  color: var(--ecolink-error);
  border-color: var(--ecolink-error);
}

.delete-btn:hover {
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
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.project-detail-modal {
  max-width: 600px;
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

.project-detail-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: var(--ecolink-bg);
  border-radius: var(--radius);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item strong {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--ecolink-muted);
}

.project-detail-section {
  margin-bottom: 24px;
}

.project-detail-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ecolink-text);
}

.project-detail-section p {
  margin: 0;
  color: var(--ecolink-text);
  line-height: 1.6;
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
  .projects-view {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
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
}
</style>
