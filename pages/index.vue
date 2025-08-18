<template>
  <div class="loading-container">
    <div class="loading-content">
      <h1>Welcome to Nixty</h1>
      <p>{{ user?.account_type === 'admin' ? 'Redirecting to dashboard...' : 'Redirecting to home page...' }}</p>
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth';

const { user, initUser } = useAuth();

await initUser();

if (user.value && user.value.account_type === 'admin') {
  await navigateTo('/dashboard', { redirectCode: 301 });
} else {
  await navigateTo('/home', { redirectCode: 301 });
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: var(--galaxy-hero-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--galaxy-space-lg);
}

.welcome-container {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.welcome-content {
  background: var(--galaxy-card-gradient);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-xl);
  padding: var(--galaxy-space-2xl);
  backdrop-filter: blur(15px);
  box-shadow: var(--galaxy-shadow-large);
}

.welcome-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--galaxy-starlight);
  margin: 0 0 var(--galaxy-space-lg) 0;
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-content p {
  color: var(--galaxy-cloud-gray);
  font-size: 1.1rem;
  margin: 0 0 var(--galaxy-space-xl) 0;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
}

.loading-spinner i {
  font-size: 2rem;
  color: var(--galaxy-aurora-cyan);
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcome-content h1 {
    font-size: 2rem;
  }
  
  .welcome-content p {
    font-size: 1rem;
  }
}
</style>
