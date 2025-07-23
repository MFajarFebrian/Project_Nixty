/**
 * Admin authentication utilities for production
 */

// Create a mock admin user for testing
export const createMockAdminUser = () => {
  return {
    id: 'admin-user-001',
    email: 'admin@nixty.com',
    name: 'Admin User',
    account_type: 'admin'
  };
};

// Set admin user in localStorage for testing
export const setAdminUser = () => {
  if (process.client) {
    const adminUser = createMockAdminUser();
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    
    // Force reload to update authentication state
    window.location.reload();
  }
};

// Check if user has admin access
export const isAdmin = (user) => {
  return user && user.account_type === 'admin';
};

// Get admin headers for API requests
export const getAdminHeaders = (user) => {
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return {
    'Content-Type': 'application/json',
    'x-user-id': user.id?.toString(),
    'x-user-email': user.email
  };
};
