import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import { r as requireAuth } from '../../../_/auth.mjs';
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

const update_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { name, email, phone } = body;
    if (!name && !email && !phone) {
      throw createError({
        statusCode: 400,
        statusMessage: "At least one field (name, email, or phone) is required"
      });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid email format"
      });
    }
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid phone number format"
      });
    }
    if (email) {
      const [existingUsers] = await db.query(
        "SELECT id FROM nixty.users WHERE email = ? AND id != ?",
        [email, user.id]
      );
      if (existingUsers.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Email already exists"
        });
      }
    }
    const updateFields = [];
    const updateValues = [];
    if (name) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }
    if (email) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }
    if (phone) {
      updateFields.push("phone = ?");
      updateValues.push(phone);
    }
    updateValues.push(user.id);
    await db.query(
      `UPDATE nixty.users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );
    const [rows] = await db.query(
      "SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?",
      [user.id]
    );
    return {
      success: true,
      message: "Profile updated successfully",
      user: rows[0]
    };
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update profile"
    });
  }
});

export { update_post as default };
//# sourceMappingURL=update.post.mjs.map
