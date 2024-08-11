import { Pool } from 'pg'; // 假设使用 PostgreSQL

// 创建数据库连接池
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'bytedance',
  password: '',
  database: 'bytedance',
});

// 导出连接池
export default pool;