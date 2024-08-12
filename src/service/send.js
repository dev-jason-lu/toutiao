"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAndStoreMessages = sendAndStoreMessages;
var feishu_1 = require("../utils/feishu");
var article_1 = require("../database/models/article");
var config_1 = require("../config");
var colorList = ['blue', 'turquoise', 'lime', 'orange', 'violet', 'indigo', 'wathet', 'green', 'yellow', 'red', 'purple', 'carmine'];
// 从上述列表里去一个颜色字符串作为return，且每次生成不能重复
function getColorBySet(index) {
    return colorList[index];
}
function formatMissionJsonSave(dataList) {
    return __awaiter(this, void 0, void 0, function () {
        var message, sendMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = {
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
                    dataList.forEach(function (item) {
                        var title = item.title || ""; // 直接访问属性
                        var content = item.article_abstract || "";
                        var link = item.article_link || "";
                        var id = item.id || 0;
                        var tagList = item.tags || [];
                        var cardTitle = {
                            tag: "markdown",
                            content: "**".concat(title, "**"),
                            text_align: "left",
                            text_size: "heading"
                        };
                        message.elements.push(cardTitle);
                        var cardContent = {
                            tag: "markdown",
                            content: "> ".concat(content),
                            text_align: "left",
                            text_size: "normal"
                        };
                        message.elements.push(cardContent);
                        var cardTag = {
                            tag: "markdown",
                            content: '',
                            text_align: "left",
                            text_size: "normal"
                        };
                        var tagStr = '';
                        tagList.forEach(function (tag, index) {
                            tagStr += "<text_tag color=\"".concat(getColorBySet(index), "\">").concat(tag, "</text_tag>");
                        });
                        cardTag.content = tagStr;
                        message.elements.push(cardTag);
                        var cardButton = {
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
                                        {
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
                        };
                        message.elements.push(cardButton);
                    });
                    sendMessage = {
                        content: JSON.stringify(message),
                        receive_id: "oc_40e0a283cf0624bb9a365dcf94bdbbe0",
                        // receive_id: "oc_dddeabc7ccbff0504b46d72a51d2920d",
                        msg_type: "interactive"
                    };
                    return [4 /*yield*/, (0, feishu_1.simpleSendGroup)(sendMessage)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function sendAndStoreMessages(rankList) {
    return __awaiter(this, void 0, void 0, function () {
        var storePromises, idList, sendResult, sendResultValue, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    storePromises = rankList.map(function (article, index) { return __awaiter(_this, void 0, void 0, function () {
                        var id;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(index < config_1.LIMIT_SEND_COUNT)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, (0, article_1.createArticle)(__assign(__assign({}, article), { is_send: true }))];
                                case 1:
                                    id = _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, (0, article_1.createArticle)(article)];
                                case 3:
                                    id = _a.sent();
                                    _a.label = 4;
                                case 4:
                                    if (index < config_1.LIMIT_SEND_COUNT) {
                                        rankList[index].id = id;
                                    }
                                    return [2 /*return*/, id];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(storePromises)];
                case 1:
                    idList = _a.sent();
                    console.log('idList = ', idList);
                    if (idList.length > 0) {
                        console.log("store success!");
                    }
                    else {
                        console.error("store fail!");
                    }
                    sendResult = formatMissionJsonSave(rankList.slice(0, config_1.LIMIT_SEND_COUNT));
                    return [4 /*yield*/, sendResult];
                case 2:
                    sendResultValue = _a.sent();
                    if (sendResultValue) {
                        console.log("send success!");
                    }
                    else {
                        console.error("send fail!");
                    }
                    return [2 /*return*/, sendResultValue && idList.length > 0];
                case 3:
                    error_1 = _a.sent();
                    console.error("An error occurred:", error_1);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
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
