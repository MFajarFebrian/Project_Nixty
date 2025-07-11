import midtransClient from 'midtrans-client';
import { midtransConfig } from '~/server/utils/config';
import db from '~/server/utils/db';
import crypto from 'crypto';

// Initialize Midtrans Core API client
const core = new midtransClient.CoreApi({
  isProduction: midtransConfig.isProduction,
  serverKey: midtransConfig.serverKey,
  clientKey: midtransConfig.clientKey
});

function verifySignature(orderId, statusCode, grossAmount, serverKey, signatureKey) {
  const hash = crypto.createHash('sha512');
  const stringToHash = orderId + statusCode + grossAmount + serverKey;
  hash.update(stringToHash);
  const calculatedSignature = hash.digest('hex');
  return calculatedSignature === signatureKey;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  console.log('Received Midtrans Webhook:', body);

  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;
  
  // 1. Verify signature key
  const isSignatureValid = verifySignature(order_id, status_code, gross_amount, midtransConfig.serverKey, signature_key);
  if (!isSignatureValid) {
    console.error('Invalid signature key for order_id:', order_id);
    throw createError({ statusCode: 400, statusMessage: 'Invalid signature' });
  }

  // 2. Determine new status and update database
  let newStatus = 'pending';
  if (transaction_status == 'capture') {
    if (fraud_status == 'accept') {
      newStatus = 'completed';
    }
  } else if (transaction_status == 'settlement') {
    newStatus = 'completed';
  } else if (transaction_status == 'cancel' || transaction_status == 'deny' || transaction_status == 'expire') {
    newStatus = 'failed';
  } else if (transaction_status == 'pending') {
    newStatus = 'pending';
  }

  try {
    const [result] = await db.execute(
      `UPDATE transactions SET status = ?, payment_method = ?, updated_at = NOW() WHERE order_id = ?`,
      [newStatus, body.payment_type || 'N/A', order_id]
    );

    if (result.affectedRows > 0) {
      console.log(`Transaction ${order_id} updated to ${newStatus}`);
      
      // If transaction is completed, mark the license as used.
      if (newStatus === 'completed') {
        const [transactionRows] = await db.execute('SELECT id, product_id, quantity FROM transactions WHERE order_id = ?', [order_id]);
        if (transactionRows.length > 0) {
          const transactionId = transactionRows[0].id;
          const productId = transactionRows[0].product_id;
          const quantity = transactionRows[0].quantity || 1;

          // Find available licenses for this product and reserve them based on quantity.
          await db.execute(
            `UPDATE product_licenses 
             SET is_used = 1, status = 'used', used_by_transaction_id = ?, used_at = NOW() 
             WHERE product_id = ? AND status = 'available' 
             LIMIT ?`,
            [transactionId, productId, quantity]
          );
          console.log(`${quantity} license(s) for product ${productId} marked as used for transaction ${transactionId}`);
        }
      }
    } else {
      console.warn(`No transaction found with order_id: ${order_id}`);
    }

  } catch (error) {
    console.error('Webhook DB Error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }

  return { message: 'Webhook processed successfully' };
}); 