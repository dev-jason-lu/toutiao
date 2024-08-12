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
exports.getArticleAbstract = getArticleAbstract;
var llm_1 = require("../llm");
// 将长文本分割为一个个的相同长度的 chunk
function splitText(text, length) {
    return Array.from({ length: Math.ceil(text.length / length) }, function (_, i) {
        var start = i * length;
        return text.slice(start, start + length);
    });
}
// 单独总结某个 chunk
function abstractChunk(chunk_1) {
    return __awaiter(this, arguments, void 0, function (chunk, title) {
        var prompt;
        if (title === void 0) { title = ''; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "\u4F60\u662F\u4E00\u4E2A\u5185\u5BB9\u62BD\u53D6\u603B\u7ED3\u52A9\u624B\uFF0C\u4F60\u5C06\u5F97\u5230\u4E00\u4E2A\u5B8C\u6574\u535A\u5BA2\u7F51\u7AD9\u7684\u90E8\u5206\u5185\u5BB9\u7247\u6BB5\uFF0C\u5E76\u603B\u7ED3\u5176\u4E2D\u7684\u5185\u5BB9\u3002\n\u5185\u5BB9\u7247\u6BB5\u4E2D\u53EF\u80FD\u4F1A\u5305\u542B\u65E0\u6548\u7684\u5783\u573E\u4FE1\u606F\uFF0C\u4F60\u9700\u8981\u5FFD\u7565\u5176\u4FE1\u606F\uFF0C\u5E76\u53EA\u5173\u6CE8\u548C\u6807\u9898\u76F8\u5173\u7684\u4FE1\u606F\u3002\n\n\u6807\u9898\uFF1A".concat(title, "\n\u5185\u5BB9\uFF1A<content>").concat(chunk, "</content>\n\u5185\u5BB9\u603B\u7ED3 (\u53EA\u5173\u6CE8\u548C\u6807\u9898\u76F8\u5173\u7684\u4FE1\u606F\uFF0C\u5E76\u7528\u4E2D\u6587\u603B\u7ED3):");
                    return [4 /*yield*/, (0, llm_1.llmArticleAbstract)(prompt)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var LIMIT = 3000;
function getArticleAbstract(content, title) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt_1, chunks, chunkConcludeTasks, _i, chunks_1, chunk, contentChunks, sumarizeChunksPrompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(content.length < LIMIT)) return [3 /*break*/, 2];
                    prompt_1 = "\n\u6458\u8981\u5185\u5BB9\u8981\u6C42:\n- \u6700\u7EC8\u4E00\u5B9A\u662F\u7528\u4E2D\u6587\u8FDB\u884C\u603B\u7ED3\n- \u6458\u8981\u7684\u5185\u5BB9\u8981\u7B80\u6D01\u6E05\u6670, \u76F4\u51FB\u91CD\u70B9\n- \u6458\u8981\u5185\u5BB9\u4E0D\u8981\u592A\u5570\u55E6\uFF0C\u65E0\u8BBA\u591A\u957F\u7684\u5185\u5BB9\uFF0C\u6458\u8981\u5185\u5BB9\u5B57\u6570\u90FD\u4F1A\u5728 4 \u53E5\u8BDD\u4EE5\u5185\uFF0C\u4E0D\u8D85\u8FC7 400 \u5B57\n\n\u6587\u7AE0\u6807\u9898\uFF1A".concat(title, "\n\u6587\u7AE0\u5185\u5BB9(\u7528 <article>...</article> \u5143\u7D20\u5305\u88F9):\n<article>\n").concat(content, "\n</article>\n\n\u6458\u8981\u4FE1\u606F (\u8981\u6C42\u6458\u8981\u4E3A\u4E2D\u6587):");
                    return [4 /*yield*/, (0, llm_1.llmArticleAbstract)(prompt_1)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    chunks = splitText(content, LIMIT);
                    chunkConcludeTasks = [];
                    for (_i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
                        chunk = chunks_1[_i];
                        chunkConcludeTasks.push(abstractChunk(chunk));
                    }
                    return [4 /*yield*/, Promise.all(chunkConcludeTasks)];
                case 3:
                    contentChunks = _a.sent();
                    sumarizeChunksPrompt = "\u4EE5\u4E0B\u662F\u4E00\u7BC7\u535A\u5BA2\u6587\u7AE0\u7684\u6807\u9898\uFF0C\u4EE5\u53CA\u535A\u5BA2\u6587\u7AE0\u7684\u5404\u4E2A\u90E8\u5206\u7684\u5185\u5BB9\u603B\u7ED3\uFF0C\u4F60\u9700\u8981\u6839\u636E\u8FD9\u4E9B\u4FE1\u606F\u6574\u7406\u6210\u4E00\u4EFD\u6458\u8981\u3002\n\u6807\u9898\uFF1A".concat(title, "\n\u6587\u7AE0\u5404\u90E8\u5206\u7684\u5185\u5BB9\u603B\u7ED3(\u7528 <article_chunks>...</article_chunks> \u5305\u88F9):\n<article_chunks>\n").concat(contentChunks.join("\n----\n"), "\n</article_chunks>\n\n\u6458\u8981\u5185\u5BB9\u8981\u6C42:\n- \u6700\u7EC8\u4E00\u5B9A\u662F\u7528\u4E2D\u6587\u8FDB\u884C\u603B\u7ED3\n- \u6458\u8981\u7684\u5185\u5BB9\u8981\u7B80\u6D01\u6E05\u6670, \u76F4\u51FB\u91CD\u70B9\n- \u6458\u8981\u5185\u5BB9\u4E0D\u8981\u592A\u5570\u55E6\uFF0C\u65E0\u8BBA\u591A\u957F\u7684\u5185\u5BB9\uFF0C\u6458\u8981\u5185\u5BB9\u5B57\u6570\u90FD\u4F1A\u5728 4 \u53E5\u8BDD\u4EE5\u5185\uFF0C\u4E0D\u8D85\u8FC7 400 \u5B57\n\n\u6458\u8981\u4FE1\u606F (\u8981\u6C42\u6458\u8981\u4E3A\u4E2D\u6587):");
                    return [4 /*yield*/, (0, llm_1.llmArticleAbstract)(sumarizeChunksPrompt)];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
