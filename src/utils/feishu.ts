import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量配置
dotenv.config();

interface SendData {
  [key: string]: any;
}

interface TokenData {
  app_id: string;
  app_secret: string;
}

/**
 * 获取飞书应用配置
 * @returns {{appId: string, appSecret: string}} 飞书应用配置
 * @throws 当环境变量未配置时抛出错误
 */
function getFeishuConfig(): { appId: string; appSecret: string } {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  
  if (!appId || !appSecret) {
    throw new Error('FEISHU_APP_ID 或 FEISHU_APP_SECRET 环境变量未配置，请在 .env 文件中设置');
  }
  
  return { appId, appSecret };
}

/**
 * 获取飞书访问令牌
 * 
 * 通过飞书开放平台API获取租户访问令牌，用于后续API调用认证。
 * 使用应用ID和应用密钥进行身份验证。
 * 
 * @returns {Promise<string>} 返回访问令牌字符串
 * @throws 当获取令牌失败时抛出错误
 */
async function getToken(): Promise<string> {
  const tokenUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
  const headers = {
    'Content-Type': 'application/json',
  };

  // 从环境变量获取应用配置
  const { appId, appSecret } = getFeishuConfig();

  const requestData: TokenData = {
    app_id: appId,
    app_secret: appSecret,
  };

  try {
    const response = await axios.post(tokenUrl, requestData, { headers });
    
    // 验证响应数据
    if (!response.data || !response.data.tenant_access_token) {
      throw new Error('获取令牌失败：响应中未包含访问令牌');
    }
    
    return response.data.tenant_access_token;
  } catch (error) {
    // 增强错误处理，提供更详细的错误信息
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.msg || error.message;
      throw new Error(`获取飞书访问令牌失败: ${errorMsg}`);
    }
    throw new Error(`获取飞书访问令牌失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 发送群组消息
 * 
 * 向飞书群组发送富文本消息，支持各种消息类型。
 * 自动获取访问令牌并发送消息到指定群组。
 * 
 * @param data - 要发送的消息数据对象
 * @returns {Promise<boolean>} 返回发送是否成功的布尔值
 * @throws 当获取令牌失败或发送消息失败时返回false
 */
export async function simpleSendGroup(data: SendData): Promise<boolean> {
  const url = 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id';
  let token = '';
  
  try {
    token = await getToken();
  } catch (error) {
    console.error("获取访问令牌失败:", error);
    return false; // 获取令牌失败，直接返回false
  }
  
  // 验证令牌是否有效
  if (!token) {
    console.error("访问令牌为空，无法发送消息");
    return false;
  }
  
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(url, data, { headers });
    
    // 验证响应数据
    if (!response.data) {
      console.error("发送消息失败：响应数据为空");
      return false;
    }
    
    // 飞书API返回code为0表示成功
    const isSuccess = response.data.code === 0;
    
    if (!isSuccess) {
      console.error(`发送消息失败：${response.data.msg || '未知错误'}`);
    }
    
    return isSuccess;
  } catch (error) {
    // 增强错误处理，提供更详细的错误信息
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.msg || error.message;
      console.error(`发送飞书消息失败: ${errorMsg}`);
    } else {
      console.error(`发送飞书消息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    return false;
  }
}


/**
 * 测试飞书API连接
 * 
 * 用于验证飞书应用配置是否正确，获取访问令牌是否成功。
 * 这是一个测试函数，可以在需要时调用以验证配置。
 */
async function testFeishuConnection(): Promise<void> {
  try {
    console.log("正在测试飞书API连接...");
    const token = await getToken();
    console.log("✅ 飞书API连接成功，获取到访问令牌");
    console.log("Token预览:", token.substring(0, 20) + "...");
  } catch (error) {
    console.error("❌ 飞书API连接失败:", error instanceof Error ? error.message : error);
    console.error("请检查以下配置:");
    console.error("1. .env文件中是否正确配置了 FEISHU_APP_ID");
    console.error("2. .env文件中是否正确配置了 FEISHU_APP_SECRET");
    console.error("3. 飞书应用是否有正确的权限");
    console.error("4. 网络连接是否正常");
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testFeishuConnection();
}