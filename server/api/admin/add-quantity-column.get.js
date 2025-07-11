import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    // Check admin authentication
    const headers = getHeaders(event);
    const userId = headers['x-user-id'];
    const userEmail = headers['x-user-email'];
    
    if (!userId || !userEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Admin authentication required'
      });
    }

    console.log('Adding quantity column to transactions table...');

    // Check if quantity column already exists
    const [columns] = await db.execute(`
      SHOW COLUMNS FROM transactions LIKE 'quantity'
    `);

    if (columns.length > 0) {
      return {
        success: true,
        message: 'Quantity column already exists',
        action: 'no_action_needed'
      };
    }

    // Add quantity column to transactions table
    await db.execute(`
      ALTER TABLE transactions 
      ADD COLUMN quantity INT DEFAULT 1 NOT NULL 
      AFTER product_name
    `);

    console.log('Quantity column added successfully');

    // Update existing transactions to extract quantity from payment_gateway_payload
    const [existingTransactions] = await db.execute(`
      SELECT id, payment_gateway_payload 
      FROM transactions 
      WHERE payment_gateway_payload IS NOT NULL
    `);

    let updatedCount = 0;
    for (const transaction of existingTransactions) {
      try {
        const payload = JSON.parse(transaction.payment_gateway_payload);
        let quantity = 1; // default

        // Try to extract quantity from item_details
        if (payload.item_details && Array.isArray(payload.item_details) && payload.item_details.length > 0) {
          quantity = payload.item_details[0].quantity || 1;
        }

        await db.execute(`
          UPDATE transactions 
          SET quantity = ? 
          WHERE id = ?
        `, [quantity, transaction.id]);

        updatedCount++;
      } catch (parseError) {
        console.warn(`Could not parse payload for transaction ${transaction.id}:`, parseError.message);
        // Keep default quantity = 1
      }
    }

    console.log(`Updated quantity for ${updatedCount} existing transactions`);

    return {
      success: true,
      message: 'Quantity column added successfully',
      action: 'column_added',
      existingTransactionsUpdated: updatedCount
    };

  } catch (error) {
    console.error('Error adding quantity column:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to add quantity column: ${error.message}`
    });
  }
});
