import {simpleSendGroup} from "../utils/feishu";
import {createArticle} from "../database/models/article";
import {LIMIT_SEND_COUNT} from "../config";

const colorList = ['blue', 'turquoise', 'lime', 'orange', 'violet', 'indigo', 'wathet', 'green', 'yellow', 'red', 'purple', 'carmine']

// 从上述列表里去一个颜色字符串作为return，且每次生成不能重复
function getColorBySet(index: number) {
    return colorList[index]
}
interface MissionElement {
  tag: string;
  content?: string;
  text_align?: string;
  text_size?: string;
}

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

interface SendMissionMessage {
  content: string;
  receive_id: string;
  msg_type: string;
}

async function formatMissionJsonSave(dataList: any[]): Promise<any> {
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
    receive_id: "oc_40e0a283cf0624bb9a365dcf94bdbbe0",
    // receive_id: "oc_dddeabc7ccbff0504b46d72a51d2920d",
    msg_type: "interactive"
  };
  return await simpleSendGroup(sendMessage);
}

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
      console.log("store success!");
    } else {
      console.error("store fail!");
    }

    // 发送消息
    const sendResult = formatMissionJsonSave(rankList.slice(0, LIMIT_SEND_COUNT));
    // 等待发送消息的结果
    const sendResultValue = await sendResult;
    if (sendResultValue) {
      console.log("send success!");
    } else {
      console.error("send fail!");
    }
    return sendResultValue && idList.length > 0
  } catch (error) {
    console.error("An error occurred:", error);
    return false
  }
}

export { sendAndStoreMessages };

// 示例使用
// const dataList = [
//     { title: "Title 1", article_abstract: "Content 1", tags: ["tag1", "tag2"] },
//     { title: "Title 2", article_abstract: "Content 2", tags: ["tag3", "tag4"] }
// ];
//
// const formattedMessage = formatMissionJsonSave(dataList);
// console.log("Formatted Message:", formattedMessage);