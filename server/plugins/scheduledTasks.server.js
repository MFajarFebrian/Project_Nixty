// Server plugin to initialize scheduled tasks
import { scheduledTasks } from '../utils/scheduledTasks.js';

export default defineNitroPlugin(async (nitroApp) => {
  console.log('🚀 Initializing scheduled tasks...');
  
  // Start scheduled tasks
  try {
    scheduledTasks.start();
    console.log('✅ Scheduled tasks initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize scheduled tasks:', error);
  }
  
  // Cleanup on close
  nitroApp.hooks.hook('close', () => {
    console.log('🛑 Shutting down scheduled tasks...');
    scheduledTasks.stop();
  });
});
