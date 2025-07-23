import { c as defineEventHandler, i as adminAuth, h as getQuery, f as db } from '../../../_/nitro.mjs';
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

const productNamesVersions = defineEventHandler(async (event) => {
  await adminAuth(event);
  try {
    const query = getQuery(event);
    const type = query.type || "all";
    const productName = query.product_name || "";
    console.log(`Fetching product ${type} ${productName ? "for " + productName : ""}`);
    let sql = "";
    let params = [];
    if (type === "names") {
      sql = `SELECT DISTINCT name FROM products ORDER BY name ASC`;
    } else if (type === "versions" && productName) {
      sql = `SELECT DISTINCT version FROM products WHERE name = ? ORDER BY version ASC`;
      params = [productName];
    } else {
      sql = `SELECT id, name, version FROM products ORDER BY id ASC`;
    }
    const [results] = await db.execute(sql, params);
    let data = [];
    if (results && results.length > 0) {
      if (type === "names") {
        data = results.map((r) => r.name).filter(Boolean);
      } else if (type === "versions") {
        data = results.map((r) => r.version).filter(Boolean);
      } else {
        data = results.map((p) => ({
          id: p.id,
          name: p.name || "",
          version: p.version || ""
        }));
      }
    }
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch product list",
      message: error.message
    };
  }
});

export { productNamesVersions as default };
//# sourceMappingURL=product-names-versions.mjs.map
