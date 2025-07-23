/**
 * Debug endpoint to help troubleshoot admin authentication in production
 * This endpoint will be removed after fixing the auth issue
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const headers = getHeaders(event);
  
  return {
    debug: 'Admin Auth Debug Info',
    environment: process.env.NODE_ENV,
    bypassAuth: config.public.bypassAdminAuth,
    headers: {
      hasUserId: !!headers['x-user-id'],
      hasUserEmail: !!headers['x-user-email'],
      userId: headers['x-user-id'] ? headers['x-user-id'].substring(0, 8) + '***' : 'none',
      userEmail: headers['x-user-email'] ? headers['x-user-email'].substring(0, 5) + '***' : 'none',
      allHeaders: Object.keys(headers)
    },
    timestamp: new Date().toISOString()
  };
});
