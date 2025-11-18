import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 数据库连接配置接口
 * 定义了PostgreSQL数据库连接所需的参数
 */
interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  max?: number;        // 连接池最大连接数
  idleTimeoutMillis?: number;  // 空闲连接超时时间
  connectionTimeoutMillis?: number;  // 连接超时时间
}

/**
 * 获取数据库配置
 * 从环境变量中读取数据库连接参数，提供默认值
 * @returns {DbConfig} 数据库配置对象
 * @throws {Error} 当必需的环境变量缺失时抛出错误
 */
function getDbConfig(): DbConfig {
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  
  // 检查必需的环境变量
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`缺失必需的环境变量: ${envVar}`);
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME || 'toutiao_db',
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
  };
}

/**
 * 创建数据库连接池
 * 使用连接池管理数据库连接，提高性能和可靠性
 * @returns {Pool} PostgreSQL连接池实例
 */
function createPool(): Pool {
  try {
    const config = getDbConfig();
    
    const pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis
    });

    // 监听连接池事件
    pool.on('connect', (client: any) => {
      console.log('数据库连接已建立:', client.processID);
    });

    pool.on('error', (err: any) => {
      console.error('数据库连接池错误:', err);
    });

    pool.on('remove', (client: any) => {
      console.log('数据库连接已移除:', client.processID);
    });

    console.log('数据库连接池创建成功');
    return pool;
  } catch (error) {
    console.error('创建数据库连接池失败:', error);
    throw error;
  }
}

/**
 * 测试数据库连接
 * 验证数据库连接是否正常工作
 * @returns {Promise<boolean>} 连接是否成功
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log('数据库连接测试成功，当前时间:', result.rows[0].current_time);
    client.release();
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return false;
  }
}

/**
 * 关闭数据库连接池
 * 在应用关闭时优雅地关闭所有数据库连接
 * @returns {Promise<void>}
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('数据库连接池已关闭');
  } catch (error) {
    console.error('关闭数据库连接池失败:', error);
    throw error;
  }
}

// 创建全局连接池实例
const pool = createPool();

// 导出连接池和相关函数
export default pool;