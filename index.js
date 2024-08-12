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
exports.handler = handler;
var axios_1 = require("axios");
var cheerio = require("cheerio");
var config_1 = require("./src/config");
var TurndownService = require("turndown");
var turndownService = new TurndownService();
var filter_1 = require("./src/service/filter");
var abstract_1 = require("./src/service/abstract");
var rank_1 = require("./src/service/rank");
var send_1 = require("./src/service/send");
var click_1 = require("./src/service/click");
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
// @ts-nocheck
function scrapePage(website) {
    return __awaiter(this, void 0, void 0, function () {
        var response, $, links;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("current website is ", website.source);
                    return [4 /*yield*/, sleep(1000)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, axios_1.default.get(website.source_link)];
                case 2:
                    response = _a.sent();
                    $ = cheerio.load(response.data);
                    // 移除不必要的 tag 信息
                    [
                        "image",
                        "picture",
                        "source",
                        "embed",
                        "iframe",
                        "meta",
                        "script",
                        "style",
                        "link",
                        "noscript",
                        "video",
                        "audio",
                    ].forEach(function (tag) {
                        $(tag).remove();
                    });
                    links = $(website.list_selector);
                    // 遍历并分离出 link 和 title
                    return [2 /*return*/, links.toArray().map(function (linkElem) {
                            var _a;
                            var elem = $(linkElem);
                            // 从 a 标签中找到 span 元素
                            var titleElem = elem.find(website.title_selector);
                            var title = titleElem.text().trim();
                            return {
                                title: title,
                                article_link: (_a = elem.attr("href")) === null || _a === void 0 ? void 0 : _a.trim()
                            };
                        })];
            }
        });
    });
}
function scrapeContent(website, item) {
    return __awaiter(this, void 0, void 0, function () {
        var response, $_1, page, markdown, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get((_a = item === null || item === void 0 ? void 0 : item.article_link) !== null && _a !== void 0 ? _a : '')];
                case 1:
                    response = _b.sent();
                    $_1 = cheerio.load(response.data);
                    [
                        "image",
                        "picture",
                        "source",
                        "embed",
                        "iframe",
                        "meta",
                        "script",
                        "style",
                        "link",
                        "noscript",
                        "video",
                        "audio",
                    ].forEach(function (tag) {
                        $_1(tag).remove(); // 使用 $ 而不是 html
                    });
                    page = $_1(website.page_selector).html();
                    markdown = turndownService.turndown(page !== null && page !== void 0 ? page : '');
                    return [2 /*return*/, __assign(__assign({}, item), { article_content: markdown })];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error scraping content:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function processContent(demoWebsite) {
    return __awaiter(this, void 0, void 0, function () {
        var result, resultContentList, filterList, llmFilterList, abstractList, rankList, sendResult;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, scrapePage(demoWebsite)];
                case 1:
                    result = (_a.sent());
                    console.log(result);
                    return [4 /*yield*/, Promise.all(result.map(function (item) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, scrapeContent(demoWebsite, item)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }))];
                case 2:
                    resultContentList = _a.sent();
                    console.log("resultContentList", resultContentList.length);
                    return [4 /*yield*/, (0, filter_1.filterBlogs)(resultContentList)];
                case 3:
                    filterList = _a.sent();
                    console.log("filterList", filterList.length);
                    return [4 /*yield*/, (0, filter_1.llmFilter)(filterList)];
                case 4:
                    llmFilterList = _a.sent();
                    console.log("llmFilterList", llmFilterList.length);
                    return [4 /*yield*/, Promise.all(llmFilterList.map(function (article) { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, abstract_1.getArticleAbstract)(article.article_content, article.title)];
                                    case 1:
                                        result = _a.sent();
                                        return [2 /*return*/, __assign(__assign({}, article), { article_abstract: result })];
                                }
                            });
                        }); }))];
                case 5:
                    abstractList = _a.sent();
                    console.log("abstractList = ", abstractList.length);
                    return [4 /*yield*/, (0, rank_1.classifyScoresRank)(abstractList)];
                case 6:
                    rankList = _a.sent();
                    return [4 /*yield*/, (0, send_1.sendAndStoreMessages)(rankList)];
                case 7:
                    sendResult = _a.sent();
                    if (sendResult) {
                        console.log("success!");
                    }
                    else {
                        console.error("fail!");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// 入口函数
// {
//     "triggerTime": "2018-02-09T05:49:00Z",
//     "triggerName": "my_trigger",
//     "payload": "awesome-fc"
// }
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function () {
        var eventObj, demoWebsite, req, body, open_id, article_id, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("receive event: \n" + event.toString());
                    eventObj = JSON.parse(event);
                    if (!(eventObj.triggerName === 'trigger-911a94b5')) return [3 /*break*/, 2];
                    demoWebsite = (0, config_1.SourceList)()[0];
                    return [4 /*yield*/, processContent(demoWebsite)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { code: 0, msg: 'success' }];
                case 2:
                    req = JSON.parse(event);
                    if (!req.body) return [3 /*break*/, 5];
                    body = JSON.parse(req.body);
                    if (body.challenge) {
                        return [2 /*return*/, { challenge: body.challenge }];
                    }
                    if (!body.event) return [3 /*break*/, 5];
                    if (!(body.header.event_type === "card.action.trigger")) return [3 /*break*/, 4];
                    open_id = body.event.operator.open_id;
                    article_id = body.event.action.value;
                    return [4 /*yield*/, (0, click_1.insertClick)(Number(article_id), open_id)];
                case 3:
                    result = _a.sent();
                    if (!result) {
                        return [2 /*return*/, { code: 1, msg: 'insertClick Fail' }];
                    }
                    return [2 /*return*/, {}];
                case 4: return [2 /*return*/, { event: body.event }];
                case 5: return [2 /*return*/, JSON.parse(event)];
            }
        });
    });
}
// 立即执行的异步函数
// (async  () => {
//     await handler('{}', '')
// })();
// const filePath = './output.md';
// 使用 fs.writeFile 将 Markdown 字符串写入文件
// fs.writeFile(filePath, markdown, (err) => {
//   if (err) {
//     console.error(`Error writing file: ${err}`);
//   } else {
//     console.log(`Markdown file saved successfully to ${filePath}`);
//   }
// });
