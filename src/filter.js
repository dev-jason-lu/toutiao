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
exports.filterBlogs = filterBlogs;
exports.llmFilter = llmFilter;
const article_1 = require("./database/models/article");
const llm_1 = require("./llm");
const CONTNET_LIMIT = 500; // 文章内容过短，有时候也可以判定为是抓取失效得到的一些错误信息，也可以过滤一下
function filterBlogs(blogs) {
    return __awaiter(this, void 0, void 0, function* () {
        // 过滤空内容, 或者失效内容
        let filteredBlogs = blogs.filter((blog) => { var _a, _b; return ((_a = blog.article_content) === null || _a === void 0 ? void 0 : _a.trim()) !== '' && ((_b = blog.article_content) === null || _b === void 0 ? void 0 : _b.trim().length) > CONTNET_LIMIT; });
        // 过滤重复内容
        filteredBlogs = removeRepeatedByLink(filteredBlogs);
        // 过滤掉已经发送过的内容
        filteredBlogs = yield sendedFilter(filteredBlogs);
        return filteredBlogs;
    });
}
// 过滤重复内容, 根据 link 是否重复而判定
function removeRepeatedByLink(allNews) {
    const newsSet = new Set();
    const finalNews = [];
    for (const newsItem of allNews) {
        if (newsSet.has(newsItem.article_link)) {
            continue;
        }
        newsSet.add(newsItem.article_link);
        finalNews.push(newsItem);
    }
    return finalNews;
}
function llmFilter(articleList) {
    return __awaiter(this, void 0, void 0, function* () {
        const responses = yield Promise.all(articleList.map((article) => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, llm_1.getFilterScore)(article.title, article.article_content);
            return Object.assign(Object.assign({}, article), response);
        })));
        // 如果需要排序，可以在这里启用排序逻辑
        // responses.sort((a, b) => b.score - a.score);
        // 过滤评分大于 4 的文章
        const filteredResponses = responses.filter((item) => item.score > 4);
        return filteredResponses;
    });
}
// 过滤已经发送过的内容
function sendedFilter(blogs) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sendedBlogLinks = yield (0, article_1.getSendedBlogLinks)();
            return blogs.filter((b) => !sendedBlogLinks.includes(b.article_link));
        }
        catch (error) {
            console.error('Error in main function:', error);
        }
    });
}
