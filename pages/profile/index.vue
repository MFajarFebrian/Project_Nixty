<template>
  <div class="profile-page-container">
    <h1 class="page-title galaxy-gradient-text">My Profile</h1>

    <ClientOnly>
      <div v-if="isLoading" class="state-container">
        <div class="spinner"></div>
        <p>Loading profile data...</p>
      </div>

      <div v-else-if="error" class="state-container">
        <p class="error-text">&#10060; {{ error }}</p>
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
              :src="null"
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
          </div>
        </div>

        <div class="profile-details">
          <h3>Account Details</h3>
          
          
          <div class="detail-item editable">
            <span class="detail-label">Name:</span>
            <div class="detail-value-container">
              <input 
                v-if="editingField === 'name'" 
                v-model="editValues.name" 
                @blur="saveField('name')"
                @keyup.enter="$event.target.blur()"
                @keyup.escape="cancelEdit('name')"
                class="edit-input"
                :class="{ 'saving': savingField === 'name' }"
                :disabled="savingField === 'name'"
                ref="nameInput"
              />
              <span v-else class="detail-value">{{ user.name || 'N/A' }}</span>
              <button 
                @click="startEdit('name')" 
                class="edit-icon-btn"
                :class="{ 'saving': savingField === 'name' }"
                :disabled="savingField === 'name' || editingField === 'name'"
                :title="savingField === 'name' ? 'Saving...' : 'Edit name'"
              >
                <i v-if="savingField === 'name'" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-edit"></i>
              </button>
            </div>
          </div>
          
          
          <div class="detail-item editable">
            <span class="detail-label">Email:</span>
            <div class="detail-value-container">
              <input 
                v-if="editingField === 'email'" 
                v-model="editValues.email" 
                @blur="saveField('email')"
                @keyup.enter="$event.target.blur()"
                @keyup.escape="cancelEdit('email')"
                class="edit-input"
                :class="{ 'saving': savingField === 'email' }"
                :disabled="savingField === 'email'"
                type="email"
                ref="emailInput"
              />
              <span v-else class="detail-value">{{ user.email }}</span>
              <button 
                @click="startEdit('email')" 
                class="edit-icon-btn"
                :class="{ 'saving': savingField === 'email' }"
                :disabled="savingField === 'email' || editingField === 'email'"
                :title="savingField === 'email' ? 'Saving...' : 'Edit email'"
              >
                <i v-if="savingField === 'email'" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-edit"></i>
              </button>
            </div>
          </div>
          
          
          <div class="detail-item editable">
            <span class="detail-label">Phone Number:</span>
            <div class="detail-value-container">
              <input 
                v-if="editingField === 'phone'" 
                v-model="editValues.phone" 
                @blur="saveField('phone')"
                @keyup.enter="$event.target.blur()"
                @keyup.escape="cancelEdit('phone')"
                class="edit-input"
                :class="{ 'saving': savingField === 'phone' }"
                :disabled="savingField === 'phone'"
                type="tel"
                ref="phoneInput"
              />
              <span v-else class="detail-value">{{ user.phone || 'Not set' }}</span>
              <button 
                @click="startEdit('phone')" 
                class="edit-icon-btn"
                :class="{ 'saving': savingField === 'phone' }"
                :disabled="savingField === 'phone' || editingField === 'phone'"
                :title="savingField === 'phone' ? 'Saving...' : 'Edit phone number'"
              >
                <i v-if="savingField === 'phone'" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-edit"></i>
              </button>
            </div>
          </div>
          
          
          <div class="detail-item editable">
            <span class="detail-label">Change Password:</span>
            <div class="detail-value-container">
              <div v-if="editingField === 'changePassword'" class="password-change-form">
                <input 
                  v-model="editValues.currentPassword" 
                  class="edit-input password-input"
                  :class="{ 'saving': savingField === 'changePassword' }"
                  :disabled="savingField === 'changePassword'"
                  type="password"
                  placeholder="Current password"
                  ref="currentPasswordInput"
                />
                <input 
                  v-model="editValues.newPassword" 
                  class="edit-input password-input"
                  :class="{ 'saving': savingField === 'changePassword' }"
                  :disabled="savingField === 'changePassword'"
                  type="password"
                  placeholder="New password"
                  ref="newPasswordInput"
                />
                <div class="password-actions">
                  <button 
                    @click="saveField('changePassword')"
                    class="password-save-btn"
                    :disabled="savingField === 'changePassword' || !editValues.currentPassword || !editValues.newPassword"
                  >
                    <i v-if="savingField === 'changePassword'" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-check"></i>
                    Save
                  </button>
                  <button 
                    @click="cancelEdit('changePassword')"
                    class="password-cancel-btn"
                    :disabled="savingField === 'changePassword'"
                  >
                    <i class="fas fa-times"></i>
                    Cancel
                  </button>
                </div>
              </div>
              <span v-else class="detail-value">••••••••</span>
              <button 
                v-if="editingField !== 'changePassword'"
                @click="startEdit('changePassword')"
                class="edit-icon-btn"
                :title="'Change password'"
              >
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <template #fallback>
        <div class="state-container">
          <div class="spinner"></div>
          <p>Loading profile data...</p>
        </div>
      </template>
    </ClientOnly>

    
    <AuthModal
      v-if="isAuthModalOpen"
      :is-open="isAuthModalOpen"
      :default-tab="'login'"
      @close="closeAuthModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useUtils } from '~/composables/useUtils';
import { useToast } from '~/composables/useToast';
import AuthModal from '~/components/AuthModal.vue';
import ProfilePicture from '~/components/ProfilePicture.vue';

const { user, initUser, logout, setUser } = useAuth();
const { formatDate } = useUtils();
const { success, error: showError } = useToast();

const isLoading = ref(true);
const error = ref(null);
const isAuthModalOpen = ref(false);


const editingField = ref(null);
const editValues = ref({
  currentPassword: '',
  newPassword: ''
});
const savingField = ref(null);
const nameInput = ref(null);
const emailInput = ref(null);
const phoneInput = ref(null);
const currentPasswordInput = ref(null);
const newPasswordInput = ref(null);


const startEdit = async (field) => {
  if (editingField.value && editingField.value !== field) {
    cancelEdit(editingField.value);
  }
  
  editingField.value = field;
  

  if (field === 'changePassword') {
    editValues.value.currentPassword = '';
    editValues.value.newPassword = '';
  } else {
    editValues.value[field] = user.value[field] || '';
  }
  
  await nextTick();
  

  if (field === 'name' && nameInput.value) {
    nameInput.value.focus();
  } else if (field === 'email' && emailInput.value) {
    emailInput.value.focus();
  } else if (field === 'phone' && phoneInput.value) {
    phoneInput.value.focus();
  } else if (field === 'changePassword' && currentPasswordInput.value) {
    currentPasswordInput.value.focus();
  }
};


const cancelEdit = (field) => {
  if (editingField.value === field) {
    editingField.value = null;
    if (field === 'changePassword') {
      editValues.value.currentPassword = '';
      editValues.value.newPassword = '';
    } else {
      editValues.value[field] = user.value[field] || '';
    }
  }
};


const saveField = async (field) => {

  if (savingField.value === field) {
    return;
  }
  

  savingField.value = field;
  
  try {

    if (field === 'changePassword') {
      if (!editValues.value.currentPassword) {
        showError('Current password is required');
        return;
      }
      
      if (!validatePassword(editValues.value.newPassword)) {
        showError('New password must be at least 8 characters long');
        return;
      }
      
      const response = await $fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-session': JSON.stringify(user.value)
        },
        body: {
          currentPassword: editValues.value.currentPassword,
          newPassword: editValues.value.newPassword
        }
      });
      
      if (response.success) {
        success('🔐 Password changed successfully!');
        editingField.value = null;
        editValues.value.currentPassword = '';
        editValues.value.newPassword = '';
      } else {
        showError(response.message || 'Failed to change password');
      }
      return;
    }
    

    if (!editValues.value[field] && field !== 'phone') {
      showError(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty`);

      cancelEdit(field);
      return;
    }
    
    if (field === 'email' && !validateEmail(editValues.value[field])) {
      showError('Please enter a valid email address');

      cancelEdit(field);
      return;
    }
    

    if (editValues.value[field] === user.value[field]) {

      editingField.value = null;
      return;
    }
    
    const response = await $fetch('/api/profile/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-session': JSON.stringify(user.value)
      },
      body: {
        [field]: editValues.value[field]
      }
    });
    
    if (response.success) {

      const updatedUser = { ...user.value, [field]: editValues.value[field] };
      setUser(updatedUser);
      editingField.value = null;
      

      const fieldMessages = {
        'name': '👤 Name updated successfully!',
        'email': '📧 Email updated successfully!',
        'phone': '📱 Phone number updated successfully!'
      };
      success(fieldMessages[field] || 'Profile updated successfully!');
    } else {
      showError(response.message || 'Failed to update profile');

      cancelEdit(field);
    }
  } catch (err) {
    console.error('Error updating profile:', err);
    showError('An error occurred while updating your profile');

    cancelEdit(field);
  } finally {

    savingField.value = null;
  }
};


const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


const validatePassword = (newPassword) => {
  return newPassword && newPassword.length >= 8;
};

const fetchProfileData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    initUser(); // Ensure user data is loaded from session storage
    if (!user.value) {

      return;
    }
    

    const response = await $fetch('/api/profile', {
      method: 'GET',
      headers: {
        'x-user-session': JSON.stringify(user.value)
      }
    });
    
    if (response.success) {

      setUser(response.user);
    } else {
      error.value = response.message || 'Failed to fetch profile data';
    }
  } catch (err) {
    console.error('Error fetching profile data:', err);
    error.value = err.message || 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
};

const handleLogout = () => {
  logout();

  navigateTo('/');
};

const openAuthModal = () => {
  isAuthModalOpen.value = true;
};

const closeAuthModal = () => {
  isAuthModalOpen.value = false;

  fetchProfileData();
};


useHead({
  title: 'Profile'
});

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
  align-items: center;
  padding: var(--galaxy-space-sm) 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.detail-item.editable {
  position: relative;
}

.detail-label {
  color: var(--galaxy-cloud-gray);
  font-weight: 500;
  flex-shrink: 0;
  min-width: 80px;
}

.detail-value-container {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  flex: 1;
  justify-content: flex-end;
}

.detail-value {
  color: var(--galaxy-starlight);
}

.edit-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--galaxy-aurora-cyan);
  border-radius: var(--galaxy-radius-sm);
  padding: 0.4rem 0.6rem;
  color: var(--galaxy-starlight);
  font-size: 0.9rem;
  width: 200px;
}

.edit-input:focus {
  outline: none;
  border-color: var(--galaxy-cosmic-blue);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
}

.edit-input.error {
  border-color: var(--galaxy-pulsar-pink);
}

.edit-icon-btn {
  background: transparent;
  border: none;
  color: var(--galaxy-cloud-gray);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: var(--galaxy-radius-sm);
  transition: all var(--galaxy-transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon-btn:hover {
  color: var(--galaxy-aurora-cyan);
  background: rgba(77, 208, 225, 0.1);
}

.edit-icon-btn i {
  font-size: 0.8rem;
}

.edit-icon-btn.saving {
  opacity: 0.7;
  cursor: not-allowed;
}

.edit-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.edit-input.saving {
  opacity: 0.7;
  cursor: not-allowed;
  border-color: var(--galaxy-cloud-gray);
}

.edit-input:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: var(--galaxy-cloud-gray);
  cursor: not-allowed;
}

.password-change-form {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-sm);
  align-items: flex-end;
}

.password-input {
  width: 200px;
}

.password-actions {
  display: flex;
  gap: var(--galaxy-space-xs);
}

.password-save-btn,
.password-cancel-btn {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-xs);
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: var(--galaxy-radius-sm);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--galaxy-transition-fast);
}

.password-save-btn {
  background: var(--galaxy-comet-green);
  color: var(--galaxy-starlight);
}

.password-save-btn:hover:not(:disabled) {
  background: rgba(77, 208, 113, 0.8);
  transform: translateY(-1px);
}

.password-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.password-cancel-btn {
  background: var(--galaxy-pulsar-pink);
  color: var(--galaxy-starlight);
}

.password-cancel-btn:hover:not(:disabled) {
  background: rgba(255, 102, 204, 0.8);
  transform: translateY(-1px);
}

.password-cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fa-spin {
  animation: spin 1s linear infinite;
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

  .profile-actions {
    flex-direction: column;
  }
}
</style>
