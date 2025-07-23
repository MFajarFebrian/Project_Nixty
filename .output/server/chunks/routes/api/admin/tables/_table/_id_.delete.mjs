import { c as defineEventHandler, l as getRouterParam, f as db, e as createError, k as useSupabase } from '../../../../../_/nitro.mjs';
import { v as validateTableName, b as validateRecordId } from '../../../../../_/admin-validation.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, "table");
    const recordId = getRouterParam(event, "id");
    validateTableName(tableName);
    const validRecordId = validateRecordId(recordId);
    const [existingRecord] = await db.execute(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );
    if (existingRecord.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Record not found"
      });
    }
    if (tableName === "users") {
      if (existingRecord[0].account_type === "admin") {
        const [adminCount] = await db.execute(
          "SELECT COUNT(*) as count FROM users WHERE account_type = ?",
          ["admin"]
        );
        const countValue = useSupabase ? parseInt(adminCount[0].count) : adminCount[0].count;
        if (countValue <= 1) {
          throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete the last admin user"
          });
        }
      }
    }
    if (tableName === "products") {
      try {
        const [deleteLicensesResult] = await db.execute(
          "DELETE FROM product_licenses WHERE product_id = ?",
          [validRecordId]
        );
        const deletedLicensesCount = useSupabase ? deleteLicensesResult.rowCount : deleteLicensesResult.affectedRows;
        console.log(`Deleted ${deletedLicensesCount} related product licenses.`);
      } catch (licenseError) {
        console.error("Error deleting related product licenses:", licenseError);
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to delete related product licenses. Please check for dependencies on transactions."
        });
      }
    }
    const [result] = await db.execute(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [validRecordId]
    );
    const affectedRows = useSupabase ? result.rowCount : result.affectedRows;
    if (affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "Record not found or already deleted"
      });
    }
    return {
      success: true,
      message: "Record deleted successfully",
      data: {
        deletedRecord: existingRecord[0],
        affectedRows
      }
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error deleting record:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete record"
    });
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
