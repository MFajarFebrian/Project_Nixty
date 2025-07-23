import { c as defineEventHandler, k as useSupabase, f as db } from '../../../_/nitro.mjs';
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

const tables_get = defineEventHandler(async (event) => {
  try {
    let dbName, tables;
    if (useSupabase) {
      const [dbResult] = await db.query("SELECT current_database() as db_name");
      dbName = dbResult[0].db_name;
      const [rows] = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'nixty' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      tables = rows.map((row) => row.table_name);
    }
    console.log(`Found ${tables.length} tables in database: ${dbName}`);
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
