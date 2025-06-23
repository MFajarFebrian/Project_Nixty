import { ref, onMounted } from 'vue';
import { useGoogleAuth } from '../../composables/useGoogleAuth';

export const useGoogleButton = (props, emit) => {
  const isLoading = ref(false);

  // Get Google OAuth client ID from composable
  const { GOOGLE_CLIENT_ID } = useGoogleAuth();
  let googleAuth = null;

  const initializeGoogleAuth = () => {
    if (typeof window !== 'undefined' && window.google) {
      googleAuth = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: handleGoogleResponse
      });
    }
  };

  const handleGoogleAuth = async () => {
    if (!googleAuth) {
      emit('google-auth-error', 'Google authentication not initialized');
      return;
    }

    isLoading.value = true;
    googleAuth.requestAccessToken();
  };

  const handleGoogleResponse = async (response) => {
    try {
      if (response.error) {
        emit('google-auth-error', response.error);
        isLoading.value = false;
        return;
      }

      // Get user info from Google
      const accessToken = response.access_token;
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const googleUser = await userInfoResponse.json();

      // Send the Google user data to our backend
      const serverResponse = await $fetch(`/api/auth/google-${props.authType}`, {
        method: 'POST',
        body: {
          email: googleUser.email,
          name: googleUser.name,
          google_id: googleUser.sub,
          picture: googleUser.picture
        }
      });

      if (serverResponse.success && serverResponse.user) {
        emit('google-auth-success', serverResponse.user);
      } else {
        emit('google-auth-error', serverResponse.message);
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      emit('google-auth-error', 'Failed to authenticate with Google');
    } finally {
      isLoading.value = false;
    }
  };

  const initializeComponent = () => {
    // Load the Google API script
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = initializeGoogleAuth;
    }
  };

  return {
    // State
    isLoading,
    
    // Methods
    handleGoogleAuth,
    initializeComponent
  };
};
