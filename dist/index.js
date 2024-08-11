"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const config_1 = require("./src/config");
const turndown_1 = __importDefault(require("turndown"));
const turndownService = new turndown_1.default();
const filter_1 = require("./src/filter");
const abstract_1 = require("./src/abstract");
const rank_1 = require("./src/rank");
const send_1 = require("./src/send");
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
// @ts-nocheck
function scrapePage(website) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("current website is ", website.source);
        yield sleep(1000);
        const response = yield axios_1.default.get(website.source_link); // 获得 html
        const $ = cheerio.load(response.data);
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
        ].forEach((tag) => {
            $(tag).remove();
        });
        // 根据 list_selector 选出列表项的 a 标签
        const links = $(website.list_selector);
        // 遍历并分离出 link 和 title
        return links.toArray().map((linkElem) => {
            var _a;
            const elem = $(linkElem);
            // 从 a 标签中找到 span 元素
            const titleElem = elem.find(website.title_selector);
            const title = titleElem.text().trim();
            return {
                title: title,
                article_link: (_a = elem.attr("href")) === null || _a === void 0 ? void 0 : _a.trim()
            };
        });
    });
}
function scrapeContent(website, item) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.get((_a = item === null || item === void 0 ? void 0 : item.article_link) !== null && _a !== void 0 ? _a : '');
            const $ = cheerio.load(response.data);
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
            ].forEach((tag) => {
                $(tag).remove(); // 使用 $ 而不是 html
            });
            const page = $(website.page_selector).html();
            const markdown = turndownService.turndown(page !== null && page !== void 0 ? page : '');
            return Object.assign(Object.assign({}, item), { article_content: markdown });
        }
        catch (error) {
            console.error('Error scraping content:', error);
            throw error;
        }
    });
}
function processContent(demoWebsite) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = (yield scrapePage(demoWebsite));
        console.log(result);
        const resultContentList = yield Promise.all(result.map((item) => __awaiter(this, void 0, void 0, function* () { return yield scrapeContent(demoWebsite, item); })));
        console.log("resultContentList", resultContentList.length);
        const filterList = yield (0, filter_1.filterBlogs)(resultContentList);
        console.log("filterList", filterList.length);
        const llmFilterList = yield (0, filter_1.llmFilter)(filterList);
        console.log("llmFilterList", llmFilterList.length);
        const abstractList = yield Promise.all(llmFilterList.map((article) => __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, abstract_1.getArticleAbstract)(article.article_content, article.title);
            return Object.assign(Object.assign({}, article), { article_abstract: result });
        })));
        console.log("abstractList = ", abstractList.length);
        // 调试用
        // const abstractList = await getArticleList(8);
        const rankList = yield (0, rank_1.classifyScoresRank)(abstractList);
        const linkSet = new Set(rankList.map(article => article.article_link)); // 使用 Set 提高查找效率
        // 发送消息&存储
        // console.log(rankList)
        const sendResult = yield (0, send_1.sendAndStoreMessages)(rankList, abstractList, linkSet);
        if (sendResult) {
            console.log("success!");
        }
        else {
            console.error("fail!");
        }
    });
}
// 入口函数
function handler(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("receive event: \n" + event.toString());
        const demoWebsite = (0, config_1.SourceList)()[0];
        yield processContent(demoWebsite);
    });
}
// 立即执行的异步函数
// (async  () => {
//     const demoWebsite = SourceList()[0]!;
//     await processContent(demoWebsite);
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
