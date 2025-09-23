<template>
  <div class="profile-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">My Profile</h1>
        <p class="page-description">Manage your account settings and view your carbon impact</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="profile-content">
      <div class="container">
        <div class="content-layout">
          <!-- Left Column - Profile Overview -->
          <div class="profile-sidebar">
            <!-- Profile Overview Card -->
            <div class="profile-card">
              <div class="profile-avatar">
                <div class="avatar-circle">
                  <span class="avatar-initials">{{ userProfile.initials }}</span>
                </div>
              </div>
              <div class="profile-info">
                <h2 class="profile-name">{{ userProfile.fullName }}</h2>
                <p class="profile-email">{{ userProfile.email }}</p>
                <div class="profile-company">
                  <svg class="company-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                  <span>{{ userProfile.company }}</span>
                </div>
                <div class="profile-location">
                  <svg class="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  <span>{{ userProfile.location }}</span>
                </div>
                <p class="profile-bio">{{ userProfile.bio }}</p>
                <button class="edit-profile-button" @click="editProfile">Edit Profile</button>
              </div>
            </div>

            <!-- Carbon Impact Card -->
            <div class="carbon-impact-card">
              <div class="card-header">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  ></path>
                </svg>
                <h3 class="card-title">Carbon Impact</h3>
              </div>
              <div class="impact-metrics">
                <div class="metric-item">
                  <span class="metric-value">{{
                    carbonImpact.tonnesRetired.toLocaleString()
                  }}</span>
                  <span class="metric-label">Tonnes Retired</span>
                </div>
                <div class="metric-item">
                  <span class="metric-value">{{ carbonImpact.projectsSupported }}</span>
                  <span class="metric-label">Projects Supported</span>
                </div>
              </div>
              <div class="financial-summary">
                <div class="summary-item">
                  <span class="summary-label">Total Purchased:</span>
                  <span class="summary-value"
                    >{{ carbonImpact.totalPurchased.toLocaleString() }} tonnes</span
                  >
                </div>
                <div class="summary-item">
                  <span class="summary-label">Portfolio Value:</span>
                  <span class="summary-value"
                    >${{ carbonImpact.portfolioValue.toLocaleString() }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Achievements Card -->
            <div class="achievements-card">
              <div class="card-header">
                <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  ></path>
                </svg>
                <h3 class="card-title">Achievements</h3>
              </div>
              <div class="achievements-list">
                <div
                  v-for="(achievement, index) in achievements"
                  :key="index"
                  class="achievement-item"
                >
                  <div class="achievement-icon" :style="{ backgroundColor: achievement.color }">
                    <span class="icon-emoji">{{ achievement.icon }}</span>
                  </div>
                  <div class="achievement-content">
                    <h4 class="achievement-title">{{ achievement.title }}</h4>
                    <p class="achievement-description">{{ achievement.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Account Settings -->
          <div class="account-settings">
            <div class="settings-card">
              <!-- Settings Tabs -->
              <div class="settings-tabs">
                <button
                  v-for="tab in settingsTabs"
                  :key="tab.id"
                  :class="['tab-button', { active: activeTab === tab.id }]"
                  @click="activeTab = tab.id"
                >
                  {{ tab.label }}
                </button>
              </div>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Account Tab -->
                <div v-if="activeTab === 'account'" class="tab-panel">
                  <!-- Personal Information -->
                  <div class="settings-section">
                    <h3 class="section-title">Personal Information</h3>
                    <div class="form-grid">
                      <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input
                          v-model="editForm.fullName"
                          type="text"
                          class="form-input"
                          :disabled="!isEditing"
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input
                          v-model="editForm.email"
                          type="email"
                          class="form-input"
                          :disabled="!isEditing"
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Company</label>
                        <input
                          v-model="editForm.company"
                          type="text"
                          class="form-input"
                          :disabled="!isEditing"
                        />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Location</label>
                        <input
                          v-model="editForm.location"
                          type="text"
                          class="form-input"
                          :disabled="!isEditing"
                        />
                      </div>
                      <div class="form-group full-width">
                        <label class="form-label">Bio</label>
                        <textarea
                          v-model="editForm.bio"
                          class="form-textarea"
                          :disabled="!isEditing"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                    <button v-if="isEditing" class="save-button" @click="saveChanges">
                      Save Changes
                    </button>
                  </div>

                  <!-- Account Status -->
                  <div class="settings-section">
                    <h3 class="section-title">Account Status</h3>
                    <div class="status-list">
                      <div class="status-item">
                        <div class="status-info">
                          <span class="status-label">Account Verification</span>
                          <span class="status-description">Your account is fully verified</span>
                        </div>
                        <div class="status-badge verified">Verified</div>
                      </div>
                      <div class="status-item">
                        <div class="status-info">
                          <span class="status-label">KYC Status</span>
                          <span class="status-description"
                            >Know Your Customer verification complete</span
                          >
                        </div>
                        <div class="status-badge verified">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Notifications Tab -->
                <div v-if="activeTab === 'notifications'" class="tab-panel">
                  <div class="settings-section">
                    <h3 class="section-title">Notification Preferences</h3>
                    <div class="notification-settings">
                      <div
                        v-for="(setting, key) in notificationSettings"
                        :key="key"
                        class="notification-item"
                      >
                        <div class="notification-info">
                          <span class="notification-label">{{ setting.label }}</span>
                          <span class="notification-description">{{ setting.description }}</span>
                        </div>
                        <label class="toggle-switch">
                          <input v-model="setting.enabled" type="checkbox" class="toggle-input" />
                          <span class="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Security Tab -->
                <div v-if="activeTab === 'security'" class="tab-panel">
                  <div class="settings-section">
                    <h3 class="section-title">Security Settings</h3>
                    <div class="security-settings">
                      <div class="security-item">
                        <div class="security-info">
                          <span class="security-label">Password</span>
                          <span class="security-description">Last changed 3 months ago</span>
                        </div>
                        <button class="security-button">Change Password</button>
                      </div>
                      <div class="security-item">
                        <div class="security-info">
                          <span class="security-label">Two-Factor Authentication</span>
                          <span class="security-description">Add an extra layer of security</span>
                        </div>
                        <button class="security-button">Enable 2FA</button>
                      </div>
                      <div class="security-item">
                        <div class="security-info">
                          <span class="security-label">Login Sessions</span>
                          <span class="security-description">Manage active sessions</span>
                        </div>
                        <button class="security-button">View Sessions</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  data() {
    return {
      activeTab: 'account',
      isEditing: false,
      settingsTabs: [
        { id: 'account', label: 'Account' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'security', label: 'Security' },
      ],
      userProfile: {
        initials: 'JD',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Green Solutions Inc.',
        location: 'San Francisco, CA',
        bio: 'Sustainability enthusiast committed to carbon neutrality',
      },
      editForm: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Green Solutions Inc.',
        location: 'San Francisco, CA',
        bio: 'Sustainability enthusiast committed to carbon neutrality',
      },
      carbonImpact: {
        tonnesRetired: 1250,
        projectsSupported: 8,
        totalPurchased: 1500,
        portfolioValue: 31250,
      },
      achievements: [
        {
          title: 'Climate Champion',
          description: 'Retired 1000+ tonnes CO2e',
          icon: '🏆',
          color: '#f59e0b',
        },
        {
          title: 'Early Adopter',
          description: 'First 100 users on EcoLink',
          icon: '🌱',
          color: '#10b981',
        },
        {
          title: 'Diversified Portfolio',
          description: 'Credits from 5+ project types',
          icon: '🏢',
          color: '#3b82f6',
        },
      ],
      notificationSettings: {
        emailNotifications: {
          label: 'Email Notifications',
          description: 'Receive updates via email',
          enabled: true,
        },
        projectUpdates: {
          label: 'Project Updates',
          description: 'Get notified about project milestones',
          enabled: true,
        },
        marketAlerts: {
          label: 'Market Alerts',
          description: 'Price alerts and market updates',
          enabled: false,
        },
        newsletter: {
          label: 'Newsletter',
          description: 'Weekly sustainability newsletter',
          enabled: true,
        },
      },
    }
  },
  methods: {
    editProfile() {
      this.isEditing = true
      // Copy current values to edit form
      this.editForm = { ...this.userProfile }
    },
    saveChanges() {
      // Update user profile with edited values
      this.userProfile = { ...this.editForm }
      this.isEditing = false

      // Show success message
      alert('Profile updated successfully!')

      // In a real app, you would make an API call here
      console.log('Saving profile:', this.userProfile)
    },
    cancelEdit() {
      this.isEditing = false
      // Reset edit form to current values
      this.editForm = { ...this.userProfile }
    },
  },
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Page Header */
.page-header {
  padding: 2rem 0;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
}

/* Main Content */
.profile-content {
  padding: 2rem 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

/* Profile Sidebar */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Profile Card */
.profile-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.profile-avatar {
  text-align: center;
  margin-bottom: 1.5rem;
}

.avatar-circle {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.avatar-initials {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: white;
}

.profile-name {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  text-align: center;
}

.profile-email {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  text-align: center;
}

.profile-company,
.profile-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.company-icon,
.location-icon {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted);
}

.profile-bio {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  text-align: center;
  font-style: italic;
}

.edit-profile-button {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.edit-profile-button:hover {
  background: var(--primary-color);
  color: white;
}

/* Carbon Impact Card */
.carbon-impact-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.card-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-color);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.impact-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.metric-item {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.financial-summary {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.summary-value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

/* Achievements Card */
.achievements-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.achievement-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 1.25rem;
}

.achievement-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.achievement-description {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

/* Account Settings */
.account-settings {
  min-height: 500px;
}

.settings-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.settings-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab-button {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: var(--font-size-base);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background: var(--bg-secondary);
}

.tab-content {
  padding: 2rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--bg-primary);
  outline: none;
  transition: var(--transition);
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(6, 158, 45, 0.1);
}

.form-input:disabled,
.form-textarea:disabled {
  background: var(--bg-muted);
  color: var(--text-muted);
  cursor: not-allowed;
}

.save-button {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.save-button:hover {
  background: var(--primary-hover);
}

/* Status List */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-label {
  font-weight: 500;
  color: var(--text-primary);
}

.status-description {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.verified {
  background: var(--primary-light);
  color: var(--primary-color);
}

/* Notification Settings */
.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.notification-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-label {
  font-weight: 500;
  color: var(--text-primary);
}

.notification-description {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-muted);
  transition: var(--transition);
  border-radius: 1.5rem;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 1.25rem;
  width: 1.25rem;
  left: 0.125rem;
  bottom: 0.125rem;
  background-color: white;
  transition: var(--transition);
  border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(1.5rem);
}

/* Security Settings */
.security-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.security-label {
  font-weight: 500;
  color: var(--text-primary);
}

.security-description {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.security-button {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.security-button:hover {
  background: var(--primary-hover);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-content {
    padding: 1.5rem 0;
  }

  .page-title {
    font-size: var(--font-size-3xl);
  }

  .settings-tabs {
    flex-direction: column;
  }

  .tab-button {
    text-align: left;
    border-bottom: none;
    border-left: 2px solid transparent;
  }

  .tab-button.active {
    border-bottom-color: transparent;
    border-left-color: var(--primary-color);
  }

  .tab-content {
    padding: 1.5rem;
  }

  .impact-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
