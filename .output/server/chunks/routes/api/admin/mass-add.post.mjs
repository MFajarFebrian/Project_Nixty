import { c as defineEventHandler, r as readBody, f as db } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'chokidar';
import 'anymatch';
import 'node:crypto';
import 'node:url';
import 'mysql2/promise';
import 'pg';

const massAdd_post = defineEventHandler(async (event) => {
  const { table, records } = await readBody(event);
  if (!table || !records || !Array.isArray(records) || records.length === 0) {
    return { success: false, message: "Invalid request body" };
  }
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const record of records) {
      await connection.query(`INSERT INTO ${table} SET ?`, record);
    }
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error in mass-add endpoint:", error);
    return { success: false, message: "An error occurred during the mass add operation." };
  } finally {
    connection.release();
  }
});

export { massAdd_post as default };
//# sourceMappingURL=mass-add.post.mjs.map
