import { c as defineEventHandler, h as getQuery, f as db } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const {
      limit = 10,
      offset = 0,
      status = "active"
    } = query;
    const [rows] = await db.query(`
      SELECT *
      FROM nixty.announcements
      WHERE status = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [status, parseInt(limit), parseInt(offset)]);
    const announcements = rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      date: new Date(row.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      isNew: Boolean(row.is_new),
      image: row.image_url,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    return {
      success: true,
      data: announcements,
      total: announcements.length
    };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return {
      success: false,
      message: "An error occurred while fetching announcements",
      data: []
    };
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
