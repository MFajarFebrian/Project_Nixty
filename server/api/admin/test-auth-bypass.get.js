/**
 * Endpoint to test admin auth bypass mechanism
 * This is only for development purposes to verify the bypass header works
 */
export default defineEventHandler(async (event) => {
  // This endpoint should be protected by the admin-auth middleware
  // If you can access it with x-admin-dev-bypass: true header, then the bypass is working
  
  return {
    success: true,
    adminUser: event.context.adminUser,
    message: "Auth bypass worked successfully"
  };
}); 