import { c as defineEventHandler, r as readBody, e as createError, f as db } from '../../../_/nitro.mjs';
import bcrypt from 'bcryptjs';
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

const changePassword_post = defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password and new password are required"
      });
    }
    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must be at least 8 characters long"
      });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must contain at least one uppercase letter, one lowercase letter, and one number"
      });
    }
    const [rows] = await db.query(
      "SELECT password FROM nixty.users WHERE id = ?",
      [user.id]
    );
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }
    const currentUser = rows[0];
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isCurrentPasswordValid) {
      throw createError({
        statusCode: 400,
        statusMessage: "Current password is incorrect"
      });
    }
    const isSamePassword = await bcrypt.compare(newPassword, currentUser.password);
    if (isSamePassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "New password must be different from current password"
      });
    }
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    await db.query(
      "UPDATE nixty.users SET password = ? WHERE id = ?",
      [hashedNewPassword, user.id]
    );
    return {
      success: true,
      message: "Password changed successfully"
    };
  } catch (error) {
    console.error("Password change error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to change password"
    });
  }
});

export { changePassword_post as default };
//# sourceMappingURL=change-password.post.mjs.map
