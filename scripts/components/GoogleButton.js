import { ref, onMounted, onUnmounted } from 'vue';
import { useGoogleAuth } from '../../composables/useGoogleAuth';

export const useGoogleButton = (props, emit) => {
  const isLoading = ref(false);
  let authTimeoutId = null;

  // Get Google OAuth client ID from composable
  const { GOOGLE_CLIENT_ID } = useGoogleAuth();
  let googleAuth = null;

  const resetAuthState = () => {
    isLoading.value = false;
    if (authTimeoutId) {
      clearTimeout(authTimeoutId);
      authTimeoutId = null;
    }
  };

  const initializeGoogleAuth = () => {
    console.log('GoogleButton: initializeGoogleAuth called. window.google exists:', !!window.google);
    if (typeof window !== 'undefined' && window.google) {
      googleAuth = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: handleGoogleResponse,
        error_callback: (error) => {
          console.error('GoogleButton: Google auth error:', error);
          emit('google-auth-error', error.message || 'Google authentication failed');
          resetAuthState();
        }
      });
      console.log('GoogleButton: googleAuth client initialized.');
    } else {
      console.warn('GoogleButton: window.google not available for initialization.');
    }
  };

  const handleGoogleAuth = async () => {
    console.log('GoogleButton: handleGoogleAuth called. isLoading before:', isLoading.value);
    if (!googleAuth) {
      console.error('GoogleButton: Google authentication not initialized when button clicked.');
      emit('google-auth-error', 'Google authentication not initialized');
      resetAuthState();
      return;
    }

    isLoading.value = true;
    console.log('GoogleButton: isLoading set to true. Requesting access token...');

    // Set a timeout to reset the state if no response is received
    authTimeoutId = setTimeout(() => {
      console.log('GoogleButton: Auth timeout reached, resetting state');
      resetAuthState();
    }, 60000); // 1 minute timeout

    // Add window focus event listener to detect popup closure
    const handleWindowFocus = () => {
      // Small delay to ensure we don't reset too early
      setTimeout(() => {
        if (isLoading.value) {
          console.log('GoogleButton: Window refocused, popup likely closed');
          resetAuthState();
        }
      }, 500);
    };

    window.addEventListener('focus', handleWindowFocus);
    
    // Remove the event listener after a delay or when auth completes
    setTimeout(() => {
      window.removeEventListener('focus', handleWindowFocus);
    }, 120000); // 2 minutes maximum

    googleAuth.requestAccessToken();
  };

  const handleGoogleResponse = async (response) => {
    console.log('GoogleButton: handleGoogleResponse called. Response:', response);
    try {
      if (response.error) {
        console.error('GoogleButton: Google API response error:', response.error);
        emit('google-auth-error', response.error);
        return;
      }

      // Get user info from Google
      const accessToken = response.access_token;
      console.log('GoogleButton: Fetching user info with access token.');
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const googleUser = await userInfoResponse.json();
      console.log('GoogleButton: Google user info fetched.', googleUser);

      // Send the Google user data to our backend
      console.log('GoogleButton: Sending user data to backend for auth type:', props.authType);
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
        console.log('GoogleButton: Backend authentication successful.');
        emit('google-auth-success', serverResponse.user);
      } else {
        console.error('GoogleButton: Backend authentication failed:', serverResponse.message);
        emit('google-auth-error', serverResponse.message);
      }
    } catch (error) {
      console.error('GoogleButton: Error during Google authentication flow:', error);
      emit('google-auth-error', 'Failed to authenticate with Google');
    } finally {
      resetAuthState();
      console.log('GoogleButton: Auth state reset in finally block.');
    }
  };

  const initializeComponent = () => {
    console.log('GoogleButton: initializeComponent called.');
    // Load the Google API script
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('GoogleButton: Google GSI script loaded.');
        initializeGoogleAuth();
      };
      script.onerror = (e) => {
        console.error('GoogleButton: Failed to load GSI script:', e);
        emit('google-auth-error', 'Failed to load Google authentication script.');
        resetAuthState();
      };
    }
  };

  // Cleanup on component unmount
  onUnmounted(() => {
    resetAuthState();
  });

  return {
    // State
    isLoading,
    
    // Methods
    handleGoogleAuth,
    initializeComponent
  };
};
