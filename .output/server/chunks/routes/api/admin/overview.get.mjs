import { e as createError, j as setHeaders, g as getHeaders, c as defineEventHandler, h as getQuery, f as db } from '../../../_/nitro.mjs';
import { u as useCache } from '../../../_/cache.mjs';
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

class RateLimiter {
  constructor(maxRequests = 100, windowMs = 6e4) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = /* @__PURE__ */ new Map();
    this.cleanup();
  }
  /**
   * Check if request is allowed
   * @param {string} ip - Client IP address
   * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
   */
  check(ip) {
    const now = Date.now();
    const key = ip;
    if (!this.requests.has(key)) {
      this.requests.set(key, { count: 0, resetTime: now + this.windowMs });
    }
    const requestData = this.requests.get(key);
    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + this.windowMs;
    }
    if (requestData.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: requestData.resetTime
      };
    }
    requestData.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - requestData.count,
      resetTime: requestData.resetTime
    };
  }
  /**
   * Clean up expired entries
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.requests) {
        if (now > data.resetTime) {
          this.requests.delete(key);
        }
      }
    }, this.windowMs);
  }
  /**
   * Get current stats
   * @returns {object} - Rate limiter statistics
   */
  getStats() {
    return {
      totalTrackedIPs: this.requests.size,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs
    };
  }
}
const apiLimiter = new RateLimiter(60, 6e4);
const adminLimiter = new RateLimiter(30, 6e4);
function rateLimiter(type = "api") {
  const limiter = type === "admin" ? adminLimiter : apiLimiter;
  return (event) => {
    const ip = getClientIP(event);
    const result = limiter.check(ip);
    if (!result.allowed) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      throw createError({
        statusCode: 429,
        statusMessage: "Too Many Requests - Rate limit exceeded",
        data: {
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1e3)
        }
      });
    }
    setHeaders(event, {
      "X-RateLimit-Limit": limiter.maxRequests.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": new Date(result.resetTime).toISOString()
    });
    return result;
  };
}
function getClientIP(event) {
  var _a, _b, _c, _d, _e, _f, _g;
  const headers = getHeaders(event);
  return ((_a = headers["x-forwarded-for"]) == null ? void 0 : _a.split(",")[0]) || headers["x-real-ip"] || headers["x-client-ip"] || ((_d = (_c = (_b = event.node) == null ? void 0 : _b.req) == null ? void 0 : _c.connection) == null ? void 0 : _d.remoteAddress) || ((_g = (_f = (_e = event.node) == null ? void 0 : _e.req) == null ? void 0 : _f.socket) == null ? void 0 : _g.remoteAddress) || "unknown";
}

const overview_get = defineEventHandler(async (event) => {
  try {
    rateLimiter("admin")(event);
    const query = getQuery(event);
    const { startDate, endDate, period } = query;
    console.log("Admin overview API called with filters:", { startDate, endDate, period });
    try {
      const [testResult] = await db.query("SELECT 1 as test");
      console.log("Database connection test successful:", testResult);
    } catch (error) {
      console.error("Database connection test failed:", error);
      throw createError({
        statusCode: 500,
        statusMessage: `Database connection failed: ${error.message}`
      });
    }
    const stats = {};
    const chartData = {};
    let existingTables = [];
    try {
      const [tableResult] = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'nixty'");
      existingTables = tableResult.map((row) => row.table_name);
      console.log("Existing tables:", existingTables);
    } catch (error) {
      console.error("Error getting table list:", error);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to get table list: ${error.message}`
      });
    }
    const tables = existingTables.filter((table) => {
      return !table.startsWith("_") && !table.includes("pg_");
    });
    console.log("Tables to query:", tables);
    await Promise.all(tables.map(async (table) => {
      try {
        const count = await useCache(`count_${table}`, async () => {
          const [result] = await db.query(`SELECT COUNT(*) as count FROM nixty.${table}`);
          return result[0].count;
        });
        stats[table] = count;
        console.log(`${table}: ${stats[table]} records (cached)`);
      } catch (error) {
        console.error(`Error counting ${table}:`, error);
        stats[table] = 0;
      }
    }));
    const dateClauses = [];
    const dateParams = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateClauses.push(`created_at >= ?`);
      dateParams.push(start);
      dateClauses.push(`created_at <= ?`);
      dateParams.push(end);
    }
    const buildQuery = (baseQuery, conditions = [], params = []) => {
      let whereClause = "";
      const allConditions = [...conditions, ...dateClauses];
      if (allConditions.length > 0) {
        whereClause = ` WHERE ${allConditions.join(" AND ")}`;
      }
      return {
        sql: `${baseQuery}${whereClause}`,
        params: [...params, ...dateParams]
      };
    };
    if (tables.includes("transactions")) {
      try {
        const { groupBy } = getQuery(event);
        let dateGroupFormat;
        switch (groupBy) {
          case "daily":
            dateGroupFormat = "%Y-%m-%d";
            break;
          case "weekly":
            dateGroupFormat = "%x-%v";
            break;
          case "monthly":
          default:
            dateGroupFormat = "%Y-%m";
            break;
        }
        const chartQueryBase = `
          SELECT
            TO_CHAR(created_at, ?) AS period,
            SUM(amount) AS total
          FROM transactions`;
        let pgDateFormat;
        switch (groupBy) {
          case "daily":
            pgDateFormat = "YYYY-MM-DD";
            break;
          case "weekly":
            pgDateFormat = "IYYY-IW";
            break;
          case "monthly":
          default:
            pgDateFormat = "YYYY-MM";
            break;
        }
        const chartConditions = [`(status = 'settlement' OR status = 'completed')`];
        const chartQuery = buildQuery(chartQueryBase, chartConditions, [pgDateFormat]);
        chartQuery.sql += ` GROUP BY period`;
        console.log("Executing chart query:", chartQuery.sql, "with params:", chartQuery.params);
        const [chartResult] = await db.query(chartQuery.sql, chartQuery.params);
        chartData.labels = chartResult.map((row) => row.period);
        chartData.values = chartResult.map((row) => parseFloat(row.total));
        console.log(`Generated chart data with ${chartResult.length} results grouped by '${groupBy || "monthly"}'`);
      } catch (error) {
        console.error("Error generating chart data:", error);
        chartData.labels = [];
        chartData.values = [];
      }
    }
    try {
      if (tables.includes("transactions")) {
        try {
          const txCountQuery = buildQuery("SELECT COUNT(*) as count FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [totalTransactions] = await db.query(txCountQuery.sql, txCountQuery.params);
          stats.transactions = totalTransactions[0].count;
          stats.totalOrders = stats.transactions;
          const revenueQuery = buildQuery("SELECT COALESCE(SUM(amount), 0) as total FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [revenue] = await db.query(revenueQuery.sql, revenueQuery.params);
          stats.totalRevenue = parseFloat(revenue[0].total);
          try {
            const activeUsersQuery = buildQuery(
              "SELECT COUNT(DISTINCT user_id) as count FROM nixty.transactions",
              [
                "(status = 'settlement' OR status = 'completed')",
                "user_id IS NOT NULL"
              ]
            );
            const [activeUsers] = await db.query(activeUsersQuery.sql, activeUsersQuery.params);
            stats.activeUsers = activeUsers[0].count;
          } catch (error) {
            console.error("Error getting active users stats:", error);
            stats.activeUsers = 0;
          }
          try {
            const productsSoldQuery = buildQuery(
              "SELECT COALESCE(SUM(quantity), 0) as total FROM nixty.transactions",
              ["(status = 'settlement' OR status = 'completed')"]
            );
            const [productsSold] = await db.query(productsSoldQuery.sql, productsSoldQuery.params);
            stats.productsSold = parseInt(productsSold[0].total, 10);
          } catch (error) {
            console.error("Error getting products sold stats:", error);
            stats.productsSold = 0;
          }
        } catch (error) {
          console.error("Error getting transaction stats:", error);
          stats.transactions = 0;
          stats.totalRevenue = 0;
        }
      }
      if (tables.includes("products")) {
        try {
          const [activeProducts] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.products WHERE status = $1",
            ["active"]
          );
          stats.activeProducts = activeProducts[0].count;
          const [featuredProducts] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.products WHERE is_featured = $1",
            [true]
          );
          stats.featuredProducts = featuredProducts[0].count;
        } catch (error) {
          console.error("Error getting product stats:", error);
          stats.activeProducts = 0;
          stats.featuredProducts = 0;
        }
      }
      if (tables.includes("users")) {
        try {
          const [adminUsers] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.users WHERE account_type = $1",
            ["admin"]
          );
          stats.adminUsers = adminUsers[0].count;
        } catch (error) {
          console.error("Error getting user stats:", error);
          stats.adminUsers = 0;
        }
      }
      if (tables.includes("announcements")) {
        try {
          const [activeAnnouncements] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.announcements WHERE status = $1",
            ["active"]
          );
          stats.activeAnnouncements = activeAnnouncements[0].count;
        } catch (error) {
          console.error("Error getting announcement stats:", error);
          stats.activeAnnouncements = 0;
        }
      }
      if (tables.includes("product_license_base")) {
        try {
          const [availableLicenses] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.product_license_base WHERE status = $1",
            ["available"]
          );
          stats.availableLicenses = availableLicenses[0].count;
          const [usedLicenses] = await db.query(
            "SELECT COUNT(*) as count FROM nixty.product_license_base WHERE status = $1",
            ["used"]
          );
          stats.usedLicenses = usedLicenses[0].count;
        } catch (error) {
          console.error("Error getting license stats:", error);
          stats.availableLicenses = 0;
          stats.usedLicenses = 0;
        }
      }
    } catch (error) {
      console.error("Error getting additional stats:", error);
    }
    let percentChange = {};
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const periodMs = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - periodMs);
        const prevDateClauses = [];
        const prevDateParams = [];
        prevDateClauses.push(`created_at >= ?`);
        prevDateParams.push(prevStart);
        prevDateClauses.push(`created_at <= ?`);
        prevDateParams.push(prevEnd);
        const buildPrevQuery = (baseQuery, conditions = [], params = []) => {
          let whereClause = "";
          const allConditions = [...conditions, ...prevDateClauses];
          if (allConditions.length > 0) {
            whereClause = ` WHERE ${allConditions.join(" AND ")}`;
          }
          return {
            sql: `${baseQuery}${whereClause}`,
            params: [...params, ...prevDateParams]
          };
        };
        let prevOrders = 0;
        if (tables.includes("transactions")) {
          const prevOrdersQuery = buildPrevQuery("SELECT COUNT(*) as count FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [prevOrdersRes] = await db.query(prevOrdersQuery.sql, prevOrdersQuery.params);
          prevOrders = prevOrdersRes[0].count;
        }
        let prevActiveUsers = 0;
        if (tables.includes("transactions")) {
          const prevUsersQuery = buildPrevQuery("SELECT COUNT(DISTINCT user_id) as count FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')", "user_id IS NOT NULL"]);
          const [prevUsersRes] = await db.query(prevUsersQuery.sql, prevUsersQuery.params);
          prevActiveUsers = prevUsersRes[0].count;
        }
        let prevProductsSold = 0;
        if (tables.includes("transactions")) {
          const prevSoldQuery = buildPrevQuery("SELECT COALESCE(SUM(quantity),0) as total FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [prevSoldRes] = await db.query(prevSoldQuery.sql, prevSoldQuery.params);
          prevProductsSold = parseInt(prevSoldRes[0].total, 10);
        }
        let prevRevenue = 0;
        if (tables.includes("transactions")) {
          const prevRevenueQuery = buildPrevQuery("SELECT COALESCE(SUM(amount),0) as total FROM nixty.transactions", ["(status = 'settlement' OR status = 'completed')"]);
          const [prevRevRes] = await db.query(prevRevenueQuery.sql, prevRevenueQuery.params);
          prevRevenue = parseFloat(prevRevRes[0].total);
        }
        const calcPct = (current, prev) => {
          if (!prev || prev === 0) return null;
          return Number(((current - prev) / prev * 100).toFixed(1));
        };
        percentChange = {
          totalOrders: calcPct(stats.totalOrders || 0, prevOrders),
          activeUsers: calcPct(stats.activeUsers || 0, prevActiveUsers),
          productsSold: calcPct(stats.productsSold || 0, prevProductsSold),
          totalRevenue: calcPct(stats.totalRevenue || 0, prevRevenue)
        };
      } catch (err) {
        console.error("Failed to compute previous period stats:", err);
      }
    }
    let recentActivity = [];
    if (tables.includes("transactions")) {
      try {
        const recentActivityData = await useCache("recent_activity", async () => {
          const activityQuery = buildQuery("SELECT id, product_id, total, status, created_at FROM nixty.transactions");
          const finalActivityQuery = `${activityQuery.sql} ORDER BY created_at DESC LIMIT 10`;
          console.log("Executing recent activity query with date filter:", { sql: finalActivityQuery, params: activityQuery.params });
          const [activity] = await db.query(finalActivityQuery, activityQuery.params);
          console.log(`Found ${activity.length} recent transactions`);
          return activity;
        });
        recentActivity = recentActivityData;
      } catch (error) {
        console.error("Error getting recent activity:", error);
      }
    }
    const tableInfo = {};
    for (const table of tables) {
      try {
        const [columns] = await db.query(`
            SELECT column_name as "Field", data_type as "Type", 
                   is_nullable as "Null", column_default as "Default",
                   '' as "Key", '' as "Extra"
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = 'nixty'
            ORDER BY ordinal_position
          `, [table]);
        tableInfo[table] = {
          name: table,
          displayName: table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, " "),
          columnCount: columns.length,
          recordCount: stats[table] || 0,
          columns: columns.map((col) => ({
            name: col.Field,
            type: col.Type,
            nullable: col.Null === "YES",
            key: col.Key,
            default: col.Default,
            extra: col.Extra
          }))
        };
        console.log(`Table info for ${table}: ${columns.length} columns, ${stats[table]} records`);
      } catch (error) {
        console.error(`Error getting info for ${table}:`, error);
        tableInfo[table] = {
          name: table,
          displayName: table.charAt(0).toUpperCase() + table.slice(1).replace(/_/g, " "),
          columnCount: 0,
          recordCount: 0,
          columns: []
        };
      }
    }
    return {
      success: true,
      data: {
        statistics: stats,
        recentActivity,
        tables: tableInfo,
        chartData,
        percentChange
      }
    };
  } catch (error) {
    console.error("Error getting admin overview:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get admin overview: ${error.message}`
    });
  }
});

export { overview_get as default };
//# sourceMappingURL=overview.get.mjs.map
