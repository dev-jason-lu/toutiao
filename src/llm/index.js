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
exports.getFilterScore = getFilterScore;
exports.llmArticleAbstract = llmArticleAbstract;
exports.llmRankArticles = llmRankArticles;
var axios_1 = require("axios");
// Define the API call function
function getFilterScore(title, content) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, req, data, config, response, jsonParse, error_1, resp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = "\n# Task\n\u4F60\u7684\u4EFB\u52A1\u662F\u6839\u636E\u9700\u6C42\u5BF9\u6587\u7AE0\u8FDB\u884C\u8BC6\u522B\u548C\u7ED9\u51FA\u662F\u5426\u503C\u5F97\u9605\u8BFB\u7684\u6253\u5206\u5EFA\u8BAE\u3002\u5BF9\u4E8E\u90A3\u4E9B\u4E0D\u503C\u5F97\u9605\u8BFB\u7684\u6587\u7AE0\uFF0C\u4F60\u4F1A\u6BEB\u4E0D\u72B9\u8C6B\u7684\u6253\u4F4E\u5206\u3002\n\u6253\u5206\u7684\u6838\u5FC3\u51C6\u5219\u5C31\u662F\u6587\u7AE0\u662F\u5426\u503C\u5F97\u9605\u8BFB\uFF0C\u6EE1\u5206\u4E3A 10 \u5206 (\u4E5F\u5373\u6253\u5206\u8303\u56F4\u662F 0-10)\u3002\n\u6253\u5206\u89C4\u5219\u5982\u4E0B:\n- \u5927\u4E8E 9 \u5206\u4E3A\u975E\u5E38\u63A8\u8350\u9605\u8BFB\n- 5-9 \u5206\u4E3A\u4E00\u822C\u63A8\u8350\n- 4 \u5206\u4EE5\u4E0B\u4E3A\u4E0D\u63A8\u8350\u9605\u8BFB\u3002\n\n# Judging standard\n\u4EE5\u4E0B\u662F\u4E00\u4E9B\u9700\u8981\u8003\u8651\u5230\u7684\u6587\u7AE0\u8BC4\u5224\u6807\u51C6:\n- \u5185\u5BB9\u7684\u51C6\u786E\u6027\uFF1A\u6587\u7AE0\u63D0\u4F9B\u7684\u4FE1\u606F\u662F\u5426\u51C6\u786E\u65E0\u8BEF\uFF0C\u662F\u5426\u6709\u4E8B\u5B9E\u6027\u9519\u8BEF\u3002\n- \u6DF1\u5EA6\u548C\u5E7F\u5EA6\uFF1A\u597D\u7684\u6587\u7AE0\u901A\u5E38\u6DF1\u5165\u63A2\u8BA8\u4E3B\u9898\uFF0C\u63D0\u4F9B\u8DB3\u591F\u7684\u80CC\u666F\u4FE1\u606F\u548C\u7EC6\u8282\uFF0C\u540C\u65F6\u8986\u76D6\u4E3B\u9898\u7684\u591A\u4E2A\u65B9\u9762\u3002\n- \u539F\u521B\u6027\u548C\u521B\u65B0\u6027\uFF1A\u6587\u7AE0\u662F\u5426\u63D0\u4F9B\u4E86\u72EC\u7279\u7684\u89C2\u70B9\u3001\u65B0\u7684\u89C1\u89E3\u6216\u521B\u65B0\u7684\u65B9\u6CD5\u3002\n- \u903B\u8F91\u6027\u548C\u6761\u7406\u6027\uFF1A\u6587\u7AE0\u7684\u7ED3\u6784\u662F\u5426\u6E05\u6670\uFF0C\u8BBA\u70B9\u662F\u5426\u903B\u8F91\u4E25\u5BC6\uFF0C\u4FE1\u606F\u662F\u5426\u6709\u5E8F\u5448\u73B0\u3002\n- \u8BED\u8A00\u548C\u8868\u8FBE\uFF1A\u8BED\u8A00\u662F\u5426\u6D41\u7545\uFF0C\u8868\u8FBE\u662F\u5426\u6E05\u6670\uFF0C\u662F\u5426\u6709\u8BED\u6CD5\u9519\u8BEF\u6216\u62FC\u5199\u9519\u8BEF\u3002\n- \u53EF\u8BFB\u6027\uFF1A\u6587\u7AE0\u662F\u5426\u6613\u4E8E\u9605\u8BFB\uFF0C\u6BB5\u843D\u662F\u5426\u5408\u7406\u5212\u5206\uFF0C\u662F\u5426\u6709\u9002\u5F53\u7684\u6807\u9898\u548C\u5C0F\u6807\u9898\u3002\n- \u5B9E\u7528\u6027\uFF1A\u5BF9\u4E8E\u6280\u672F\u535A\u5BA2\u6765\u8BF4\uFF0C\u6587\u7AE0\u662F\u5426\u63D0\u4F9B\u4E86\u5B9E\u7528\u7684\u4FE1\u606F\u3001\u6280\u5DE7\u6216\u89E3\u51B3\u65B9\u6848\u3002\n\n## Not Recommend\n\u4EE5\u4E0B\u7C7B\u578B\u7684\u6587\u7AE0\uFF0C\u4E0D\u63A8\u8350\u9605\u8BFB (\u6EE1\u8DB3\u4EE5\u4E0B\u4EFB\u610F\u6761\u4EF6\u7684\u8BF7\u76F4\u63A5\u7ED9\u4F4E\u5206\u751A\u81F30\u5206):\n1. \u6587\u7AE0\u5185\u5BB9\u6CA1\u6709\u4EF7\u503C\uFF0C\u6CA1\u6709\u5E72\u8D27\uFF0C\u6CA1\u6709\u542F\u53D1\uFF0C\u5BF9\u8BFB\u8005\u6CA1\u6709\u5E2E\u52A9\uFF0C\u5BF9\u8BFB\u8005\u6CA1\u6709\u6536\u83B7\n2. \u5BF9\u4E8E\u8F6F\u6587\uFF0C\u5E7F\u544A\uFF0C\u6216\u8005\u8425\u9500\u7B49\u5185\u5BB9\uFF0C\u4E0D\u63A8\u8350\u9605\u8BFB\n3. \u5185\u5BB9\u6BD4\u8F83\u7B80\u5355\uFF0C\u5199\u7684\u6CA1\u6709\u6DF1\u5EA6\uFF0C\u4EF7\u503C\u610F\u4E49\u4E0D\u5927\uFF0C\u4E0D\u63A8\u8350\u9605\u8BFB\n4. \u6587\u7AE0\u6574\u4F53\u7ED3\u6784\u6DF7\u4E71\uFF0C\u6CA1\u6709\u91CD\u70B9\uFF0C\u4FE1\u606F\u91CF\u5C11\uFF0C\u4E0D\u63A8\u8350\u9605\u8BFB\n5. \u5982\u679C\u53EA\u662F\u5927\u91CF\u7684\u4FE1\u606F\u7F57\u5217\uFF0C\u4E0D\u63A8\u8350\u9605\u8BFB\n6. \u975E\u524D\u7AEF\u76F8\u5173\u9886\u57DF\u7684\u5185\u5BB9\uFF0C\u4E0D\u63A8\u8350\u9605\u8BFB\n\n## Recommend\n\u4EE5\u4E0B\u7C7B\u578B\u7684\u6587\u7AE0\uFF0C\u66F4\u4E3A\u63A8\u8350\u9605\u8BFB:\n- \u6280\u672F\u539F\u7406\u8BB2\u89E3\n- \u5E72\u8D27\u5206\u4EAB\n- \u6280\u672F\u5B9E\u8DF5\n\n# Output Format\n\u8F93\u51FA\u683C\u5F0F\u4E3A\u4E00\u4E2A\u53EF\u4EE5\u88AB JSON.parse \u7684 Javascript \u5BF9\u8C61\uFF0C\u683C\u5F0F\u5982\u4E0B\uFF0C\u4E0D\u8981\u6709markdown\u683C\u5F0F:\n{\n  \"think\": \"...\" // \u5BF9\u5F53\u524D\u6587\u7AE0\u8BC4\u4EF7\u7684\u601D\u8003\uFF0C\u8FD9\u91CC\u8BF7\u6309\u7167\u4E0A\u9762\u63D0\u4F9B\u7684\u63A8\u8350\u6807\u51C6\uFF0C\u4E00\u6B65\u6B65\u601D\u8003\u548C\u8BC6\u522B\u6587\u7AE0\u7279\u70B9\uFF0C\u4EE5\u4FBF\u4E8E\u4F5C\u4E3A\u6253\u5206\u4F9D\u636E\n  \"tags: [\"\u5E7F\u544A\", \"CSS\", \"JS\", \"React\", \"\u8F6F\u6587\", ...] // \u6587\u7AE0\u6807\u7B7E\u5206\u7C7B\uFF0C\u6570\u7EC4\u5F62\u5F0F\n  \"score\": ..., // \u6253\u5206\u5206\u6570\uFF0C\u8303\u56F4\u4E3A 0-10, \u5927\u4E8E 9 \u5206\u4E3A\u975E\u5E38\u63A8\u8350\u9605\u8BFB\n}\n\u8BF7\u4E25\u683C\u6309\u7167\u4EE5\u4E0A\u8981\u6C42\u8F93\u51FA\uFF0C\u4E0D\u8981\u8F93\u51FA\u5176\u4ED6\u5185\u5BB9\u3002\n\n# Input\n\u4E0B\u9762\u662F\u5F85\u6253\u5206\u7684\u6587\u7AE0\u5185\u5BB9:\n<article>\n\u6807\u9898: ".concat(title, "\n\u5185\u5BB9: ").concat(content, "\n</article>\n");
                    req = {
                        model: 'deepseek-chat',
                        frequency_penalty: 0,
                        max_tokens: 2048,
                        presence_penalty: 0,
                        response_format: { type: 'text' },
                        stop: null,
                        stream: false,
                        stream_options: null,
                        temperature: 1,
                        top_p: 1,
                        tools: null,
                        tool_choice: 'none',
                        logprobs: false,
                        top_logprobs: null,
                        messages: [
                            { content: '你是一个非常严格的文章挑选机器人', role: 'system' },
                            { content: prompt, role: 'user' },
                        ],
                    };
                    data = JSON.stringify(req);
                    config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://api.deepseek.com/chat/completions',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Bearer sk-48781df778c74ed59c43339195ae7487',
                        },
                        data: data,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, axios_1.default)(config)];
                case 2:
                    response = _a.sent();
                    jsonParse = response.data.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '');
                    return [2 /*return*/, JSON.parse(jsonParse)];
                case 3:
                    error_1 = _a.sent();
                    console.log('llm req fail');
                    resp = {
                        think: '',
                        tags: [],
                        score: 0,
                    };
                    return [2 /*return*/, resp];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function llmArticleAbstract(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var req, data, config, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = {
                        model: 'deepseek-chat',
                        frequency_penalty: 0,
                        max_tokens: 2048,
                        presence_penalty: 0,
                        response_format: { type: 'text' },
                        stop: null,
                        stream: false,
                        stream_options: null,
                        temperature: 1,
                        top_p: 1,
                        tools: null,
                        tool_choice: 'none',
                        logprobs: false,
                        top_logprobs: null,
                        messages: [
                            { content: '你是一个专业的内容摘要编写助手，非常擅长给任何内容的文章写摘要。你的任务是将文章内容，总结成一两句话的摘要信息，以便于读者可以快速了解有什么内容，是否适合继续深入阅读，以及对读者来说有什么意义。', role: 'system' },
                            { content: prompt, role: 'user' },
                        ],
                    };
                    data = JSON.stringify(req);
                    config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://api.deepseek.com/chat/completions',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Bearer sk-48781df778c74ed59c43339195ae7487',
                        },
                        data: data,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, axios_1.default)(config)];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data.choices[0].message.content.trim()];
                case 3:
                    error_2 = _a.sent();
                    console.error(error_2);
                    throw error_2; // Or handle the error as needed
                case 4: return [2 /*return*/];
            }
        });
    });
}
function llmRankArticles(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var req, data, config, response, jsonParse, error_3, resp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    req = {
                        model: 'deepseek-chat',
                        frequency_penalty: 0,
                        max_tokens: 2048,
                        presence_penalty: 0,
                        response_format: { type: 'text' },
                        stop: null,
                        stream: false,
                        stream_options: null,
                        temperature: 1,
                        top_p: 1,
                        tools: null,
                        tool_choice: 'none',
                        logprobs: false,
                        top_logprobs: null,
                        messages: [
                            { content: '你是一个前端资讯排列助手', role: 'system' },
                            { content: prompt, role: 'user' },
                        ],
                    };
                    data = JSON.stringify(req);
                    config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://api.deepseek.com/chat/completions',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Bearer sk-48781df778c74ed59c43339195ae7487',
                        },
                        data: data,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, axios_1.default)(config)];
                case 2:
                    response = _a.sent();
                    jsonParse = response.data.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '');
                    return [2 /*return*/, JSON.parse(jsonParse)];
                case 3:
                    error_3 = _a.sent();
                    console.log('llm req fail');
                    resp = {
                        think: '',
                        orders: [],
                    };
                    return [2 /*return*/, resp];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Example usage
// (async () => {
//   const title = 'JavaScript 中的闭包';
//   const content = '在 JavaScript 中，闭包是一种常见的编程模式……'; // Provide actual article content here
//   const response = await getFilterScore(title, content);
//   console.log(response.choices[0].message.content); // Print the assistant's message
// })();
