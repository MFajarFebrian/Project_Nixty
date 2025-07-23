import db from '../../utils/db.js';
import { useSupabase } from '../../utils/config.js';

export default defineEventHandler(async (event) => {
  try {
    let dbName, tables;
    
    if (useSupabase) {
      // PostgreSQL queries for Supabase
      const [dbResult] = await db.query('SELECT current_database() as db_name');
      dbName = dbResult[0].db_name;
      
      // Get tables from nixty schema (excluding system tables)
      const [rows] = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'nixty' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      tables = rows.map(row => row.table_name);
    } else {
      // MySQL queries for local/online MySQL
      const [dbResult] = await db.query('SELECT DATABASE() as db_name');
      dbName = dbResult[0].db_name;
      
      // Get tables from current database
      const [rows] = await db.query('SHOW TABLES');
      
      tables = rows.map(row => {
        return Object.values(row)[0];
      });
    }
    
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
