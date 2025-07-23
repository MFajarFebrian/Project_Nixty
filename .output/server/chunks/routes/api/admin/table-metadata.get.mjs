import { c as defineEventHandler, h as getQuery, e as createError, f as db } from '../../../_/nitro.mjs';
import { a as requireAdmin } from '../../../_/auth.mjs';
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

const tableMetadata_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  try {
    await requireAdmin(event);
    const query = getQuery(event);
    const tableName = query.table;
    if (!tableName) {
      throw createError({
        statusCode: 400,
        statusMessage: "Table name is required"
      });
    }
    const [columns] = await db.execute(`
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_DEFAULT as \`default\`,
        EXTRA as extra,
        COLUMN_TYPE as full_type,
        ORDINAL_POSITION as position,
        COLUMN_COMMENT as comment,
        CHARACTER_MAXIMUM_LENGTH as max_length
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION ASC
    `, [process.env.DB_NAME || "nixty", tableName]);
    const processedColumns = columns.map((column) => ({
      name: column.name,
      type: column.full_type || column.type,
      nullable: column.nullable === "YES",
      default: column.default,
      extra: column.extra || "",
      position: column.position,
      comment: column.comment || "",
      maxLength: column.max_length,
      // Add display metadata
      displayName: formatColumnName(column.name),
      isHidden: shouldHideColumn(column.name),
      isReadonly: isReadonlyColumn(column.name),
      inputType: getInputType(column),
      validation: getValidationRules(column)
    }));
    const visibleColumns = processedColumns.filter((col) => !col.isHidden);
    const [tableInfo] = await db.execute(`
      SELECT 
        TABLE_COMMENT as comment,
        ENGINE as engine,
        TABLE_ROWS as row_count,
        CREATE_TIME as created_at
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `, [process.env.DB_NAME || "nixty", tableName]);
    console.log(`Table metadata fetched for ${tableName}: ${visibleColumns.length} visible columns`);
    return {
      success: true,
      table: {
        name: tableName,
        displayName: getTableDisplayName(tableName),
        comment: ((_a = tableInfo[0]) == null ? void 0 : _a.comment) || "",
        engine: ((_b = tableInfo[0]) == null ? void 0 : _b.engine) || "",
        rowCount: ((_c = tableInfo[0]) == null ? void 0 : _c.row_count) || 0,
        createdAt: ((_d = tableInfo[0]) == null ? void 0 : _d.created_at) || null
      },
      columns: processedColumns,
      visibleColumns,
      totalColumns: processedColumns.length
    };
  } catch (error) {
    console.error("Error fetching table metadata:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch table metadata"
    });
  }
});
function formatColumnName(name) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
function shouldHideColumn(columnName) {
  const hiddenColumns = [
    "created_at",
    "updated_at"
    // Hide system timestamps in edit forms
  ];
  return hiddenColumns.includes(columnName);
}
function isReadonlyColumn(columnName) {
  const readonlyColumns = [
    "id",
    "created_at",
    "updated_at"
  ];
  return readonlyColumns.includes(columnName);
}
function getInputType(column) {
  const { name, type } = column;
  if (name === "email") return "email";
  if (name === "password") return "password";
  if (name.includes("url") || name.includes("link")) return "url";
  if (type.includes("int") || type.includes("decimal") || type.includes("float")) {
    return "number";
  }
  if (type.includes("date") || type.includes("timestamp")) {
    return "datetime-local";
  }
  if (type.includes("tinyint(1)") || name.startsWith("is_")) {
    return "checkbox";
  }
  if (type.includes("text") || ["description", "content", "notes"].includes(name)) {
    return "textarea";
  }
  if (type.includes("enum") || ["status", "account_type", "license_type", "payment_method"].includes(name) || name.endsWith("_id")) {
    return "select";
  }
  if (name.includes("image") || name.includes("picture") || name.includes("photo")) {
    return "file";
  }
  return "text";
}
function getValidationRules(column) {
  const rules = {};
  if (column.nullable === false && !column.default && !column.extra.includes("auto_increment")) {
    rules.required = true;
  }
  if (column.maxLength) {
    rules.maxLength = column.maxLength;
  }
  if (column.type.includes("int")) {
    rules.type = "integer";
  } else if (column.type.includes("decimal") || column.type.includes("float")) {
    rules.type = "number";
  } else if (column.name === "email") {
    rules.type = "email";
  }
  return rules;
}
function getTableDisplayName(tableName) {
  const displayNames = {
    "users": "Users",
    "products": "Products",
    "categories": "Categories",
    "transactions": "Transactions",
    "product_licenses": "Product Licenses",
    "announcements": "Announcements",
    "deals": "Deals",
    "hero_slides": "Hero Slides"
  };
  return displayNames[tableName] || tableName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export { tableMetadata_get as default };
//# sourceMappingURL=table-metadata.get.mjs.map
