import { c as defineEventHandler, f as db } from '../../../_/nitro.mjs';
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

const checkTransactionsTable_get = defineEventHandler(async (event) => {
  try {
    const [tableInfo] = await db.query("DESCRIBE transactions");
    const [countResult] = await db.query("SELECT COUNT(*) as count FROM transactions");
    const [duplicateCheck] = await db.query(`
            SELECT order_id, COUNT(*) as count 
            FROM transactions 
            GROUP BY order_id 
            HAVING COUNT(*) > 1
        `);
    return {
      success: true,
      tableStructure: tableInfo,
      totalTransactions: countResult[0].count,
      duplicateOrders: duplicateCheck
    };
  } catch (error) {
    console.error("Database check error:", error);
    return {
      success: false,
      error: error.message
    };
  }
});

export { checkTransactionsTable_get as default };
//# sourceMappingURL=check-transactions-table.get.mjs.map
