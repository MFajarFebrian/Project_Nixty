import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Validate required fields
    const requiredFields = ['order_id', 'product_id', 'product_name', 'quantity', 'customer_name', 'email', 'amount'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Prepare transaction data
    const {
      order_id,
      product_id,
      product_name,
      quantity,
      customer_name,
      email,
      amount,
      payment_method = 'bank_transfer',
      status = 'pending',
      custom_email
    } = body;
    
    console.log(`Creating test transaction for order: ${order_id}`);
    
    // Insert transaction into database
    const [result] = await db.execute(`
      INSERT INTO transactions (
        order_id,
        product_id,
        product_name,
        quantity,
        customer_name,
        email,
        amount,
        payment_method,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      order_id,
      product_id,
      product_name,
      quantity,
      customer_name,
      email,
      amount,
      payment_method,
      status
    ]);
    
    if (!result.insertId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create transaction'
      });
    }
    
    const transactionId = result.insertId;
    
    // If custom email is provided, add it to payment_gateway_logs
    if (custom_email) {
      await db.execute(`
        INSERT INTO payment_gateway_logs (
          transaction_id,
          log_key,
          log_value,
          created_at
        ) VALUES (?, ?, ?, NOW())
      `, [
        transactionId,
        'custom_email',
        custom_email
      ]);
      
      console.log(`Added custom email ${custom_email} to transaction ${transactionId}`);
    }
    
    console.log(`Test transaction created with ID: ${transactionId}`);
    
    return {
      success: true,
      message: 'Test transaction created successfully',
      transactionId,
      order_id
    };
    
  } catch (error) {
    console.error('Error creating test transaction:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create test transaction'
    });
  }
}); 