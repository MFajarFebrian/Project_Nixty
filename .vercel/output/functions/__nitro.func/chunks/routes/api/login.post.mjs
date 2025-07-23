import { d as defineEventHandler, r as readBody } from '../../_/nitro.mjs';
import { p as pool } from '../../_/db.mjs';
import bcrypt from 'bcryptjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';

const login_post = defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event);
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required"
      };
    }
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const users = rows;
    if (users.length === 0) {
      return {
        success: false,
        message: "User not found"
      };
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid password"
      };
    }
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      message: "Login successful",
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An error occurred during login"
    };
  }
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
