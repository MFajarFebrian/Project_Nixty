import { setHeaders } from 'h3';
import pool from '../../utils/db.js';

/**
 * Test endpoint to simulate repayment with authenticated user session
 * This will test the repayment flow with a test user
 */
export default defineEventHandler(async (event) => {
  try {
    // Get a test user from the database
    const [userRows] = await pool.execute(
      'SELECT id, email, name, account_type, profile_picture, created_at FROM users WHERE email = ?',
      ['testing@example.com']
    );

    if (userRows.length === 0) {
      return {
        success: false,
        error: 'Test user not found. Please ensure testing@example.com exists in the database.'
      };
    }

    const testUser = userRows[0];
    
    // Get a test transaction that can be repaid
    const [transactionRows] = await pool.execute(
      'SELECT * FROM transactions WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [testUser.id, 'pending']
    );

    if (transactionRows.length === 0) {
      return {
        success: false,
        error: 'No pending transactions found for test user',
        testUser: testUser
      };
    }

    const testTransaction = transactionRows[0];

    // Create a request to the repay endpoint with proper headers
    const repayUrl = `${getRequestURL(event).origin}/api/profile/history_order/repay`;
    
    const repayResponse = await $fetch(repayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-session': JSON.stringify(testUser)
      },
      body: {
        order_id: testTransaction.order_id
      }
    });

    return {
      success: true,
      testUser: testUser,
      testTransaction: testTransaction,
      repayResponse: repayResponse
    };

  } catch (error) {
    console.error('Test repay error:', error);
    return {
      success: false,
      error: error.message,
      details: error.data || error.statusMessage
    };
  }
});
