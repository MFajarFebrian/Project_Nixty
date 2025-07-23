import { c as defineEventHandler, l as getRouterParam, r as readBody, e as createError, f as db, k as useSupabase } from '../../../../../_/nitro.mjs';
import bcrypt from 'bcryptjs';
import { v as validateTableName, b as validateRecordId, a as validateRecordData } from '../../../../../_/admin-validation.mjs';
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

const _id__put = defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, "table");
    const recordId = getRouterParam(event, "id");
    const body = await readBody(event);
    validateTableName(tableName);
    const validRecordId = validateRecordId(recordId);
    if (!body || typeof body !== "object") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body"
      });
    }
    let validData;
    try {
      console.log("Update request body:", JSON.stringify(body, null, 2));
      validData = validateRecordData(tableName, body, true);
      console.log("Validated data:", JSON.stringify(validData, null, 2));
    } catch (error) {
      console.error("Validation error details:", error.validationErrors || error.message);
      if (error.validationErrors) {
        throw createError({
          statusCode: 400,
          statusMessage: "Validation errors",
          data: { errors: error.validationErrors }
        });
      }
      throw error;
    }
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
      if (validData.email) {
        const [existingUser] = await db.execute(
          "SELECT id FROM users WHERE email = ? AND id != ?",
          [validData.email, validRecordId]
        );
        if (existingUser.length > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: "A user with this email already exists"
          });
        }
      }
      if (validData.password) {
        validData.password = await bcrypt.hash(validData.password, 10);
      }
    }
    if (!useSupabase) ;
    if (Object.keys(validData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No valid data provided"
      });
    }
    const updatedRecord = await db.update(tableName, validData, recordId);
    return {
      success: true,
      data: updatedRecord
    };
  } catch (error) {
    console.error("Error updating record:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update record"
    });
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
