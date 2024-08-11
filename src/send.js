"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAndStoreMessages = sendAndStoreMessages;
const feishu_1 = require("./utils/feishu");
const article_1 = require("./database/models/article");
const colorList = ['blue', 'turquoise', 'lime', 'orange', 'violet', 'indigo', 'wathet', 'green', 'yellow', 'red', 'purple', 'carmine'];
// 从上述列表里去一个颜色字符串作为return，且每次生成不能重复
function getColorBySet(index) {
    return colorList[index];
}
function formatMissionJsonSave(dataList) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
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
            const tagList = item.tags || [];
            const cardTitle = {
                tag: "markdown",
                content: `**${title}**`,
                text_align: "left",
                text_size: "heading"
            };
            message.elements.push(cardTitle);
            const cardContent = {
                tag: "markdown",
                content: `> ${content}`,
                text_align: "left",
                text_size: "normal"
            };
            message.elements.push(cardContent);
            const cardTag = {
                tag: "markdown",
                content: '',
                text_align: "left",
                text_size: "normal"
            };
            let tagStr = '';
            tagList.forEach((tag, index) => {
                tagStr += `<text_tag color="${getColorBySet(index)}">${tag}</text_tag>`;
            });
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
                        "multi_url": {
                            "url": link,
                            "pc_url": link,
                            "ios_url": link,
                            "android_url": link,
                        }
                    }
                ]
            };
            message.elements.push(cardButton);
        });
        const sendMessage = {
            content: JSON.stringify(message),
            receive_id: "oc_dddeabc7ccbff0504b46d72a51d2920d", // 替换为实际的 chat_id
            msg_type: "interactive"
        };
        return yield (0, feishu_1.simpleSendGroup)(sendMessage);
    });
}
function sendAndStoreMessages(rankList, abstractList, linkSet) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 发送消息
            const sendResult = formatMissionJsonSave(rankList);
            // 内容落库
            const storePromises = abstractList.map((article) => __awaiter(this, void 0, void 0, function* () {
                if (linkSet.has(article.article_link)) {
                    return (0, article_1.createArticle)(Object.assign(Object.assign({}, article), { is_send: true }));
                }
                return (0, article_1.createArticle)(article);
            }));
            // 等待发送消息的结果
            const sendResultValue = yield sendResult;
            if (sendResultValue) {
                console.log("send success!");
            }
            else {
                console.error("send fail!");
            }
            // 使用 Promise.all 来等待所有内容落库操作完成
            const idList = yield Promise.all(storePromises);
            console.log('idList = ', idList);
            const filteredIdList = idList.filter(id => id !== null);
            if (filteredIdList.length > 0) {
                console.log("store success!");
            }
            else {
                console.error("store fail!");
            }
            return sendResultValue && filteredIdList.length > 0;
        }
        catch (error) {
            console.error("An error occurred:", error);
            return false;
        }
    });
}
// 示例使用
// const dataList = [
//     { title: "Title 1", article_abstract: "Content 1", tags: ["tag1", "tag2"] },
//     { title: "Title 2", article_abstract: "Content 2", tags: ["tag3", "tag4"] }
// ];
//
// const formattedMessage = formatMissionJsonSave(dataList);
// console.log("Formatted Message:", formattedMessage);
