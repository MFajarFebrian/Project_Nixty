import { a as useRuntimeConfig } from './nitro.mjs';
import mysql from 'mysql2/promise';

var _a, _b, _c, _d, _e;
const config = useRuntimeConfig();
const pool = mysql.createPool({
  host: ((_a = config.mysql) == null ? void 0 : _a.host) || process.env.MYSQL_HOST || "localhost",
  user: ((_b = config.mysql) == null ? void 0 : _b.user) || process.env.MYSQL_USER || "root",
  password: ((_c = config.mysql) == null ? void 0 : _c.password) || process.env.MYSQL_PASSWORD || "",
  database: ((_d = config.mysql) == null ? void 0 : _d.database) || process.env.MYSQL_DATABASE || "nixty",
  port: parseInt(((_e = config.mysql) == null ? void 0 : _e.port) || process.env.MYSQL_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { pool as p };
//# sourceMappingURL=db.mjs.map
