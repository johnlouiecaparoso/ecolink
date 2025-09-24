<template>
  <div class="certificates-view">
    <div class="page-header">
      <h1 class="page-title">Certificates</h1>
      <p class="page-description">View and manage your environmental certificates</p>
    </div>

    <div class="certificates-content">
      <div class="certificates-grid">
        <div v-for="certificate in certificates" :key="certificate.id" class="certificate-card">
          <div class="certificate-header">
            <h3 class="certificate-title">{{ certificate.title }}</h3>
            <span class="certificate-status" :class="certificate.status">
              {{ certificate.status }}
            </span>
          </div>
          <div class="certificate-body">
            <p class="certificate-description">{{ certificate.description }}</p>
            <div class="certificate-meta">
              <span class="certificate-date">Issued: {{ formatDate(certificate.issuedDate) }}</span>
              <span class="certificate-credits">{{ certificate.credits }} Credits</span>
            </div>
          </div>
          <div class="certificate-actions">
            <button class="btn btn-primary" @click="downloadCertificate(certificate)">
              Download PDF
            </button>
            <button class="btn btn-secondary" @click="viewCertificate(certificate)">
              View Details
            </button>
          </div>
        </div>
      </div>

      <div v-if="certificates.length === 0" class="empty-state">
        <div class="empty-icon">📜</div>
        <h3>No Certificates Yet</h3>
        <p>
          You don't have any certificates yet. Start by participating in environmental projects!
        </p>
        <button class="btn btn-primary" @click="goToProjects">Browse Projects</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/formatDate'

export default {
  name: 'CertificatesView',
  setup() {
    const router = useRouter()
    const certificates = ref([])

    // Mock data - replace with actual API call
    const loadCertificates = () => {
      certificates.value = [
        {
          id: 1,
          title: 'Carbon Offset Certificate',
          description: 'Certificate for reducing 100 tons of CO2 emissions',
          status: 'active',
          issuedDate: new Date('2024-01-15'),
          credits: 100,
        },
        {
          id: 2,
          title: 'Renewable Energy Certificate',
          description: 'Certificate for generating 50 MWh of renewable energy',
          status: 'active',
          issuedDate: new Date('2024-02-20'),
          credits: 50,
        },
      ]
    }

    const downloadCertificate = (certificate) => {
      console.log('Downloading certificate:', certificate.title)
      // Implement download functionality
    }

    const viewCertificate = (certificate) => {
      console.log('Viewing certificate:', certificate.title)
      // Implement view functionality
    }

    const goToProjects = () => {
      router.push('/marketplace')
    }

    onMounted(() => {
      loadCertificates()
    })

    return {
      certificates,
      downloadCertificate,
      viewCertificate,
      goToProjects,
      formatDate,
    }
  },
}
</script>

<style scoped>
.certificates-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-description {
  color: #718096;
  font-size: 1.1rem;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.certificate-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.certificate-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.certificate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.certificate-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.certificate-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
}

.certificate-status.active {
  background: #c6f6d5;
  color: #22543d;
}

.certificate-status.pending {
  background: #fed7d7;
  color: #742a2a;
}

.certificate-body {
  margin-bottom: 1.5rem;
}

.certificate-description {
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.certificate-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #718096;
}

.certificate-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover {
  background: #2c5aa0;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
}
</style>
