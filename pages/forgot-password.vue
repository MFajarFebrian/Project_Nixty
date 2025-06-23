<template>
  <div class="forgot-password-page">
    <h1>Forgot Password</h1>
    <p class="subtitle">Enter your email address below to receive a password reset link.</p>
    
    <div class="form-container">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Enter your email address"
            required 
          />
        </div>
        
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>
      
      <div class="back-link">
        Remember your password? <NuxtLink to="/login">Back to Login</NuxtLink>
      </div>
    </div>
    
    <div v-if="resetUrl" class="reset-link-demo">
      <h3>Demo Only - Reset Link:</h3>
      <p>In production, this would be sent via email.</p>
      <a :href="resetUrl" target="_blank">{{ resetUrl }}</a>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref } from 'vue';
import '~/assets/css/pages/forgot-password.css';

const email = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const resetUrl = ref('');

const handleSubmit = async () => {
  try {
    // Clear previous messages
    errorMessage.value = '';
    successMessage.value = '';
    resetUrl.value = '';
    isLoading.value = true;
    
    // Call forgot-password API
    const response = await $fetch('/api/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    });
    
    if (response.success) {
      successMessage.value = response.message;
      email.value = ''; // Clear email field
      
      // For demo purposes only - in production this would be removed
      if (response.resetUrl) {
        resetUrl.value = response.resetUrl;
      }
    } else {
      errorMessage.value = response.message || 'An error occurred';
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    errorMessage.value = 'An error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

