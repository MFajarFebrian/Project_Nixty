import { c as defineEventHandler, r as readBody, f as db } from '../../../_/nitro.mjs';
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

const googleRegister_post = defineEventHandler(async (event) => {
  try {
    const { email, name, google_id, picture } = await readBody(event);
    if (!email || !google_id) {
      return {
        success: false,
        message: "Email and Google ID are required"
      };
    }
    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const users = existingUsers;
    if (users.length > 0) {
      return {
        success: false,
        message: "A user with this email already exists"
      };
    }
    const randomPassword = Math.random().toString(36).substring(2, 15);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const [result] = await db.execute(
      "INSERT INTO users (email, name, password, account_type, google_id, profile_picture) VALUES (?, ?, ?, ?, ?, ?)",
      [email, name, hashedPassword, "user", google_id, picture]
    );
    const insertId = result.insertId;
    const [newUsers] = await db.execute(
      "SELECT * FROM users WHERE id = ?",
      [insertId]
    );
    const user = newUsers[0];
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      message: "Google registration successful",
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Google registration error:", error);
    return {
      success: false,
      message: "An error occurred during Google registration"
    };
  }
});

export { googleRegister_post as default };
//# sourceMappingURL=google-register.post.mjs.map
