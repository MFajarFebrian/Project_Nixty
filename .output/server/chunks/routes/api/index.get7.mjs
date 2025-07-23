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
      q: searchQuery,
      type = "all",
      // 'products', 'deals', 'news', or 'all'
      limit = 3
    } = query;
    console.log("\u{1F50D} Search API called with:", { searchQuery, type, limit });
    if (!searchQuery || searchQuery.length < 2) {
      console.log("\u274C Search query too short:", searchQuery);
      return {
        success: false,
        message: "Search query must be at least 2 characters long",
        data: []
      };
    }
    const results = [];
    const searchTerms = searchQuery.toLowerCase().split(" ").filter((term) => term.length > 0);
    const createSearchConditions = (fields) => {
      return searchTerms.map(
        (term) => `(${fields.map((field) => `LOWER(${field}) LIKE ?`).join(" OR ")})`
      ).join(" AND ");
    };
    const createSearchParams = (fieldsCount) => {
      return searchTerms.flatMap(
        (term) => Array(fieldsCount).fill(`%${term}%`)
      );
    };
    if (type === "all" || type === "Product") {
      console.log("\u{1F50D} Searching products...");
      const productFields = ["p.name", "p.version", "p.description", "p.short_description"];
      const productConditions = createSearchConditions(productFields);
      const productParams = createSearchParams(productFields.length);
      const productSql = `
        SELECT
          p.id,
          p.name,
          p.version,
          p.description,
          p.short_description,
          p.price,
          p.currency,
          c.name as category_name,
          'Product' as result_type
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active' AND ${productConditions}
        ORDER BY p.is_featured DESC, p.created_at DESC
        LIMIT ?
      `;
      console.log("\u{1F4DD} Product SQL:", productSql);
      console.log("\u{1F4DD} Product Params:", [...productParams, parseInt(limit)]);
      const [productRows] = await db.execute(productSql, [...productParams, parseInt(limit)]);
      console.log("\u{1F4CA} Product search results:", productRows.length, "rows found");
      productRows.forEach((row) => {
        results.push({
          id: row.id,
          name: row.name + (row.version ? ` ${row.version}` : ""),
          type: "Product",
          category: row.category_name,
          price: row.price ? `${row.currency}${Math.floor(row.price).toLocaleString("id-ID")}` : null,
          description: row.short_description || row.description
        });
      });
    }
    if (type === "all" || type === "Deal") {
      const dealFields = ["d.title", "d.description", "p.name"];
      const dealConditions = createSearchConditions(dealFields);
      const dealParams = createSearchParams(dealFields.length);
      const dealSql = `
        SELECT 
          d.id,
          d.title,
          d.description,
          d.new_price,
          d.old_price,
          d.discount_percentage,
          p.name as product_name,
          'Deal' as result_type
        FROM deals d
        LEFT JOIN products p ON d.product_id = p.id
        WHERE d.status = 'active' 
          AND (d.expires_at IS NULL OR d.expires_at > NOW())
          AND (${dealConditions})
        ORDER BY d.is_featured DESC, d.created_at DESC
        LIMIT ?
      `;
      const [dealRows] = await db.execute(dealSql, [...dealParams, parseInt(limit)]);
      dealRows.forEach((row) => {
        results.push({
          id: row.id,
          name: row.title,
          title: row.title,
          type: "Deal",
          price: row.new_price ? `Rp${Math.floor(row.new_price).toLocaleString("id-ID")}` : null,
          oldPrice: row.old_price ? `Rp${Math.floor(row.old_price).toLocaleString("id-ID")}` : null,
          discount: row.discount_percentage ? `${row.discount_percentage}% OFF` : null,
          description: row.description,
          productName: row.product_name
        });
      });
    }
    if (type === "all" || type === "News") {
      const newsFields = ["a.title", "a.content"];
      const newsConditions = createSearchConditions(newsFields);
      const newsParams = createSearchParams(newsFields.length);
      const newsSql = `
        SELECT 
          a.id,
          a.title,
          a.content,
          a.created_at,
          a.is_new,
          'News' as result_type
        FROM announcements a
        WHERE a.status = 'active' AND (${newsConditions})
        ORDER BY a.created_at DESC
        LIMIT ?
      `;
      const [newsRows] = await db.execute(newsSql, [...newsParams, parseInt(limit)]);
      newsRows.forEach((row) => {
        results.push({
          id: row.id,
          name: row.title,
          title: row.title,
          type: "News",
          content: row.content,
          date: new Date(row.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }),
          isNew: Boolean(row.is_new)
        });
      });
    }
    const limitedResults = results.slice(0, parseInt(limit));
    console.log("\u2705 Search completed:", {
      totalResults: results.length,
      limitedResults: limitedResults.length,
      query: searchQuery,
      type
    });
    return {
      success: true,
      data: limitedResults,
      total: limitedResults.length,
      query: searchQuery,
      type
    };
  } catch (error) {
    console.error("Error in search API:", error);
    return {
      success: false,
      message: "An error occurred while searching",
      data: [],
      error: error.message
    };
  }
});

export { index_get as default };
//# sourceMappingURL=index.get7.mjs.map
