import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';

export const useAuthModal = (props, emit) => {
  const router = useRouter();
  const { setUser } = useAuth();

  // Variables
  const activeTab = ref(props.defaultTab);
  const loginEmail = ref('');
  const loginPassword = ref('');
  const registerName = ref('');
  const registerEmail = ref('');
  const registerPassword = ref('');
  const confirmPassword = ref('');
  const errorMessage = ref('');
  const successMessage = ref('');
  const isLoading = ref(false);

  // Methods
  const closeModal = () => {
    emit('close');
    clearForms();
  };

  const clearForms = () => {
    loginEmail.value = '';
    loginPassword.value = '';
    registerName.value = '';
    registerEmail.value = '';
    registerPassword.value = '';
    confirmPassword.value = '';
    errorMessage.value = '';
    successMessage.value = '';
    isLoading.value = false;
  };

  // Watch for tab changes to clear messages
  watch(activeTab, () => {
    errorMessage.value = '';
    successMessage.value = '';
  });

  const handleLogin = async () => {
    try {
      errorMessage.value = '';
      successMessage.value = '';
      isLoading.value = true;
      
      const response = await $fetch('/api/login', {
        method: 'POST',
        body: { 
          email: loginEmail.value, 
          password: loginPassword.value 
        }
      });
      
      if (response.success && response.user) {
        successMessage.value = response.message;
        setUser(response.user);
        
        setTimeout(() => {
          closeModal();
          router.push('/dashboard');
        }, 1000);
      } else {
        errorMessage.value = response.message || 'Login failed';
      }
    } catch (error) {
      console.error('Login error:', error);
      errorMessage.value = 'An error occurred during login';
    } finally {
      isLoading.value = false;
    }
  };

  const handleRegister = async () => {
    try {
      errorMessage.value = '';
      successMessage.value = '';
      
      if (registerPassword.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return;
      }
      
      if (registerPassword.value.length < 8) {
        errorMessage.value = 'Password must be at least 8 characters long';
        return;
      }
      
      isLoading.value = true;
      
      const response = await $fetch('/api/register', {
        method: 'POST',
        body: { 
          name: registerName.value,
          email: registerEmail.value, 
          password: registerPassword.value 
        }
      });
      
      if (response.success) {
        successMessage.value = response.message;
        
        setTimeout(() => {
          activeTab.value = 'login';
          registerName.value = '';
          registerEmail.value = '';
          registerPassword.value = '';
          confirmPassword.value = '';
        }, 2000);
      } else {
        errorMessage.value = response.message || 'Registration failed';
      }
    } catch (error) {
      console.error('Registration error:', error);
      errorMessage.value = 'An error occurred during registration';
    } finally {
      isLoading.value = false;
    }
  };

  const handleGoogleAuthSuccess = (user) => {
    setUser(user);
    closeModal();
    router.push('/dashboard');
  };

  const handleGoogleAuthError = (error) => {
    errorMessage.value = error;
  };

  return {
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
  };
};
