import db from '../../utils/db.js';

export default async function handler(req, res) {
  try {
    console.log('Setting up test user and transaction...');
    
    // First, create test user if doesn't exist
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      ['testing@example.com']
    );
    
    let userId;
    if (existingUser.length === 0) {
      const [userResult] = await db.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        ['Test User', 'testing@example.com', '$2b$10$dummyhash'] // dummy hash
      );
      userId = userResult.insertId;
      console.log('Created test user with ID:', userId);
    } else {
      userId = existingUser[0].id;
      console.log('Test user already exists with ID:', userId);
    }
    
    // Check if test transaction exists
    const [existingTransaction] = await db.query(
      'SELECT id FROM transactions WHERE user_id = ? AND status = ?',
      [userId, 'pending']
    );
    
    let transactionId;
    if (existingTransaction.length === 0) {
      // Create a test pending transaction
      const [transactionResult] = await db.execute(
        `INSERT INTO transactions (user_id, order_id, amount, status, payment_type, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, `ORDER-TEST-${Date.now()}`, 50000, 'pending', 'credit_card']
      );
      transactionId = transactionResult.insertId;
      console.log('Created test transaction with ID:', transactionId);
    } else {
      transactionId = existingTransaction[0].id;
      console.log('Test transaction already exists with ID:', transactionId);
    }
    
    // Get the transaction details to return
    const [transaction] = await db.query(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );
    
    res.status(200).json({
      success: true,
      message: 'Test user and transaction set up successfully',
      user: {
        id: userId,
        email: 'testing@example.com',
        name: 'Test User'
      },
      transaction: transaction[0]
    });
    
  } catch (error) {
    console.error('Error setting up test user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
