<template>
  <div class="reset-password-page">
    <h1>Reset Password</h1>
    <p class="subtitle">Create a new password for your account.</p>
    
    <div class="form-container">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form v-if="!isReset" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="password">New Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Enter new password"
            required 
            minlength="8"
          />
          <small class="password-hint">Password must be at least 8 characters long</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            placeholder="Re-enter new password"
            required
          />
        </div>
        
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>
      
      <div v-if="isReset" class="success-container">
        <p>Your password has been reset successfully!</p>
        <NuxtLink to="/home" class="home-button">Login</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import '~/assets/css/pages/reset-password.css';

const route = useRoute();
const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const isReset = ref(false);

// Get token from URL on component mount
onMounted(() => {
  token.value = route.query.token?.toString() || '';
  
  if (!token.value) {
    errorMessage.value = 'Invalid reset token. Please request a new password reset link.';
  }
});

const handleSubmit = async () => {
  try {
    // Clear previous messages
    errorMessage.value = '';
    successMessage.value = '';
    
    // Validate password match
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match.';
      return;
    }
    
    // Validate password length
    if (password.value.length < 8) {
      errorMessage.value = 'Password must be at least 8 characters long.';
      return;
    }
    
    isLoading.value = true;
    
    // Call reset-password API
    const response = await $fetch('/api/reset-password', {
      method: 'POST',
      body: { 
        token: token.value,
        password: password.value
      }
    });
    
    if (response.success) {
      successMessage.value = response.message;
      // Clear form and mark as reset
      password.value = '';
      confirmPassword.value = '';
      isReset.value = true;
    } else {
      errorMessage.value = response.message || 'An error occurred';
    }
  } catch (error) {
    console.error('Reset password error:', error);
    errorMessage.value = 'An error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

