import { e as createError, g as getHeaders, f as db } from './nitro.mjs';

async function validateUserSession(event) {
  try {
    const headers = getHeaders(event);
    const sessionUser = headers["x-user-session"];
    if (!sessionUser) {
      return null;
    }
    let user;
    try {
      user = JSON.parse(sessionUser);
    } catch (parseError) {
      console.error("Invalid session data format:", parseError);
      return null;
    }
    if (!user || !user.id || !user.email) {
      return null;
    }
    const [rows] = await db.query(
      "SELECT id, email, name, account_type, phone FROM nixty.users WHERE id = ?",
      [user.id]
    );
    if (rows.length === 0) {
      return null;
    }
    const dbUser = rows[0];
    if (dbUser.email !== user.email) {
      return null;
    }
    return dbUser;
  } catch (error) {
    console.error("Error validating user session:", error);
    return null;
  }
}
async function requireAuth(event) {
  const user = await validateUserSession(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required"
    });
  }
  return user;
}
async function requireAdmin(event) {
  const user = await requireAuth(event);
  if (user.account_type !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required"
    });
  }
  return user;
}

export { requireAdmin as a, requireAuth as r };
//# sourceMappingURL=auth.mjs.map
