import pool from '../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    // Get current database name first
    const [dbResult] = await pool.execute('SELECT DATABASE() as db_name');
    const dbName = dbResult[0].db_name;
    
    // Get tables from current database
    const [rows] = await pool.execute('SHOW TABLES');
    
    const tables = rows.map(row => {
      return Object.values(row)[0];
    });
    
    console.log(`Found ${tables.length} tables in database: ${dbName}`);
    
    return {
      success: true,
      tables
    };
    
  } catch (error) {
    console.error('Error fetching tables:', error);
    
    return {
      success: false,
      message: 'An error occurred while fetching tables'
    };
  }
}); 