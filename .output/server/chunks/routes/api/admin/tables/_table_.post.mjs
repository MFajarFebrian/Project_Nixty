import { c as defineEventHandler, l as getRouterParam, r as readBody, e as createError, k as useSupabase, f as db } from '../../../../_/nitro.mjs';
import bcrypt from 'bcryptjs';
import { v as validateTableName, a as validateRecordData } from '../../../../_/admin-validation.mjs';
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

const _table__post = defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, "table");
    const body = await readBody(event);
    validateTableName(tableName);
    if (!body || typeof body !== "object") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request body"
      });
    }
    let validData;
    try {
      validData = validateRecordData(tableName, body, false);
    } catch (error) {
      if (error.validationErrors) {
        throw createError({
          statusCode: 400,
          statusMessage: "Validation errors",
          data: { errors: error.validationErrors }
        });
      }
      throw error;
    }
    if (tableName === "users") {
      if (validData.email) {
        const userTable = useSupabase ? "nixty.users" : "users";
        const [existingUser] = await db.execute(
          `SELECT id FROM ${userTable} WHERE email = ?`,
          [validData.email]
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
    const newRecord = await db.insert(tableName, validData);
    return {
      success: true,
      message: "Record created successfully",
      data: newRecord
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error creating record:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create record"
    });
  }
});

export { _table__post as default };
//# sourceMappingURL=_table_.post.mjs.map
