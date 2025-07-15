import { ref } from 'vue';

const user = ref(null);
const isReady = ref(false);

export function useAuth() {
  const initUser = () => {
    if (process.client && !isReady.value) {
      const userJson = sessionStorage.getItem('currentUser');
      if (userJson) {
        try {
          user.value = JSON.parse(userJson);
        } catch (error) {
          console.error('Error parsing user data:', error);
          user.value = null;
        }
      }
      isReady.value = true;
    }
  };

  const setUser = (newUser) => {
    if (process.client) {
      user.value = newUser;
      if (newUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));
      } else {
        sessionStorage.removeItem('currentUser');
      }
    }
  };

  const logout = () => {
    if (process.client) {
      user.value = null;
      sessionStorage.removeItem('currentUser');
    }
  };

  return {
    user,
    isReady,
    initUser,
    setUser,
    logout
  };
}
