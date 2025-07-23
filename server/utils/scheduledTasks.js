// Scheduled tasks for maintenance operations
import { $fetch } from 'ofetch';

class ScheduledTasks {
  constructor() {
    this.intervals = {};
    this.isRunning = false;
  }

  // Start all scheduled tasks
  start() {
    if (this.isRunning) {
      console.log('⚠️ Scheduled tasks already running');
      return;
    }

    console.log('🚀 Starting scheduled tasks...');
    this.isRunning = true;

    // Auto-cleanup failed orders every day at 2 AM
    this.scheduleDaily('auto-cleanup-failed-orders', 2, 0, this.autoCleanupFailedOrders);

    console.log('✅ All scheduled tasks started');
  }

  // Stop all scheduled tasks
  stop() {
    console.log('🛑 Stopping scheduled tasks...');
    
    Object.keys(this.intervals).forEach(taskName => {
      clearInterval(this.intervals[taskName]);
      delete this.intervals[taskName];
    });

    this.isRunning = false;
    console.log('✅ All scheduled tasks stopped');
  }

  // Schedule a task to run daily at specific time
  scheduleDaily(taskName, hour, minute, taskFunction) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If scheduled time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilFirstRun = scheduledTime.getTime() - now.getTime();
    const dailyInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    console.log(`📅 Scheduled ${taskName} to run daily at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    console.log(`⏰ Next run: ${scheduledTime.toLocaleString()}`);

    // Set timeout for first run
    setTimeout(() => {
      // Run the task immediately on first schedule
      this.runTask(taskName, taskFunction);

      // Then set interval for daily runs
      this.intervals[taskName] = setInterval(() => {
        this.runTask(taskName, taskFunction);
      }, dailyInterval);

    }, timeUntilFirstRun);
  }

  // Run a task with error handling and logging
  async runTask(taskName, taskFunction) {
    const startTime = new Date();
    console.log(`🏃 Starting scheduled task: ${taskName} at ${startTime.toLocaleString()}`);

    try {
      await taskFunction();
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      console.log(`✅ Completed task: ${taskName} in ${duration}ms`);
    } catch (error) {
      console.error(`❌ Error in scheduled task ${taskName}:`, error);
    }
  }

  // Auto-cleanup failed orders task
  async autoCleanupFailedOrders() {
    try {
      console.log('🧹 Running auto-cleanup of failed orders...');
      
      const response = await $fetch('/api/admin/auto-cleanup-failed-orders', {
        method: 'POST',
        baseURL: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
      });

      if (response.success) {
        console.log(`✅ Auto-cleanup completed: ${response.data.deleted_count} orders deleted`);
      } else {
        console.error('❌ Auto-cleanup failed:', response.message);
      }

    } catch (error) {
      console.error('❌ Auto-cleanup task error:', error);
    }
  }

  // Manual trigger for testing
  async triggerCleanupNow() {
    console.log('🔧 Manually triggering auto-cleanup...');
    await this.autoCleanupFailedOrders();
  }
}

// Export singleton instance
export const scheduledTasks = new ScheduledTasks();

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  scheduledTasks.start();
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📤 SIGTERM received, stopping scheduled tasks...');
    scheduledTasks.stop();
  });
  
  process.on('SIGINT', () => {
    console.log('📤 SIGINT received, stopping scheduled tasks...');
    scheduledTasks.stop();
  });
}

export default scheduledTasks;
