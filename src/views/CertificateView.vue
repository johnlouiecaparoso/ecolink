<template>
  <div class="certificate-view-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">My Certificates</h1>
            <p class="page-description">View and download your carbon credit certificates</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="certificate-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading your certificates...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Unable to load certificates</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="loadCertificates">Try Again</button>
        </div>

        <!-- Certificates Content -->
        <div v-else>
          <!-- Empty State -->
          <div v-if="certificates.length === 0" class="empty-state">
            <div class="empty-icon">📜</div>
            <h3>No certificates yet</h3>
            <p>Purchase carbon credits to receive certificates</p>
            <button class="btn btn-primary" @click="$router.push('/marketplace')">
              Browse Marketplace
            </button>
          </div>

          <!-- Certificates Grid -->
          <div v-else class="certificates-grid">
            <div v-for="certificate in certificates" :key="certificate.id" class="certificate-card">
              <div class="certificate-header">
                <div class="certificate-icon">🏆</div>
                <div class="certificate-info">
                  <h3 class="certificate-title">{{ certificate.project_title }}</h3>
                  <p class="certificate-location">📍 {{ certificate.project_location }}</p>
                  <span class="certificate-number">Cert #{{ certificate.certificate_number }}</span>
                </div>
              </div>

              <div class="certificate-details">
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">{{ certificate.project_category }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Credits:</span>
                  <span class="detail-value">{{
                    certificate.credits_quantity.toLocaleString()
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Vintage Year:</span>
                  <span class="detail-value">{{ certificate.vintage_year }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Standard:</span>
                  <span class="detail-value">{{ certificate.verification_standard }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Issued:</span>
                  <span class="detail-value">{{ formatDate(certificate.issued_at) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value" :class="certificate.status">
                    {{ certificate.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <div class="certificate-actions">
                <button class="btn btn-primary btn-sm" @click="downloadCertificate(certificate)">
                  Download PDF
                </button>
                <button class="btn btn-outline btn-sm" @click="verifyCertificate(certificate)">
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getUserCertificates } from '@/services/certificateService'

const router = useRouter()
const userStore = useUserStore()

// Data
const certificates = ref([])
const loading = ref(false)
const error = ref('')

// Methods
async function loadCertificates() {
  if (!userStore.session?.user?.id) {
    error.value = 'Please log in to view your certificates'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await getUserCertificates(userStore.session.user.id)
    certificates.value = data || []
    console.log('✅ Certificates loaded successfully')
  } catch (err) {
    console.error('❌ Error loading certificates:', err)
    error.value = 'Failed to load certificates. Please try again.'
  } finally {
    loading.value = false
  }
}

async function downloadCertificate(certificate) {
  try {
    // In a real implementation, this would call a download service
    // For now, we'll show the certificate details
    console.log('Downloading certificate:', certificate.certificate_number)
    alert(`Certificate ${certificate.certificate_number} download feature coming soon`)
  } catch (err) {
    console.error('Error downloading certificate:', err)
    alert('Failed to download certificate. Please try again.')
  }
}

function verifyCertificate(certificate) {
  // Open verification in new tab or show verification modal
  router.push({
    path: '/',
    query: { verify: certificate.certificate_number },
  })
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Lifecycle
onMounted(() => {
  loadCertificates()
})
</script>

<style scoped>
.certificate-view-page {
  min-height: 100vh;
  background: var(--bg-primary, #ffffff);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Page Header */
.page-header {
  background: var(--primary-color, #10b981);
  padding: 2rem 0;
  border-bottom: none;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  text-align: center;
  width: 100%;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #fff;
  margin: 0;
}

/* Main Content */
.certificate-content {
  padding: 2rem 0;
}

/* Loading State */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color, #d1e7dd);
  border-top-color: var(--primary-color, #069e2d);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-muted, #718096);
  margin: 0 0 2rem 0;
}

/* Certificates Grid */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.certificate-card {
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #d1e7dd);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.certificate-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.certificate-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light, #e8f5e8);
}

.certificate-icon {
  font-size: 2.5rem;
}

.certificate-info {
  flex: 1;
}

.certificate-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  margin: 0 0 0.25rem 0;
}

.certificate-location {
  color: var(--text-muted, #718096);
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.certificate-number {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-light, #e8f5e8);
  color: var(--primary-color, #069e2d);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.certificate-details {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-light, #e8f5e8);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--text-muted, #718096);
  font-size: 0.875rem;
}

.detail-value {
  color: var(--text-primary, #1a1a1a);
  font-weight: 500;
  font-size: 0.875rem;
}

.detail-value.active {
  color: var(--success-color, #069e2d);
}

.certificate-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color, #069e2d);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover, #058e3f);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color, #d1e7dd);
  color: var(--text-primary, #1a1a1a);
}

.btn-outline:hover {
  background: var(--bg-secondary, #f8fdf8);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted, #718096);
  border: none;
}

.btn-ghost:hover {
  color: var(--text-primary, #1a1a1a);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .certificates-grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
