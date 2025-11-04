<template>
  <div class="submit-project-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Submit a Project</h1>
        <p class="page-description">
          Submit your environmental project for verification and potential carbon credit generation
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="submit-content">
      <div class="container">
        <div class="content-layout">
          <!-- Project Form -->
          <div class="form-section">
            <ProjectForm @success="handleProjectSuccess" @cancel="handleProjectCancel" />
          </div>

          <!-- Information Sidebar -->
          <div class="info-sidebar">
            <div class="info-card">
              <h3 class="info-title">Submission Guidelines</h3>
              <ul class="info-list">
                <li>Provide detailed project description</li>
                <li>Include measurable environmental impact</li>
                <li>Upload supporting documents</li>
                <li>Specify project location and timeline</li>
                <li>Estimate carbon credit potential</li>
              </ul>
            </div>

            <div class="info-card">
              <h3 class="info-title">Review Process</h3>
              <div class="process-steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>Initial Review</h4>
                    <p>Project details and documentation review</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>Verification</h4>
                    <p>On-site verification by certified verifiers</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>Approval</h4>
                    <p>Final approval and credit issuance</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-card">
              <h3 class="info-title">Need Help?</h3>
              <p class="help-text">
                Contact our support team for assistance with project submission or verification
                requirements.
              </p>
              <button class="help-button">Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ProjectForm from '@/components/ProjectForm.vue'

const router = useRouter()

const handleProjectSuccess = (projectData) => {
  console.log('Project submitted successfully:', projectData)
  // The modern prompt is already shown by ProjectForm component
  // No need to show another prompt - the user can stay on the page or navigate manually
}

const handleProjectCancel = () => {
  console.log('Project submission cancelled')
  // Navigate back to dashboard or homepage
  router.push('/')
}
</script>

<style scoped>
.submit-project-page {
  min-height: 100vh;
  background: var(--bg-primary, #ffffff);
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
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: 1.125rem;
  color: #fff;
  line-height: 1.6;
}

/* Main Content */
.submit-content {
  padding: 2rem 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.form-section {
  background: var(--bg-primary, #ffffff);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Information Sidebar */
.info-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin-bottom: 1rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  padding: 0.5rem 0;
  color: var(--text-secondary, #4a5568);
  position: relative;
  padding-left: 1.5rem;
}

.info-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary-color, #069e2d);
  font-weight: bold;
}

/* Process Steps */
.process-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  width: 2rem;
  height: 2rem;
  background: var(--primary-color, #069e2d);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #1a202c);
  margin: 0 0 0.25rem 0;
}

.step-content p {
  font-size: 0.875rem;
  color: var(--text-muted, #718096);
  margin: 0;
  line-height: 1.4;
}

/* Help Section */
.help-text {
  color: var(--text-secondary, #4a5568);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.help-button {
  background: var(--primary-color, #069e2d);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.help-button:hover {
  background: var(--primary-hover, #058e3f);
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
  }

  .submit-content {
    padding: 1.5rem 0;
  }
}
</style>
