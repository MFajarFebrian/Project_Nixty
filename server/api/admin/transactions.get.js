import pool from '../../utils/db';

export default defineEventHandler(async (event) => {
  const [rows] = await pool.execute('SELECT * FROM transactions ORDER BY created_at DESC');
  return rows;
});
