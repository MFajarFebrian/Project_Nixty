import { c as defineEventHandler, r as readBody, f as db } from '../../_/nitro.mjs';
import bcrypt from 'bcryptjs';
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

const resetPassword_post = defineEventHandler(async (event) => {
  try {
    const { token, password } = await readBody(event);
    if (!token || !password) {
      return {
        success: false,
        message: "Token and password are required"
      };
    }
    if (password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters long"
      };
    }
    const [users] = await db.execute(
      "SELECT * FROM nixty.users WHERE reset_token = ?",
      [token]
    );
    if (users.length === 0) {
      return {
        success: false,
        message: "Invalid or expired reset token"
      };
    }
    const user = users[0];
    const tokenExpiry = new Date(user.reset_token_expires);
    const now = /* @__PURE__ */ new Date();
    if (now > tokenExpiry) {
      return {
        success: false,
        message: "Reset token has expired. Please request a new one."
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      "UPDATE nixty.users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );
    return {
      success: true,
      message: "Your password has been reset successfully. You can now login with your new password."
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "An error occurred while resetting your password"
    };
  }
});

export { resetPassword_post as default };
//# sourceMappingURL=reset-password.post.mjs.map
