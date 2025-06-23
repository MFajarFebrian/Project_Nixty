import { ref, computed } from 'vue';
import { useAuth } from './useAuth';

/**
 * Admin authentication and authorization composable
 */
export function useAdminAuth() {
  const { user } = useAuth();
  
  // Computed properties
  const isAdmin = computed(() => {
    return user.value && user.value.account_type === 'admin';
  });

  const isAuthenticated = computed(() => {
    return !!user.value;
  });

  // Check if user has admin access
  const checkAdminAccess = () => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required');
    }
    
    if (!isAdmin.value) {
      throw new Error('Admin access required');
    }
    
    return true;
  };

  // Get headers for admin API requests
  const getAdminHeaders = () => {
    if (!user.value) {
      throw new Error('User not authenticated');
    }

    return {
      'Content-Type': 'application/json',
      'x-user-id': user.value.id?.toString(),
      'x-user-email': user.value.email
    };
  };

  // Navigate to login if not authenticated
  const requireAuth = () => {
    if (!isAuthenticated.value) {
      navigateTo('/');
      return false;
    }
    return true;
  };

  // Navigate to home if not admin
  const requireAdmin = () => {
    if (!requireAuth()) {
      return false;
    }
    
    if (!isAdmin.value) {
      navigateTo('/home');
      return false;
    }
    
    return true;
  };

  return {
    // State
    user,
    isAdmin,
    isAuthenticated,
    
    // Methods
    checkAdminAccess,
    getAdminHeaders,
    requireAuth,
    requireAdmin
  };
}
