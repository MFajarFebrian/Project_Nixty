<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo-section">
          <i class="fas fa-shield-alt"></i>
          <h1>Admin Login</h1>
          <p>Access administrative panel</p>
        </div>
      </div>

      <div class="login-form-wrapper">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input
                id="email"
                v-model="loginForm.email"
                type="email"
                placeholder="Enter admin email"
                required
                :disabled="isLoading"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input
                id="password"
                v-model="loginForm.password"
                type="password"
                placeholder="Enter password"
                required
                :disabled="isLoading"
                autocomplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            class="login-btn"
            :disabled="isLoading || !isFormValid"
            :title="isLoading ? 'Signing in...' : 'Sign In'"
          >
            <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-sign-in-alt"></i>
          </button>

          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>
        </form>
      </div>

      <div class="login-footer">
        <p>
          <i class="fas fa-info-circle"></i>
          Admin panel is restricted to system administrators only
        </p>
      </div>
    </div>

    <div class="bg-decorations">
      <div class="decoration decoration-1"></div>
      <div class="decoration decoration-2"></div>
      <div class="decoration decoration-3"></div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'


definePageMeta({
  layout: false,
  title: 'Admin Login',
  middleware: 'admin-login'
})


const { user, login, initUser } = useAuth()
const { success, error } = useToast()
const router = useRouter()


const loginForm = ref({
  email: '',
  password: ''
})
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')


const isFormValid = computed(() => {
  return loginForm.value.email.trim() !== '' && 
         loginForm.value.password.trim() !== '' &&
         loginForm.value.email.includes('@')
})


const handleLogin = async () => {
  if (!isFormValid.value || isLoading.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await login(loginForm.value.email, loginForm.value.password)
    
    if (result.success) {

      if (result.user && result.user.account_type === 'admin') {
        success('Login successful! Redirecting to dashboard...')

        await router.push('/dashboard')
      } else {
        errorMessage.value = 'Access denied. Only administrators can access this panel.'

        loginForm.value.password = ''
      }
    } else {
      errorMessage.value = result.message || 'Invalid email or password'
    }
  } catch (err) {
    console.error('Login error:', err)
    errorMessage.value = 'An error occurred during login. Please try again.'
  } finally {
    isLoading.value = false
  }
}


onMounted(async () => {
  await initUser()
  

  if (user.value && user.value.account_type === 'admin') {
    await router.push('/dashboard')
  }
})


useHead({
  title: 'Admin Login',
  meta: [
    {
      name: 'description',
      content: 'Administrator login panel for Nixty'
    },
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>

<style scoped>
@import '~/assets/css/global/variables.css';

.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--galaxy-hero-gradient);
  padding: var(--galaxy-space-lg);
  position: relative;
  overflow: hidden;
}

.login-container {
  background: var(--galaxy-card-gradient);
  border-radius: var(--galaxy-radius-2xl);
  padding: var(--galaxy-space-3xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow: var(--galaxy-shadow-large), var(--galaxy-glow-blue);
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: var(--galaxy-space-2xl);
}

.logo-section i {
  font-size: 4rem;
  color: var(--galaxy-aurora-cyan);
  text-shadow: var(--galaxy-glow-cyan);
  margin-bottom: var(--galaxy-space-lg);
  display: block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.logo-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--galaxy-space-sm);
  background: var(--galaxy-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-section p {
  color: var(--galaxy-cloud-gray);
  font-size: 1.1rem;
  margin: 0;
}

.login-form-wrapper {
  margin-bottom: var(--galaxy-space-2xl);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--galaxy-space-sm);
}

.form-group label {
  color: var(--galaxy-starlight);
  font-weight: 600;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: var(--galaxy-space-md);
  color: var(--galaxy-cloud-gray);
  font-size: 1rem;
  z-index: 1;
}

.input-wrapper input {
  width: 100%;
  padding: var(--galaxy-space-md) var(--galaxy-space-md) var(--galaxy-space-md) var(--galaxy-space-3xl);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--galaxy-radius-lg);
  background: rgba(255, 255, 255, 0.05);
  color: var(--galaxy-starlight);
  font-size: 1rem;
  transition: var(--galaxy-transition-normal);
  backdrop-filter: blur(10px);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--galaxy-aurora-cyan);
  box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.input-wrapper input::placeholder {
  color: var(--galaxy-cloud-gray);
}

.input-wrapper input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: calc(var(--galaxy-space-md) + 8px);
  background: none;
  border: none;
  color: var(--galaxy-cloud-gray);
  cursor: pointer;
  padding: var(--galaxy-space-xs);
  border-radius: var(--galaxy-radius-sm);
  transition: var(--galaxy-transition-normal);
}

.password-toggle:hover {
  color: var(--galaxy-aurora-cyan);
  background: rgba(255, 255, 255, 0.1);
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-sm);
  padding: var(--galaxy-space-lg);
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--galaxy-stellar-blue), var(--galaxy-aurora-cyan));
  border: none;
  border-radius: var(--galaxy-radius-lg);
  color: var(--galaxy-starlight);
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--galaxy-transition-normal);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  margin: 0 auto;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--galaxy-transition-normal);
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--galaxy-space-sm);
  padding: var(--galaxy-space-md);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: var(--galaxy-radius-md);
  color: var(--galaxy-nova-red);
  font-size: 0.9rem;
  margin-top: var(--galaxy-space-md);
}

.login-footer {
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--galaxy-space-xl);
}

.login-footer p {
  color: var(--galaxy-cloud-gray);
  font-size: 0.9rem;
  margin-bottom: var(--galaxy-space-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--galaxy-space-sm);
}


/* Background decorations */
.bg-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.decoration-1 {
  width: 300px;
  height: 300px;
  background: var(--galaxy-stellar-blue);
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.decoration-2 {
  width: 200px;
  height: 200px;
  background: var(--galaxy-aurora-cyan);
  top: 60%;
  right: -5%;
  animation-delay: 2s;
}

.decoration-3 {
  width: 150px;
  height: 150px;
  background: var(--galaxy-comet-green);
  bottom: 20%;
  left: 80%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .admin-login-page {
    padding: var(--galaxy-space-md);
  }
  
  .login-container {
    padding: var(--galaxy-space-2xl);
    max-width: 100%;
  }
  
  .logo-section i {
    font-size: 3rem;
  }
  
  .logo-section h1 {
    font-size: 2rem;
  }
  
  .decoration-1 {
    width: 200px;
    height: 200px;
  }
  
  .decoration-2 {
    width: 150px;
    height: 150px;
  }
  
  .decoration-3 {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: var(--galaxy-space-xl);
  }
  
  .logo-section i {
    font-size: 2.5rem;
  }
  
  .logo-section h1 {
    font-size: 1.8rem;
  }
  
  .input-wrapper input {
    padding: var(--galaxy-space-sm) var(--galaxy-space-sm) var(--galaxy-space-sm) var(--galaxy-space-2xl);
  }
  
  .login-btn {
    padding: var(--galaxy-space-md) var(--galaxy-space-lg);
  }
}
</style>
