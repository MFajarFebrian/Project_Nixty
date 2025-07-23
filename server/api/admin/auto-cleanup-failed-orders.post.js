import pool from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('🧹 Starting auto-cleanup of failed orders older than 1 week...');
    
    // Calculate date 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Find failed orders older than 1 week
    const [failedOrders] = await pool.execute(
      `SELECT id, user_id, product_id, status, created_at 
       FROM nixty.orders 
       WHERE status = 'failed' 
       AND created_at < ?`,
      [oneWeekAgo]
    );
    
    if (failedOrders.length === 0) {
      console.log('✅ No failed orders to cleanup');
      return {
        success: true,
        message: 'No failed orders to cleanup',
        data: {
          deleted_count: 0,
          cleanup_date: oneWeekAgo.toISOString()
        }
      };
    }
    
    console.log(`📋 Found ${failedOrders.length} failed orders to cleanup`);
    
    let deletedCount = 0;
    const errors = [];
    
    // Process each failed order
    for (const order of failedOrders) {
      try {
        console.log(`🗑️ Cleaning up order ${order.id} (created: ${order.created_at})`);
        
        // Start database transaction
        await pool.execute('START TRANSACTION');
        
        // Delete related data first (foreign key constraints)
        
        // 1. Delete payment gateway logs
        await pool.execute(
          'DELETE FROM nixty.payment_gateway_logs WHERE transaction_id = ?',
          [order.id]
        );
        
        // 2. Delete order licenses (if any)
        await pool.execute(
          'DELETE FROM nixty.orders_license WHERE transaction_id = ?',
          [order.id]
        );
        
        // 3. Delete the order itself
        const [deleteResult] = await pool.execute(
          'DELETE FROM nixty.orders WHERE id = ?',
          [order.id]
        );
        
        if (deleteResult.affectedRows > 0) {
          deletedCount++;
          console.log(`✅ Successfully deleted order ${order.id}`);
        }
        
        // Commit transaction
        await pool.execute('COMMIT');
        
      } catch (error) {
        // Rollback on error
        await pool.execute('ROLLBACK');
        console.error(`❌ Error deleting order ${order.id}:`, error.message);
        errors.push({
          order_id: order.id,
          error: error.message
        });
      }
    }
    
    console.log(`🎯 Auto-cleanup completed: ${deletedCount}/${failedOrders.length} orders deleted`);
    
    return {
      success: true,
      message: `Auto-cleanup completed: ${deletedCount} failed orders deleted`,
      data: {
        deleted_count: deletedCount,
        total_found: failedOrders.length,
        cleanup_date: oneWeekAgo.toISOString(),
        errors: errors
      }
    };
    
  } catch (error) {
    console.error('❌ Auto-cleanup failed:', error);
    
    // Rollback any pending transaction
    try {
      await pool.execute('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to perform auto-cleanup of failed orders',
    });
  }
});
