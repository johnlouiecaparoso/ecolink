<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { getProfile } from '@/services/profileService'
import PageLayout from '@/components/layout/PageLayout.vue'

const router = useRouter()
const store = useUserStore()

const userProfile = ref(null)
const loading = ref(true)

async function loadProfile() {
  if (!store.session?.user?.id) return

  try {
    userProfile.value = await getProfile(store.session.user.id)
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <PageLayout>
    <div class="profile-content">
      <div class="content-header">
        <div class="header-info">
          <button class="btn btn-ghost back-btn" @click="router.push('/dashboard')">
            <span class="back-icon">←</span>
            Back to Dashboard
          </button>
          <h1 class="page-title">Profile Settings</h1>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>

      <div v-else class="profile-section">
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{
                userProfile?.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'U'
              }}
            </div>
            <div class="profile-info">
              <h2 class="profile-name">{{ userProfile?.full_name || 'EcoLink User' }}</h2>
              <p class="profile-email">{{ store.session?.user?.email || 'user@ecolink.io' }}</p>
              <span class="profile-role">{{ store.role || 'User' }}</span>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-group">
              <h3>Account Information</h3>
              <div class="detail-item">
                <label>Full Name</label>
                <input type="text" :value="userProfile?.full_name || ''" readonly />
              </div>
              <div class="detail-item">
                <label>Email</label>
                <input type="email" :value="store.session?.user?.email || ''" readonly />
              </div>
              <div class="detail-item">
                <label>Role</label>
                <input type="text" :value="store.role || 'User'" readonly />
              </div>
              <div class="detail-item">
                <label>Member Since</label>
                <input
                  type="text"
                  :value="new Date(store.session?.user?.created_at).toLocaleDateString() || ''"
                  readonly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<style scoped>
.profile-content {
  padding: 24px;
}

.content-header {
  margin-bottom: 32px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.back-btn:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #10b981;
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #64748b;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.profile-section {
  max-width: 800px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.profile-email {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 8px 0;
}

.profile-role {
  display: inline-block;
  padding: 4px 12px;
  background: #f0fdf4;
  color: #10b981;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.profile-details {
  padding: 32px;
}

.detail-group h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.detail-item input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #f8fafc;
  color: #64748b;
}

.detail-item input:focus {
  outline: none;
  border-color: #10b981;
  background: white;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .profile-content {
    padding: 16px;
  }

  .header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-title {
    font-size: 24px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
    font-size: 20px;
  }

  .profile-name {
    font-size: 20px;
  }

  .profile-details {
    padding: 24px;
  }
}
</style>
