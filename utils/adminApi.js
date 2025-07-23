import { useAuth } from '~/composables/useAuth'

/**
 * Utility for making authenticated admin API calls
 * Automatically adds required x-user-id and x-user-email headers
 */
export const adminFetch = async (url, options = {}) => {
  const { user } = useAuth()
  
  console.log('AdminFetch - User data:', {
    hasUser: !!user.value,
    userKeys: user.value ? Object.keys(user.value) : [],
    accountType: user.value?.account_type,
    userId: user.value?.id ? String(user.value.id).substring(0, 8) + '***' : 'none',
    userEmail: user.value?.email ? String(user.value.email).substring(0, 5) + '***' : 'none'
  })
  
  if (!user.value) {
    console.error('AdminFetch - User not authenticated')
    throw new Error('User not authenticated')
  }
  
  if (user.value.account_type !== 'admin') {
    console.error('AdminFetch - User is not admin:', user.value.account_type)
    throw new Error('Admin access required')
  }
  
  // Prepare headers with authentication
  const headers = {
    'x-user-id': String(user.value.id),
    'x-user-email': String(user.value.email),
    ...options.headers
  }
  
  console.log('AdminFetch - Sending headers:', {
    'x-user-id': headers['x-user-id'] ? String(headers['x-user-id']).substring(0, 8) + '***' : 'none',
    'x-user-email': headers['x-user-email'] ? String(headers['x-user-email']).substring(0, 5) + '***' : 'none'
  })
  
  // Make the request with authentication headers
  return await $fetch(url, {
    ...options,
    headers
  })
}

/**
 * Convenience methods for common HTTP methods
 */
export const adminApi = {
  get: (url, options = {}) => adminFetch(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => adminFetch(url, { ...options, method: 'POST', body }),
  put: (url, body, options = {}) => adminFetch(url, { ...options, method: 'PUT', body }),
  delete: (url, options = {}) => adminFetch(url, { ...options, method: 'DELETE' })
}
