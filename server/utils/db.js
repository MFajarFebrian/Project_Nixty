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

        // PostgreSQL query with enhanced error handling
        const client = await pool.connect();
        try {
          console.log('Executing PostgreSQL query:', pgSql);
          console.log('With parameters:', params);
          const result = await client.query(pgSql, params);
          console.log('Query result rows:', result.rows.length);
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
      const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;
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
      const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
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
    let query = `SELECT * FROM ${tableName}`;
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
  }
};

export default db;