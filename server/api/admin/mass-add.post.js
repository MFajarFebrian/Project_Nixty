import { defineEventHandler, readBody } from 'h3';
import pool from '../../utils/db';

export default defineEventHandler(async (event) => {
  const { table, records } = await readBody(event);

  if (!table || !records || !Array.isArray(records) || records.length === 0) {
    return { success: false, message: 'Invalid request body' };
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const record of records) {
      await connection.query(`INSERT INTO ${table} SET ?`, record);
    }

    await connection.commit();

    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error('Error in mass-add endpoint:', error);
    return { success: false, message: 'An error occurred during the mass add operation.' };
  } finally {
    connection.release();
  }
});
