import { scheduledTasks } from '../../utils/scheduledTasks.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Manual cleanup trigger requested');
    
    // Run cleanup immediately
    await scheduledTasks.triggerCleanupNow();
    
    return {
      success: true,
      message: 'Manual cleanup triggered successfully',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Manual cleanup trigger failed:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to trigger manual cleanup',
    });
  }
});
