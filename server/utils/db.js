import mysql from 'mysql2/promise';
import pkg from 'pg';
const { Pool } = pkg;
import { useOnlineDB, useSupabase } from './config.js';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// MySQL configurations (for local development)
const mysqlConfigs = {
  local: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nixty',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  online: {
    host: process.env.ONLINE_DB_HOST || 'sql12.freesqldatabase.com',
    user: process.env.ONLINE_DB_USER || 'sql12782583',
    password: process.env.ONLINE_DB_PASSWORD || 'vR3ku4pQn2',
    database: process.env.ONLINE_DB_NAME || 'sql12782583',
    port: process.env.ONLINE_DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};

// Enhanced Supabase PostgreSQL configuration with improved SSL handling
const supabaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  },
  max: 20, // Increased pool size
  idleTimeoutMillis: 60000, // Increased idle timeout
  connectionTimeoutMillis: 30000, // Significantly increased timeout
  acquireTimeoutMillis: 60000, // Added acquire timeout
  query_timeout: 30000, // Added query timeout
  statement_timeout: 30000 // Added statement timeout
};

let pool;
let isPostgreSQL = false;

// Initialize the database connection
function initializeDbConnection() {
  try {
    if (useSupabase) {
      console.log('Using SUPABASE PostgreSQL database');
      console.log(`Using direct connection string: ${supabaseConfig.connectionString ? 'Yes' : 'No'}`);
      
      // Make sure we have a valid connection string
      if (!supabaseConfig.connectionString) {
        console.log('Connection string not found, constructing manually...');
        // Construct connection string if not provided
        const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT || 6543}/${process.env.SUPABASE_DB_NAME || 'postgres'}`;
        console.log(`Constructed connection string: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
        supabaseConfig.connectionString = connectionString;
      }
      
      // Create pool
      pool = new Pool(supabaseConfig);
      isPostgreSQL = true;
    } else {
      const config = useOnlineDB ? mysqlConfigs.online : mysqlConfigs.local;
      console.log(`Using ${useOnlineDB ? 'ONLINE' : 'LOCAL'} MySQL database`);
      pool = mysql.createPool(config);
      isPostgreSQL = false;
    }
    
    // Add event listeners to handle connection issues
    if (isPostgreSQL) {
      pool.on('error', (err) => {
        console.error('Unexpected PostgreSQL pool error:', err);
      });
      
      // Test the connection with retry logic
      pool.query('SELECT 1').then(() => {
        console.log('PostgreSQL connection successful');
      }).catch(err => {
        console.error('PostgreSQL connection test failed:', err);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          console.log('Attempting to reconnect to PostgreSQL...');
          pool = new Pool(supabaseConfig);
        }, 5000);
      });
    }
    
    return pool;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Initialize the connection
pool = initializeDbConnection();

// Create a unified database interface
const db = {
  async query(sql, params = []) {
    try {
      if (isPostgreSQL) {
        // Convert MySQL placeholders (?) to PostgreSQL placeholders ($1, $2, etc.)
        let pgSql = sql;
        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

        // PostgreSQL query with enhanced error handling and retry logic
        let client;
        let retries = 3;
        
        while (retries > 0) {
          try {
            client = await Promise.race([
              pool.connect(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 15000)
              )
            ]);
            break; // Connection successful, exit retry loop
          } catch (connError) {
            retries--;
            console.error(`Connection attempt failed (${3 - retries}/3):`, connError.message);
            
            if (retries === 0) {
              console.error('All connection attempts failed');
              // If we're in development mode, return empty result instead of failing
              if (process.env.NODE_ENV === 'development') {
                console.log('Development mode: returning empty result instead of failing');
                return [[], []];
              }
              throw connError;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        try {
          console.log('Executing PostgreSQL query:', pgSql);
          console.log('With parameters:', params);
          const result = await client.query(pgSql, params);
          console.log('Query result rows:', result.rows?.length || 0);
          return [result.rows, result.fields];
        } finally {
          client.release();
        }
      } else {
        // MySQL query
        console.log('Executing MySQL query:', sql);
        console.log('With parameters:', params);
        const [rows, fields] = await pool.execute(sql, params);
        console.log('Query result rows:', rows.length);
        return [rows, fields];
      }
    } catch (error) {
      console.error('Database query error:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        sql: sql,
        params: params
      });
      throw error;
    }
  },

  async execute(sql, params = []) {
    return this.query(sql, params);
  },

  // Supabase-optimized methods
  async insert(tableName, data) {
    if (isPostgreSQL) {
      const fields = Object.keys(data);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(data);
      const fullTableName = `nixty.${tableName}`;
      const query = `INSERT INTO ${fullTableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const [result] = await this.query(query, values);
      return result[0];
    } else {
      const fields = Object.keys(data);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(data);
      const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
      const [result] = await this.query(query, values);
      const [fetchedRecord] = await this.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
      return fetchedRecord[0];
    }
  },

  async update(tableName, data, id) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    values.push(id);
    
    if (isPostgreSQL) {
      const fullTableName = `nixty.${tableName}`;
      const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
      const query = `UPDATE ${fullTableName} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
      const [result] = await this.query(query, values);
      return result[0];
    } else {
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
      await this.query(query, values);
      const [fetchedRecord] = await this.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
      return fetchedRecord[0];
    }
  },

  async select(tableName, conditions = {}, options = {}) {
    const fullTableName = isPostgreSQL ? `nixty.${tableName}` : tableName;
    let query = `SELECT * FROM ${fullTableName}`;
    const params = [];
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map((key, i) => {
        params.push(conditions[key]);
        return isPostgreSQL ? `${key} = $${i + 1}` : `${key} = ?`;
      }).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }
    
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    
    const [result] = await this.query(query, params);
    return result;
  },
  
  // Testing connection
  async testConnection() {
    try {
      if (isPostgreSQL) {
        const [result] = await this.query('SELECT NOW() as time');
        console.log('PostgreSQL connection test successful:', result[0].time);
        return true;
      } else {
        const [result] = await this.query('SELECT NOW() as time');
        console.log('MySQL connection test successful:', result[0].time);
        return true;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
};

export default db;