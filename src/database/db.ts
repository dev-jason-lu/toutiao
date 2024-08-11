import { Pool } from 'pg'; // 假设使用 PostgreSQL

// 创建数据库连接池
const pool = new Pool({
  host: 'pgm-bp130a937fs8bn2wqo.pg.rds.aliyuncs.com',
  port: 5432,
  user: 'bytedance',
  password: 'xianjian1998#',
  database: 'bytedance',
});

// 导出连接池
export default pool;