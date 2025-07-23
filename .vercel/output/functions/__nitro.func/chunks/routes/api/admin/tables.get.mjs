import { d as defineEventHandler } from '../../../_/nitro.mjs';
import { p as pool } from '../../../_/db.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';

const tables_get = defineEventHandler(async (event) => {
  try {
    const [rows] = await pool.execute(
      "SHOW TABLES FROM nixty"
    );
    const tables = rows.map((row) => {
      return Object.values(row)[0];
    });
    return {
      success: true,
      tables
    };
  } catch (error) {
    console.error("Error fetching tables:", error);
    return {
      success: false,
      message: "An error occurred while fetching tables"
    };
  }
});

export { tables_get as default };
//# sourceMappingURL=tables.get.mjs.map
