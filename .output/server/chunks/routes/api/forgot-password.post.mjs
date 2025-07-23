import { c as defineEventHandler, r as readBody, f as db } from '../../_/nitro.mjs';
import { randomBytes } from 'crypto';
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

const forgotPassword_post = defineEventHandler(async (event) => {
  try {
    const { email } = await readBody(event);
    if (!email) {
      return {
        success: false,
        message: "Email is required"
      };
    }
    const [users] = await db.execute(
      "SELECT id, email, name FROM nixty.users WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      console.log(`Reset password requested for non-existent email: ${email}`);
      return {
        success: true,
        message: "If an account with this email exists, a password reset link has been sent."
      };
    }
    const user = users[0];
    const resetToken = randomBytes(32).toString("hex");
    const tokenExpiry = /* @__PURE__ */ new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);
    await db.execute(
      "UPDATE nixty.users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [resetToken, tokenExpiry, user.id]
    );
    const resetUrl = `${event.node.req.headers.origin || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    return {
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
      // In production, remove the resetUrl from response
      resetUrl
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "An error occurred while processing your request"
    };
  }
});

export { forgotPassword_post as default };
//# sourceMappingURL=forgot-password.post.mjs.map
