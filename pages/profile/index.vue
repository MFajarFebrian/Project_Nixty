<template>
  <div class="profile-page-container">
    <h1 class="page-title galaxy-gradient-text">My Profile</h1>

    <div v-if="isLoading" class="state-container">
      <div class="spinner"></div>
      <p>Loading profile data...</p>
    </div>

    <div v-else-if="error" class="state-container">
      <p class="error-text">&#10060; {{ error }}</p>
      <button @click="fetchProfileData" class="galaxy-button-secondary">Try Again</button>
    </div>

    <div v-else-if="!user" class="state-container">
      <p class="no-data-text">Please log in to view your profile.</p>
      <button @click="openAuthModal" class="galaxy-button-primary">
        <i class="fas fa-sign-in-alt"></i> Login
      </button>
    </div>

    <div v-else class="profile-content galaxy-card">
      <div class="profile-header">
        <div class="profile-picture-container">
          <ProfilePicture
            :src="user.profile_picture"
            :alt="user.name"
            :userName="user.name"
            :userId="user.id"
            :customFallback="true"
            class="profile-picture"
          />
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ user.name || 'N/A' }}</h2>
          <p class="user-email">{{ user.email }}</p>
          <span class="account-type-badge">{{ user.account_type }}</span>
        </div>
      </div>

      <div class="profile-details">
        <h3>Account Details</h3>
        <div class="detail-item">
          <span class="detail-label">User ID:</span>
          <span class="detail-value">{{ user.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Joined:</span>
          <span class="detail-value">{{ formatDate(user.created_at) }}</span>
        </div>
        <div v-if="user.google_id" class="detail-item">
          <span class="detail-label">Google ID:</span>
          <span class="detail-value">{{ user.google_id }}</span>
        </div>
      </div>

      <div class="profile-actions">
        <NuxtLink to="/profile/transactions" class="galaxy-button-primary">
          <i class="fas fa-shopping-bag"></i> My Orders
        </NuxtLink>
        <button @click="handleLogout" class="galaxy-button-secondary">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal
      v-if="isAuthModalOpen"
      :is-open="isAuthModalOpen"
      :default-tab="'login'"
      @close="closeAuthModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useUtils } from '~/composables/useUtils';
import AuthModal from '~/components/AuthModal.vue';
import ProfilePicture from '~/components/ProfilePicture.vue';

const { user, initUser, logout } = useAuth();
const { formatDate } = useUtils();

const isLoading = ref(true);
const error = ref(null);
const isAuthModalOpen = ref(false);

const fetchProfileData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    initUser(); // Ensure user data is loaded from session storage
    if (!user.value) {
      // If user is still null after initUser, it means not logged in
      return;
    }
    // In a real app, you might fetch more detailed user data from an API here
    // For now, we rely on the data stored in useAuth
  } catch (err) {
    console.error('Error fetching profile data:', err);
    error.value = err.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};

const handleLogout = () => {
  logout();
  // Redirect to home or login page after logout
  navigateTo('/');
};

const openAuthModal = () => {
  isAuthModalOpen.value = true;
};

const closeAuthModal = () => {
  isAuthModalOpen.value = false;
  // Re-fetch profile data in case user logged in
  fetchProfileData();
};

onMounted(() => {
  fetchProfileData();
});
</script>

<style scoped>
.profile-page-container {
  max-width: 800px;
  margin: var(--galaxy-space-2xl) auto;
  padding: var(--galaxy-space-md);
}

.page-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: var(--galaxy-space-xl);
}

.state-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
  gap: var(--galaxy-space-md);
  color: var(--galaxy-cloud-gray);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--galaxy-asteroid-gray);
  border-left-color: var(--galaxy-aurora-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-text {
  color: var(--galaxy-pulsar-pink);
  font-size: 1.2rem;
}

.no-data-text {
  font-size: 1.2rem;
  margin-bottom: var(--galaxy-space-lg);
}

.profile-content {
  background: var(--galaxy-card-gradient);
  border: 1px solid var(--galaxy-asteroid-gray);
  border-radius: var(--galaxy-radius-lg);
  padding: var(--galaxy-space-xl);
  box-shadow: var(--galaxy-shadow-medium);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-lg);
  margin-bottom: var(--galaxy-space-xl);
  padding-bottom: var(--galaxy-space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-picture-container {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid var(--galaxy-aurora-cyan);
  box-shadow: 0 0 15px rgba(77, 208, 225, 0.4);
  overflow: hidden;
  flex-shrink: 0;
}

.profile-picture {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 1.8rem;
  color: var(--galaxy-starlight);
  margin: 0 0 var(--galaxy-space-xs) 0;
}

.user-email {
  font-size: 1rem;
  color: var(--galaxy-cloud-gray);
  margin: 0;
}

.account-type-badge {
  background: var(--galaxy-nebula-purple);
  color: var(--galaxy-starlight);
  padding: 0.3rem 0.8rem;
  border-radius: var(--galaxy-radius-full);
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: var(--galaxy-space-sm);
  align-self: flex-start;
}

.profile-details {
  margin-bottom: var(--galaxy-space-xl);
}

.profile-details h3 {
  font-size: 1.5rem;
  color: var(--galaxy-aurora-cyan);
  margin-bottom: var(--galaxy-space-lg);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: var(--galaxy-space-sm) 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.detail-label {
  color: var(--galaxy-cloud-gray);
  font-weight: 500;
}

.detail-value {
  color: var(--galaxy-starlight);
}

.profile-actions {
  display: flex;
  gap: var(--galaxy-space-md);
  justify-content: center;
}

.galaxy-button-primary,
.galaxy-button-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-sm);
  padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  border-radius: var(--galaxy-radius-md);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--galaxy-transition-normal);
}

.galaxy-button-primary {
  background: var(--galaxy-primary-gradient);
  color: var(--galaxy-starlight);
  border: none;
}

.galaxy-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--galaxy-glow-blue);
}

.galaxy-button-secondary {
  background: transparent;
  border: 1px solid var(--galaxy-aurora-cyan);
  color: var(--galaxy-aurora-cyan);
}

.galaxy-button-secondary:hover {
  background: rgba(77, 208, 225, 0.1);
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .account-type-badge {
    align-self: center;
  }

  .profile-actions {
    flex-direction: column;
  }
}
</style>
