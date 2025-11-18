import {simpleSendGroup} from "../utils/feishu";
import {createArticle} from "../database/models/article";
import {LIMIT_SEND_COUNT} from "../config";
import dotenv from 'dotenv';

// 加载环境变量配置
dotenv.config();

const colorList = ['blue', 'turquoise', 'lime', 'orange', 'violet', 'indigo', 'wathet', 'green', 'yellow', 'red', 'purple', 'carmine']

/**
 * 根据索引获取颜色
 * 
 * 从预定义颜色列表中获取指定索引的颜色，用于消息卡片的颜色主题。
 * 如果索引超出范围，会循环使用颜色。
 * 
 * @param index - 颜色索引
 * @returns {string} 返回颜色名称
 */
function getColorBySet(index: number): string {
    // 使用模运算确保索引在有效范围内
    return colorList[index % colorList.length];
}
/**
 * 消息卡片元素接口
 * 定义了飞书消息卡片中各个元素的属性
 */
interface MissionElement {
  tag: string;
  content?: string;
  text_align?: string;
  text_size?: string;
}

/**
 * 消息卡片接口
 * 定义了飞书交互式消息卡片的完整结构
 */
interface MissionMessage {
  config: {
    wide_screen_mode: boolean;
  };
  elements: MissionElement[];
  header: {
    template: string;
    title: {
      content: string;
      tag: string;
    };
  };
}

/**
 * 发送消息接口
 * 定义了发送飞书消息的请求结构
 */
interface SendMissionMessage {
  content: string;
  receive_id: string;
  msg_type: string;
}

/**
 * 获取飞书消息接收ID
 * 
 * 从环境变量获取飞书群组接收ID，用于发送消息。
 * 
 * @returns {string} 返回接收ID
 * @throws 当环境变量未配置时抛出错误
 */
function getFeishuReceiveId(): string {
  const receiveId = process.env.FEISHU_RECEIVE_ID;
  if (!receiveId) {
    throw new Error('FEISHU_RECEIVE_ID 环境变量未配置，请在 .env 文件中设置');
  }
  return receiveId;
}

/**
 * 格式化消息数据为飞书卡片格式
 * 
 * 将文章数据转换为飞书交互式消息卡片格式，包含标题、摘要、标签和操作按钮。
 * 
 * @param dataList - 文章数据列表
 * @returns {Promise<boolean>} 返回消息是否发送成功的布尔值
 * @throws 当消息格式化失败或发送失败时返回false
 */
async function formatMissionJsonSave(dataList: any[]): Promise<boolean> {
  const message: MissionMessage = {
    config: {
      wide_screen_mode: true
    },
    elements: [],
    header: {
      template: "blue",
      title: {
        content: "📚  前端今日头条",
        tag: "plain_text"
      }
    }
  };

  dataList.forEach((item) => {
    const title = item.title || ""; // 直接访问属性
    const content = item.article_abstract || "";
    const link = item.article_link || "";
    const id = item.id || 0;
    const tagList = item.tags || [];

    const cardTitle: MissionElement = {
      tag: "markdown",
      content: `**${title}**`,
      text_align: "left",
      text_size: "heading"
    };
    message.elements.push(cardTitle);

    const cardContent: MissionElement = {
      tag: "markdown",
      content: `> ${content}`,
      text_align: "left",
      text_size: "normal"
    };
    message.elements.push(cardContent);

    const cardTag: MissionElement = {
      tag: "markdown",
      content: '',
      text_align: "left",
      text_size: "normal"
    };

    let tagStr = '';
    tagList.forEach((tag: any, index:number) => {
      tagStr += `<text_tag color="${getColorBySet(index)}">${tag}</text_tag>`;
    })
    cardTag.content = tagStr;
    message.elements.push(cardTag);
    const cardButton = {
        "tag": "action",
        "layout": "default",
        "actions": [
            {
                "tag": "button",
                "text": {
                    "tag": "plain_text",
                    "content": "查看详情"
                },
                "type": "primary",
                "complex_interaction": true,
                "width": "default",
                "size": "medium",
                "behaviors": [
                  { // 声明交互类型是回传数据到服务端的回传交互。
                    "type": "callback",
                    "value": id,
                  },
                  {
                    "type": "open_url", // 声明交互类型是打开链接的交互。
                    "default_url": link, // 兜底的跳转地址。
                    "android_url": link, // 安卓端跳转地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。
                    "ios_url": link, // iOS 端跳转地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。
                    "pc_url": link // 桌面端跳转地址。可配置为 `lark://msgcard/unsupported_action` 声明当前端不允许跳转。
                  }
                ]

            }
        ]
    }
    message.elements.push(cardButton);
  });

  const sendMessage: SendMissionMessage = {
    content: JSON.stringify(message),
    receive_id: getFeishuReceiveId(),
    msg_type: "interactive"
  };
  
  try {
    return await simpleSendGroup(sendMessage);
  } catch (error) {
    console.error("发送消息失败:", error);
    return false;
  }
}

/**
 * 发送并存储消息
 * 
 * 将文章数据存储到数据库，并发送前N篇文章到飞书群组。
 * 包含完整的错误处理和事务逻辑。
 * 
 * @param rankList - 排序后的文章列表
 * @returns {Promise<boolean>} 返回操作是否成功的布尔值
 * @throws 当数据存储失败或消息发送失败时返回false
 */
async function sendAndStoreMessages(rankList: any[]): Promise<boolean> {
  try {
    const storePromises = rankList.map(async (article: any, index: number) => {
      let id: any;
      if (index < LIMIT_SEND_COUNT) {
        id = await createArticle({ ...article, is_send: true });
      } else {
        id = await createArticle(article);
      }
      if (index < LIMIT_SEND_COUNT) {
        rankList[index].id = id;
      }
      return id;
    });

    // 使用 Promise.all 来等待所有内容落库操作完成
    const idList = await Promise.all(storePromises);
    console.log('idList = ', idList);

    if (idList.length > 0) {
      console.log("✅ 数据存储成功");
    } else {
      console.error("❌ 数据存储失败");
    }

    // 获取前 LIMIT_SEND_COUNT 篇文章发送
    const topArticles = rankList.slice(0, LIMIT_SEND_COUNT);
    console.log(`📤 准备发送 ${topArticles.length} 篇文章到飞书群组`);

    // 发送消息
    const sendResult = await formatMissionJsonSave(topArticles);
    if (sendResult) {
      console.log("✅ 消息发送成功");
    } else {
      console.log("❌ 消息发送失败");
    }

    return sendResult && idList.length > 0;
  } catch (error) {
    console.error("❌ 发送或存储消息时出错:", error);
    return false;
  }
}

/**
 * 模块导出
 * 
 * 导出主要的消息发送和存储功能函数
 */
export { sendAndStoreMessages };