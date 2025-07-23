import { c as defineEventHandler, l as getRouterParam, e as createError, k as useSupabase, f as db, h as getQuery } from '../../../../_/nitro.mjs';
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

const _table__get = defineEventHandler(async (event) => {
  try {
    const tableName = getRouterParam(event, "table");
    console.log(`Fetching data from table: ${tableName}`);
    if (!tableName) {
      throw createError({
        statusCode: 400,
        statusMessage: "Table name is required"
      });
    }
    const allowedTables = [
      "users",
      "products",
      "categories",
      "transactions",
      "product_license_base",
      "product_license_keys",
      "product_license_accounts",
      "product_tags",
      "transaction_license",
      "payment_gateway_logs"
    ];
    if (!allowedTables.includes(tableName)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Access to table '${tableName}' is not allowed`
      });
    }
    const schemaPrefix = useSupabase ? "nixty." : "";
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM ${schemaPrefix}${tableName}`);
    const total = useSupabase ? parseInt(countResult[0].total) : countResult[0].total;
    console.log(`Total records found: ${total}`);
    let joinClauses = [];
    let joinFields = [];
    let groupByFields = [];
    if (tableName === "products") {
      joinClauses.push(`LEFT JOIN ${schemaPrefix}categories c ON t.category_id = c.id`);
      joinClauses.push(`LEFT JOIN (SELECT product_id, COUNT(*) as total_licenses, COUNT(CASE WHEN status = 'available' THEN 1 END) as available_stock FROM ${schemaPrefix}product_license_base GROUP BY product_id) plb ON t.id = plb.product_id`);
      joinFields.push("c.name AS categoryName");
      joinFields.push("COALESCE(plb.available_stock, 0) as stock");
      joinFields.push("COALESCE(plb.total_licenses, 0) as total_licenses");
    } else if (tableName === "product_licenses") {
      joinClauses.push(`LEFT JOIN ${schemaPrefix}products p ON t.product_id = p.id`);
      joinFields.push("p.name AS product_name");
      joinFields.push("p.version AS product_version");
    } else if (tableName === "transactions") {
      joinClauses.push(`LEFT JOIN ${schemaPrefix}products p ON t.product_id = p.id`);
      joinFields.push("p.name AS product_name");
      joinFields.push("p.version AS product_version");
    }
    const page = parseInt(getQuery(event).page) || 1;
    const pageSize = parseInt(getQuery(event).pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const search = getQuery(event).search || "";
    const orderBy = getQuery(event).orderBy || "id";
    const orderDir = getQuery(event).orderDir || "desc";
    let columns;
    if (useSupabase) {
      [columns] = await db.query(`
        SELECT column_name as "Field", data_type as "Type", 
               is_nullable as "Null", column_default as "Default",
               '' as "Key", '' as "Extra"
        FROM information_schema.columns 
        WHERE table_name = ? AND table_schema = 'nixty'
        ORDER BY ordinal_position
      `, [tableName]);
    }
    const searchableColumns = columns.map((col) => col.Field);
    console.log("Searchable columns:", searchableColumns);
    let searchConditions = "WHERE 1=1";
    const searchParams = [];
    if (search) {
      const searchTerms = search.split(" ").filter((term) => term);
      if (searchTerms.length > 0) {
        const searchQueries = [];
        searchTerms.forEach((term) => {
          const columnConditions = searchableColumns.map((col) => `${col} LIKE ?`);
          searchQueries.push(`(${columnConditions.join(" OR ")})`);
          searchableColumns.forEach(() => {
            searchParams.push(`%${term}%`);
          });
        });
        searchConditions += ` AND (${searchQueries.join(" AND ")})`;
      }
    } else {
      searchConditions = "WHERE 1=1";
    }
    const filterParams = getQuery(event).filters ? JSON.parse(getQuery(event).filters) : {};
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value !== void 0 && value !== "") {
        searchConditions += ` AND t.${key} = ?`;
        searchParams.push(value);
      }
    });
    const selectedFields = ["t.*", ...joinFields];
    let query = `SELECT ${selectedFields.join(", ")} FROM ${schemaPrefix}${tableName} t ${joinClauses.join(" ")} ${searchConditions}`;
    if (groupByFields.length > 0) {
      const mainTableColumns = columns.map((col) => `t.${col.Field}`).join(", ");
      query += ` GROUP BY ${mainTableColumns}, ${groupByFields.join(", ")}`;
    }
    query += ` ORDER BY ${orderBy} ${orderDir} LIMIT ${pageSize} OFFSET ${offset}`;
    console.log("SQL Query:", query);
    console.log("SQL Params:", searchParams);
    const [records] = await db.query(query, searchParams);
    console.log(`Retrieved ${records.length} records`);
    const columnInfo = columns.map((col) => ({
      name: col.Field,
      type: col.Type,
      nullable: col.Null === "YES",
      key: col.Key,
      default: col.Default,
      extra: col.Extra
    }));
    let categories = [];
    if (tableName === "products") {
      const [categoryRows] = await db.query(`SELECT id, name, slug FROM ${schemaPrefix}categories ORDER BY name ASC`);
      categories = categoryRows;
    }
    console.log("Column info:", JSON.stringify(columnInfo));
    console.log("First record sample:", records.length > 0 ? JSON.stringify(records[0]) : "No records");
    const response = {
      success: true,
      data: records,
      meta: {
        total,
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        columns: columnInfo,
        relations: {
          categories
        }
      }
    };
    console.log("Response structure:", JSON.stringify({
      success: response.success,
      dataLength: response.data.length,
      meta: {
        total: response.meta.total,
        page: response.meta.page,
        pageSize: response.meta.pageSize,
        pageCount: response.meta.pageCount,
        columnsCount: response.meta.columns.length
      }
    }));
    return response;
  } catch (error) {
    console.error("Error fetching table data:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch table data"
    });
  }
});

export { _table__get as default };
//# sourceMappingURL=_table_.get.mjs.map
