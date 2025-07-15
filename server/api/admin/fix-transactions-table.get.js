import db from '../../utils/db.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('Attempting to fix transactions table schema...');
    
    // First, let's check the current table structure
    const tableInfo = await db.query(`DESCRIBE transactions`);
    console.log('Current table structure:', tableInfo);
    
    // Check if id column has AUTO_INCREMENT
    const showCreate = await db.query(`SHOW CREATE TABLE transactions`);
    console.log('Current CREATE TABLE statement:', showCreate);
    
    // Alter the table to add AUTO_INCREMENT to id column
    await db.query(`ALTER TABLE transactions MODIFY COLUMN id INT AUTO_INCREMENT`);
    console.log('Successfully added AUTO_INCREMENT to id column');
    
    // Also ensure order_id has UNIQUE constraint if it doesn't already
    try {
      await db.query(`ALTER TABLE transactions ADD CONSTRAINT unique_order_id UNIQUE (order_id)`);
      console.log('Added UNIQUE constraint to order_id');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('UNIQUE constraint on order_id already exists');
      } else {
        console.log('Error adding UNIQUE constraint:', error.message);
      }
    }
    
    // Verify the changes
    const updatedTableInfo = await db.query(`DESCRIBE transactions`);
    console.log('Updated table structure:', updatedTableInfo);
    
    return {
      success: true,
      message: 'Transactions table schema fixed successfully',
      tableInfo: updatedTableInfo
    };
    
  } catch (error) {
    console.error('Error fixing transactions table:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
});
