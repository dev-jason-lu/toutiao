import axios from 'axios';

interface SendData {
  [key: string]: any;
}

interface TokenData {
  app_id: string;
  app_secret: string;
}

const APP_ID = 'cli_a632c6e05238900b'
const APP_SECRET = 'VLjU4IYR8iMN7N8iiNvO5g6UhHNd2jCM'

/**
 * 获取访问令牌。
 *
 * @param appId - 应用的 ID。
 * @param appSecret - 应用的密钥。
 * @returns {Promise<string>} - 返回一个 Promise，解析为访问令牌。
 */
async function getToken(): Promise<string> {
  const tokenUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'; // 替换为实际的 URL
  const headers = {
    'Content-Type': 'application/json',
  };

  const requestData: TokenData = {
    app_id: APP_ID,
    app_secret: APP_SECRET,
  };

  try {
    const response = await axios.post(tokenUrl, requestData, { headers });
    return response.data.tenant_access_token;
  } catch (error) {
    throw new Error('Failed to fetch token');
  }
}

/**
 * 发送富文本消息的实用工具方法。
 *
 * @param data - 要发送的数据对象。
 * @param token - 用于授权的令牌。
 * @returns {Promise<boolean>} - 返回一个布尔值，指示请求是否成功。
 */
export async function simpleSendGroup(data: SendData): Promise<boolean> {
  const url = 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id';
  let token= '';
  try {
    token = await getToken();
  } catch (error) {
    console.error("Error fetching token:", error);
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data.code === 0;
  } catch (error) {
    console.log(error)
    return false;
  }
}


(async () => {
  try {
    const token = await getToken();
    console.log("Token:", token);
  } catch (error) {
    console.error("Error fetching token:", error);
  }
})();