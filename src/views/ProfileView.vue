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
                      <!-- Loading State -->
                      <div v-if="loading" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Loading profile...</p>
                      </div>

                      <!-- Error Messages -->
                      <div v-if="errors.general" class="error-message">
                        {{ errors.general }}
                      </div>

                      <!-- Success Message -->
                      <div v-if="successMessage" class="success-message">
                        {{ successMessage }}
                      </div>

                      <!-- Form Fields -->
                      <template v-if="!loading">
                        <div class="form-group">
                          <label class="form-label">Full Name *</label>
                          <input
                            v-model="editForm.full_name"
                            type="text"
                            class="form-input"
                            :class="{ error: errors.full_name }"
                            :disabled="!isEditing"
                            placeholder="Enter your full name"
                          />
                          <span v-if="errors.full_name" class="field-error">{{
                            errors.full_name
                          }}</span>
                        </div>
                        <div class="form-group">
                          <label class="form-label">Email Address</label>
                          <input
                            v-model="editForm.email"
                            type="email"
                            class="form-input"
                            :class="{ error: errors.email }"
                            :disabled="!isEditing"
                            placeholder="Enter your email"
                          />
                          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
                        </div>
                        <div class="form-group">
                          <label class="form-label">Company</label>
                          <input
                            v-model="editForm.company"
                            type="text"
                            class="form-input"
                            :disabled="!isEditing"
                            placeholder="Enter your company"
                          />
                        </div>
                        <div class="form-group">
                          <label class="form-label">Location</label>
                          <input
                            v-model="editForm.location"
                            type="text"
                            class="form-input"
                            :disabled="!isEditing"
                            placeholder="Enter your location"
                          />
                        </div>
                        <div class="form-group full-width">
                          <label class="form-label">Bio</label>
                          <textarea
                            v-model="editForm.bio"
                            class="form-textarea"
                            :class="{ error: errors.bio }"
                            :disabled="!isEditing"
                            rows="3"
                            placeholder="Tell us about yourself..."
                            maxlength="500"
                          ></textarea>
                          <span v-if="errors.bio" class="field-error">{{ errors.bio }}</span>
                          <span v-if="editForm.bio" class="char-count">
                            {{ editForm.bio.length }}/500 characters
                          </span>
                        </div>
                      </template>
                    </div>

                    <!-- Action Buttons -->
                    <div v-if="isEditing && !loading" class="form-actions">
                      <button class="save-button" @click="saveChanges" :disabled="saving">
                        <span v-if="saving">Saving...</span>
                        <span v-else>Save Changes</span>
                      </button>
                      <button class="cancel-button" @click="cancelEdit" :disabled="saving">
                        Cancel
                      </button>
                    </div>
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
import { useUserStore } from '@/store/userStore'
import {
  getProfile,
  updateProfile,
  getUserInitials,
  validateProfileData,
} from '@/services/profileService'

export default {
  name: 'ProfileView',
  setup() {
    const store = useUserStore()
    return { store }
  },
  data() {
    return {
      activeTab: 'account',
      isEditing: false,
      loading: false,
      saving: false,
      errors: {},
      successMessage: '',
      settingsTabs: [
        { id: 'account', label: 'Account' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'security', label: 'Security' },
      ],
      userProfile: {
        initials: 'U',
        fullName: '',
        email: '',
        company: '',
        location: '',
        bio: '',
      },
      editForm: {
        full_name: '',
        email: '',
        company: '',
        location: '',
        bio: '',
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
  async mounted() {
    await this.loadProfile()
  },
  methods: {
    async loadProfile() {
      if (!this.store.isAuthenticated) {
        this.$router.push('/login')
        return
      }

      this.loading = true
      try {
        const userId = this.store.session?.user?.id
        if (!userId) {
          throw new Error('User ID not found')
        }

        const profile = await getProfile(userId)

        // Update user profile display
        this.userProfile = {
          initials: getUserInitials(profile.full_name),
          fullName: profile.full_name || '',
          email: profile.email || '',
          company: profile.company || '',
          location: profile.location || '',
          bio: profile.bio || '',
        }

        // Update edit form
        this.editForm = {
          full_name: profile.full_name || '',
          email: profile.email || '',
          company: profile.company || '',
          location: profile.location || '',
          bio: profile.bio || '',
        }

        console.log('Profile loaded successfully:', profile)
      } catch (error) {
        console.error('Error loading profile:', error)
        this.errors.general = 'Failed to load profile. Please try again.'
      } finally {
        this.loading = false
      }
    },

    editProfile() {
      this.isEditing = true
      this.errors = {}
      this.successMessage = ''

      // Copy current values to edit form
      this.editForm = {
        full_name: this.userProfile.fullName,
        email: this.userProfile.email,
        company: this.userProfile.company,
        location: this.userProfile.location,
        bio: this.userProfile.bio,
      }
    },

    async saveChanges() {
      if (!this.store.isAuthenticated) {
        this.$router.push('/login')
        return
      }

      // Validate form data
      const validation = validateProfileData(this.editForm)
      if (!validation.isValid) {
        this.errors = validation.errors
        return
      }

      this.saving = true
      this.errors = {}

      try {
        const userId = this.store.session?.user?.id
        if (!userId) {
          throw new Error('User ID not found')
        }

        // Update profile in database
        const updatedProfile = await updateProfile(userId, this.editForm)

        // Update local state
        this.userProfile = {
          initials: getUserInitials(updatedProfile.full_name),
          fullName: updatedProfile.full_name || '',
          email: updatedProfile.email || '',
          company: updatedProfile.company || '',
          location: updatedProfile.location || '',
          bio: updatedProfile.bio || '',
        }

        // Update store profile
        this.store.profile = updatedProfile

        this.isEditing = false
        this.successMessage = 'Profile updated successfully!'

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = ''
        }, 3000)

        console.log('Profile saved successfully:', updatedProfile)
      } catch (error) {
        console.error('Error saving profile:', error)
        this.errors.general = error.message || 'Failed to save profile. Please try again.'
      } finally {
        this.saving = false
      }
    },

    cancelEdit() {
      this.isEditing = false
      this.errors = {}
      this.successMessage = ''

      // Reset edit form to current values
      this.editForm = {
        full_name: this.userProfile.fullName,
        email: this.userProfile.email,
        company: this.userProfile.company,
        location: this.userProfile.location,
        bio: this.userProfile.bio,
      }
    },

    clearMessages() {
      this.errors = {}
      this.successMessage = ''
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
  padding: 3rem 0;
  border-bottom: 2px solid var(--border-green-light);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  margin-bottom: 2rem;
}

.page-title {
  font-size: var(--font-size-6xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Main Content */
.profile-content {
  padding: 3rem 0;
  min-height: 80vh;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
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
  border: 2px solid var(--border-green-light);
  border-radius: var(--radius-xl);
  padding: 3rem;
  box-shadow: var(--shadow-green);
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-green-lg);
}

.profile-avatar {
  text-align: center;
  margin-bottom: 1.5rem;
}

.avatar-circle {
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: var(--shadow-green);
  border: 4px solid var(--bg-primary);
  transition: all 0.3s ease;
}

.avatar-circle:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-green-lg);
}

.avatar-initials {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.profile-name {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  border: 2px solid var(--border-green-light);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-green);
  transition: all 0.3s ease;
}

.carbon-impact-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-green-lg);
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
  border: 2px solid var(--border-green-light);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-green);
  transition: all 0.3s ease;
}

.achievements-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-green-lg);
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
  border: 2px solid var(--border-green-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-green);
  overflow: hidden;
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-green-lg);
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

.save-button:disabled {
  background: var(--bg-muted);
  color: var(--text-muted);
  cursor: not-allowed;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.cancel-button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  grid-column: 1 / -1;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--bg-secondary);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Messages */
.error-message {
  grid-column: 1 / -1;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: #dc2626;
  font-size: var(--font-size-sm);
  margin-bottom: 1rem;
}

.success-message {
  grid-column: 1 / -1;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: var(--radius-md);
  color: #16a34a;
  font-size: var(--font-size-sm);
  margin-bottom: 1rem;
}

/* Field Errors */
.form-input.error,
.form-textarea.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.field-error {
  display: block;
  color: #dc2626;
  font-size: var(--font-size-xs);
  margin-top: 0.25rem;
}

.char-count {
  display: block;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  margin-top: 0.25rem;
  text-align: right;
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
