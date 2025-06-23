<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-btn" @click="closeModal">
        <i class="fas fa-times"></i>
      </button>
      
      <div class="modal-header">
        <div class="tab-buttons">
          <button 
            :class="['tab-btn', { active: activeTab === 'login' }]"
            @click="activeTab = 'login'"
          >
            Login
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'register' }]"
            @click="activeTab = 'register'"
          >
            Register
          </button>
        </div>
      </div>

      <div class="modal-body">
        <!-- Login Form -->
        <div v-if="activeTab === 'login'" class="auth-form">
          <h2>Welcome</h2>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="loginEmail">Email:</label>
              <input type="email" id="loginEmail" v-model="loginEmail" required />
            </div>
            <div class="form-group">
              <label for="loginPassword">Password:</label>
              <input type="password" id="loginPassword" v-model="loginPassword" required />
            </div>
            <div class="forgot-password">
              <NuxtLink to="/forgot-password" @click="closeModal">Forgot password?</NuxtLink>
            </div>
            <button type="submit" class="auth-btn" :disabled="isLoading">
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
          </form>
          
          <div class="separator">
            <span>OR</span>
          </div>
          
          <GoogleButton 
            button-text="Continue with Google" 
            auth-type="login"
            @google-auth-success="handleGoogleAuthSuccess"
            @google-auth-error="handleGoogleAuthError"
          />
        </div>

        <!-- Register Form -->
        <div v-if="activeTab === 'register'" class="auth-form">
          <h2>Create Account</h2>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="registerName">Name:</label>
              <input type="text" id="registerName" v-model="registerName" />
            </div>
            <div class="form-group">
              <label for="registerEmail">Email:</label>
              <input type="email" id="registerEmail" v-model="registerEmail" required />
            </div>
            <div class="form-group">
              <label for="registerPassword">Password:</label>
              <input type="password" id="registerPassword" v-model="registerPassword" required />
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password:</label>
              <input type="password" id="confirmPassword" v-model="confirmPassword" required />
            </div>
            <button type="submit" class="auth-btn" :disabled="isLoading">
              {{ isLoading ? 'Creating Account...' : 'Register' }}
            </button>
          </form>
          
          <div class="separator">
            <span>OR</span>
          </div>
          
          <GoogleButton 
            button-text="Sign up with Google" 
            auth-type="register"
            @google-auth-success="handleGoogleAuthSuccess"
            @google-auth-error="handleGoogleAuthError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { useAuthModal } from '~/scripts/components/AuthModal.js';
import '~/assets/css/components/AuthModal.css';

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  defaultTab: {
    type: String,
    default: 'login'
  }
});

// Emits
const emit = defineEmits(['close']);

// Use the separated script logic
const {
  // State
  activeTab,
  loginEmail,
  loginPassword,
  registerName,
  registerEmail,
  registerPassword,
  confirmPassword,
  errorMessage,
  successMessage,
  isLoading,

  // Methods
  closeModal,
  clearForms,
  handleLogin,
  handleRegister,
  handleGoogleAuthSuccess,
  handleGoogleAuthError
} = useAuthModal(props, emit);
</script>
