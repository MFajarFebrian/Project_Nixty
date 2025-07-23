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

const register_post = defineEventHandler(async (event) => {
  try {
    const { email, password, name } = await readBody(event);
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required"
      };
    }
    const [existingUsers] = await db.query(
      "SELECT id FROM nixty.users WHERE email = $1",
      [email]
    );
    if (existingUsers.length > 0) {
      return {
        success: false,
        message: "User with this email already exists"
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO nixty.users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, account_type",
      [email, hashedPassword, name || null]
    );
    const newUser = result[0];
    return {
      success: true,
      message: "Registration successful",
      user: newUser
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "An error occurred during registration"
    };
  }
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
