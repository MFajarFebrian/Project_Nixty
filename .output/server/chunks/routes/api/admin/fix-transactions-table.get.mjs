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

const fixTransactionsTable_get = defineEventHandler(async (event) => {
  try {
    console.log("Attempting to fix transactions table schema...");
    const tableInfo = await db.query(`DESCRIBE transactions`);
    console.log("Current table structure:", tableInfo);
    const showCreate = await db.query(`SHOW CREATE TABLE transactions`);
    console.log("Current CREATE TABLE statement:", showCreate);
    await db.query(`ALTER TABLE transactions MODIFY COLUMN id INT AUTO_INCREMENT`);
    console.log("Successfully added AUTO_INCREMENT to id column");
    try {
      await db.query(`ALTER TABLE transactions ADD CONSTRAINT unique_order_id UNIQUE (order_id)`);
      console.log("Added UNIQUE constraint to order_id");
    } catch (error) {
      if (error.code === "ER_DUP_KEYNAME") {
        console.log("UNIQUE constraint on order_id already exists");
      } else {
        console.log("Error adding UNIQUE constraint:", error.message);
      }
    }
    const updatedTableInfo = await db.query(`DESCRIBE transactions`);
    console.log("Updated table structure:", updatedTableInfo);
    return {
      success: true,
      message: "Transactions table schema fixed successfully",
      tableInfo: updatedTableInfo
    };
  } catch (error) {
    console.error("Error fixing transactions table:", error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
});

export { fixTransactionsTable_get as default };
//# sourceMappingURL=fix-transactions-table.get.mjs.map
