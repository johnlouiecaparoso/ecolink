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
                <!-- Beneficiary Name (prominently displayed) -->
                <div class="detail-row highlight-row">
                  <span class="detail-label">Beneficiary:</span>
                  <span class="detail-value highlight-value">{{ 
                    certificate.beneficiary_name || 
                    certificate.certificate_data?.beneficiary_name || 
                    'Not specified' 
                  }}</span>
                </div>
                
                <!-- Project Description -->
                <div v-if="certificate.project_description || certificate.certificate_data?.project_description" class="detail-row">
                  <span class="detail-label">Project Description:</span>
                  <span class="detail-value description-value">{{
                    certificate.project_description || 
                    certificate.certificate_data?.project_description
                  }}</span>
                </div>
                
                <!-- Tonnes of CO₂ Retired -->
                <div class="detail-row highlight-row">
                  <span class="detail-label">Tonnes of CO₂ Retired:</span>
                  <span class="detail-value highlight-value">{{
                    (certificate.tonnes_co2 || 
                     certificate.certificate_data?.tonnes_co2 || 
                     certificate.credits_quantity || 0).toLocaleString()
                  }} tonnes CO₂</span>
                </div>
                
                <!-- Purpose -->
                <div v-if="certificate.purpose || certificate.certificate_data?.purpose" class="detail-row">
                  <span class="detail-label">{{ 
                    certificate.certificate_type === 'retirement' ? 'Purpose of Retirement:' : 'Purpose:' 
                  }}</span>
                  <span class="detail-value">{{
                    certificate.purpose || certificate.certificate_data?.purpose
                  }}</span>
                </div>
                
                <!-- Transaction ID -->
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value transaction-id">{{
                    certificate.transaction_id_ref || 
                    certificate.certificate_data?.transaction_id_ref || 
                    certificate.transaction_id || 
                    'N/A'
                  }}</span>
                </div>
                
                <!-- Onchain Verification -->
                <div v-if="certificate.wallet_address || certificate.certificate_data?.wallet_address || certificate.payment_reference || certificate.certificate_data?.payment_reference" class="detail-row verification-row">
                  <span class="detail-label">✓ Onchain Verification:</span>
                  <span class="detail-value verification-value">
                    {{ certificate.wallet_address || certificate.certificate_data?.wallet_address ? 'Verified via wallet' : 'Verified via payment reference' }}
                  </span>
                </div>
                
      <!-- Purchase Date & Time -->
      <div class="detail-row highlight-row">
        <span class="detail-label">Purchase Date & Time:</span>
        <span class="detail-value highlight-value">{{
          formatDate(
            certificate.purchase_date || 
            certificate.purchase_datetime || 
            certificate.certificate_data?.purchase_date || 
            certificate.certificate_data?.purchase_datetime || 
            certificate.timestamp || 
            certificate.issued_at
          )
        }}</span>
      </div>
      
      <!-- Certificate Issued (for reference) -->
      <div class="detail-row">
        <span class="detail-label">Certificate Issued:</span>
        <span class="detail-value">{{ formatDate(certificate.issued_at || certificate.timestamp) }}</span>
      </div>
                
                <!-- Wallet Address -->
                <div v-if="certificate.wallet_address || certificate.certificate_data?.wallet_address" class="detail-row">
                  <span class="detail-label">Wallet Address:</span>
                  <span class="detail-value wallet-address">{{
                    certificate.wallet_address || certificate.certificate_data?.wallet_address
                  }}</span>
                </div>
                
                <!-- Additional Details -->
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
    console.log('✅ Certificates loaded:', certificates.value.length)
    
    // If no certificates found, try generating missing ones for existing purchases
    if (certificates.value.length === 0) {
      console.log('🔄 No certificates found, checking for missing certificates...')
      try {
        const { generateMissingCertificates } = await import('@/services/certificateService')
        const result = await generateMissingCertificates(userStore.session.user.id)
        if (result.generated > 0) {
          console.log(`✅ Generated ${result.generated} missing certificates, reloading...`)
          // Reload certificates after generation
          const reloadedData = await getUserCertificates(userStore.session.user.id)
          certificates.value = reloadedData || []
          console.log('✅ Certificates reloaded after generation:', certificates.value.length)
        }
      } catch (genErr) {
        console.warn('⚠️ Could not generate missing certificates:', genErr)
      }
    }
  } catch (err) {
    console.error('❌ Error loading certificates:', err)
    error.value = 'Failed to load certificates. Please try again.'
  } finally {
    loading.value = false
  }
}

async function downloadCertificate(certificate) {
  try {
    console.log('🔄 Starting certificate download:', certificate.certificate_number)
    
    if (!certificate || !certificate.certificate_number) {
      throw new Error('Invalid certificate data')
    }
    
    // Try to load transaction data for the certificate
    let transaction = null
    try {
      const supabase = (await import('@/services/supabaseClient')).getSupabase()
      if (certificate.transaction_id) {
        const { data } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('id', certificate.transaction_id)
          .single()
        transaction = data
        console.log('✅ Transaction data loaded for certificate')
      }
    } catch (err) {
      console.warn('⚠️ Could not load transaction data (non-critical):', err)
    }

    // Use PDF generation service if available, otherwise fallback
    try {
      console.log('🔄 Attempting PDF generation...')
      const { generateCertificatePDF } = await import('@/services/certificatePdfService')
      const filename = await generateCertificatePDF(certificate, transaction)
      console.log('✅ Certificate PDF downloaded:', filename)
      alert('Certificate downloaded successfully!')
    } catch (pdfError) {
      console.error('❌ PDF generation error:', pdfError)
      console.log('🔄 Falling back to text certificate...')
      
      // Fallback: Create a comprehensive text-based certificate
      const beneficiaryName = certificate.beneficiary_name || 
                             certificate.certificate_data?.beneficiary_name || 
                             'Unknown'
      const projectDescription = certificate.project_description || 
                                 certificate.certificate_data?.project_description || 
                                 ''
      const tonnesCO2 = certificate.tonnes_co2 || 
                       certificate.certificate_data?.tonnes_co2 || 
                       certificate.credits_quantity || 0
      const purpose = certificate.purpose || 
                     certificate.certificate_data?.purpose || 
                     (certificate.certificate_type === 'retirement' ? 'Carbon Offset' : 'Carbon Credit Purchase')
      const transactionId = certificate.transaction_id_ref || 
                           certificate.certificate_data?.transaction_id_ref || 
                           certificate.transaction_id || 
                           'N/A'
      const walletAddress = certificate.wallet_address || 
                           certificate.certificate_data?.wallet_address || 
                           'Not linked to a wallet'
      const purchaseDateTime = certificate.purchase_date || 
                               certificate.purchase_datetime || 
                               certificate.certificate_data?.purchase_date || 
                               certificate.certificate_data?.purchase_datetime || 
                               certificate.timestamp || 
                               certificate.issued_at
      
      const certText = `
═══════════════════════════════════════════════════════════
        CERTIFICATE OF CARBON CREDIT
═══════════════════════════════════════════════════════════

Certificate Number: ${certificate.certificate_number}
Issued Date: ${formatDate(certificate.issued_at || certificate.timestamp)}

This certifies that:

BENEFICIARY: ${beneficiaryName}

PROJECT INFORMATION:
───────────────────────────────────────────────────────────
Project Name: ${certificate.project_title || 'Unknown Project'}
Project Description: ${projectDescription || 'N/A'}
Category: ${certificate.project_category || 'Unknown'}
Location: ${certificate.project_location || 'Unknown'}
Vintage Year: ${certificate.vintage_year || 'N/A'}
Verification Standard: ${certificate.verification_standard || 'Unknown'}

CARBON CREDITS:
───────────────────────────────────────────────────────────
Tonnes of CO₂ Retired: ${tonnesCO2.toLocaleString()} tonnes CO₂
Credits Quantity: ${certificate.credits_quantity || 0}

PURPOSE:
───────────────────────────────────────────────────────────
${purpose}

TRANSACTION & VERIFICATION:
───────────────────────────────────────────────────────────
Transaction ID: ${transactionId}
Wallet Address: ${walletAddress}

PURCHASE INFORMATION:
───────────────────────────────────────────────────────────
Purchase Date & Time: ${formatDate(purchaseDateTime)}
Certificate Issued: ${formatDate(certificate.issued_at || certificate.timestamp)}

═══════════════════════════════════════════════════════════
This certificate is issued by EcoLink and verifies the 
ownership/retirement of carbon credits.

For verification, visit: https://ecolink.com/verify
═══════════════════════════════════════════════════════════
      `.trim()
      
      const blob = new Blob([certText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${certificate.certificate_number}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log('✅ Text certificate downloaded as fallback')
      alert('Certificate downloaded as text file (PDF generation unavailable)')
    }
  } catch (err) {
    console.error('❌ Error downloading certificate:', err)
    alert(`Failed to download certificate: ${err.message || 'Unknown error'}. Please try again.`)
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
  word-break: break-word;
}

.detail-value.active {
  color: var(--success-color, #069e2d);
}

.detail-row.highlight-row {
  background: var(--primary-light, #e8f5e8);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

.detail-value.highlight-value {
  color: var(--primary-color, #069e2d);
  font-weight: 600;
  font-size: 0.9375rem;
}

.detail-value.description-value {
  font-style: italic;
  color: var(--text-muted, #718096);
  line-height: 1.5;
}

.detail-value.transaction-id {
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
  color: var(--text-primary, #1a1a1a);
}

.detail-row.verification-row {
  background: var(--success-light, #d1fae5);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

.detail-value.verification-value {
  color: var(--success-color, #069e2d);
  font-weight: 600;
}

.detail-value.wallet-address {
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
  word-break: break-all;
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
