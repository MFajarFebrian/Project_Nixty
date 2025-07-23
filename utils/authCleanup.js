/**
 * Utility to clean up corrupted authentication data
 * Call this if users are experiencing login issues
 */
export const cleanupAuthData = () => {
  if (process.client) {
    try {
      // Remove all auth-related localStorage items
      localStorage.removeItem('currentUser');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-buafxvcghfeoquyprmcb-auth-token');
      
      // Clear any other potential auth artifacts
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('supabase') || key.includes('user'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('Auth cleanup completed - removed items:', keysToRemove);
      return true;
    } catch (error) {
      console.error('Error during auth cleanup:', error);
      return false;
    }
  }
  return false;
};

/**
 * Check if localStorage has corrupted auth data
 */
export const hasCorruptedAuthData = () => {
  if (!process.client) return false;
  
  try {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const parsedUser = JSON.parse(userJson);
      // Check if user object is valid
      return !(parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email);
    }
    return false;
  } catch (error) {
    return true; // If parsing fails, it's corrupted
  }
};
