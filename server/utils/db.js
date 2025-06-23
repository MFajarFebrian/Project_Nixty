import mysql from 'mysql2/promise';
import pkg from 'pg';
const { Pool } = pkg;
import { useOnlineDB, useSupabase } from './config.js';

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

// Supabase PostgreSQL configuration
const supabaseConfig = {
  host: process.env.SUPABASE_DB_HOST,
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  port: process.env.SUPABASE_DB_PORT || 5432,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

let pool;
let isPostgreSQL = false;

if (useSupabase) {
  console.log('Using SUPABASE PostgreSQL database');
  pool = new Pool(supabaseConfig);
  isPostgreSQL = true;
} else {
  const config = useOnlineDB ? mysqlConfigs.online : mysqlConfigs.local;
  console.log(`Using ${useOnlineDB ? 'ONLINE' : 'LOCAL'} MySQL database`);
  pool = mysql.createPool(config);
  isPostgreSQL = false;
}

// Create a unified database interface
const db = {
  async query(sql, params = []) {
    try {
      if (isPostgreSQL) {
        // Convert MySQL placeholders (?) to PostgreSQL placeholders ($1, $2, etc.)
        let pgSql = sql;
        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

        // PostgreSQL query
        const client = await pool.connect();
        try {
          const result = await client.query(pgSql, params);
          return [result.rows, result.fields];
        } finally {
          client.release();
        }
      } else {
        // MySQL query
        const [rows, fields] = await pool.execute(sql, params);
        return [rows, fields];
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  async execute(sql, params = []) {
    return this.query(sql, params);
  }
};

export default db;