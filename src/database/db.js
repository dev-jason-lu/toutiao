"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg"); // 假设使用 PostgreSQL
// 创建数据库连接池
const pool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    user: 'bytedance',
    password: '',
    database: 'bytedance',
});
// 导出连接池
exports.default = pool;
