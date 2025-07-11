import db from './db.js';

export class WebhookLogger {
  static async logWebhookStart(orderId, payload, webhookType = 'midtrans') {
    try {
      const [result] = await db.execute(`
        INSERT INTO webhook_logs (
          order_id, webhook_type, status, request_payload, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `, [orderId, webhookType, 'processing', JSON.stringify(payload)]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error logging webhook start:', error);
      return null;
    }
  }

  static async logWebhookComplete(logId, responseStatus, licenseProcessingSuccess, licensesProcessed, emailSent, processingDuration) {
    try {
      if (!logId) return;
      
      await db.execute(`
        UPDATE webhook_logs SET 
          status = ?,
          response_status = ?,
          license_processing_success = ?,
          licenses_processed = ?,
          email_sent = ?,
          processing_duration_ms = ?
        WHERE id = ?
      `, [
        licenseProcessingSuccess ? 'completed' : 'failed',
        responseStatus,
        licenseProcessingSuccess,
        licensesProcessed,
        emailSent,
        processingDuration,
        logId
      ]);
    } catch (error) {
      console.error('Error logging webhook completion:', error);
    }
  }

  static async logWebhookError(logId, errorMessage, responseStatus = 500) {
    try {
      if (!logId) return;
      
      await db.execute(`
        UPDATE webhook_logs SET 
          status = 'error',
          response_status = ?,
          error_message = ?
        WHERE id = ?
      `, [responseStatus, errorMessage, logId]);
    } catch (error) {
      console.error('Error logging webhook error:', error);
    }
  }

  static async logLicenseDeliveryFailure(transactionId, orderId, failureReason) {
    try {
      await db.execute(`
        INSERT INTO license_delivery_failures (
          transaction_id, order_id, failure_reason, created_at
        ) VALUES (?, ?, ?, NOW())
      `, [transactionId, orderId, failureReason]);
    } catch (error) {
      console.error('Error logging license delivery failure:', error);
    }
  }

  static async incrementRetryCount(transactionId) {
    try {
      await db.execute(`
        UPDATE license_delivery_failures SET 
          retry_count = retry_count + 1,
          last_retry_at = NOW(),
          updated_at = NOW()
        WHERE transaction_id = ? AND resolved = FALSE
      `, [transactionId]);
    } catch (error) {
      console.error('Error incrementing retry count:', error);
    }
  }

  static async markLicenseDeliveryResolved(transactionId) {
    try {
      await db.execute(`
        UPDATE license_delivery_failures SET 
          resolved = TRUE,
          resolved_at = NOW(),
          updated_at = NOW()
        WHERE transaction_id = ? AND resolved = FALSE
      `, [transactionId]);
    } catch (error) {
      console.error('Error marking license delivery resolved:', error);
    }
  }

  static async getFailedDeliveries(limit = 50) {
    try {
      const [failures] = await db.execute(`
        SELECT ldf.*, t.order_id, t.product_name, t.customer_name, t.email
        FROM license_delivery_failures ldf
        JOIN transactions t ON ldf.transaction_id = t.id
        WHERE ldf.resolved = FALSE AND ldf.retry_count < ldf.max_retries
        ORDER BY ldf.created_at DESC
        LIMIT ?
      `, [limit]);
      
      return failures;
    } catch (error) {
      console.error('Error getting failed deliveries:', error);
      return [];
    }
  }

  static async getWebhookStats(days = 7) {
    try {
      const [stats] = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_webhooks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN status = 'failed' OR status = 'error' THEN 1 ELSE 0 END) as failed,
          AVG(processing_duration_ms) as avg_duration_ms,
          SUM(licenses_processed) as total_licenses_processed
        FROM webhook_logs 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [days]);
      
      return stats;
    } catch (error) {
      console.error('Error getting webhook stats:', error);
      return [];
    }
  }
}

export default WebhookLogger;
