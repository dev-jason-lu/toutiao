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
exports.classifyScoresRank = classifyScoresRank;
<<<<<<< HEAD:dist/service/rank.js
const llm_1 = require("../llm");
const config_1 = require("../config");
=======
var llm_1 = require("../llm");
var config_1 = require("../config");
>>>>>>> c20e142d10a99e4e2a1ff8cd0243229a427b9d70:src/service/rank.js
function rankArticles(articleList) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt;
        return __generator(this, function (_a) {
            prompt = "\n    # Task\n\u4F60\u7684\u4EFB\u52A1\u662F\u9488\u5BF9\u7ED9\u5B9A\u7684\u4E00\u7CFB\u5217\u8D44\u8BAF\u505A\u4E00\u4E2A\u6392\u5E8F\uFF0C\u628A\u4F60\u89C9\u5F97\u6709\u610F\u601D\u7684\uFF0C\u6709\u4EF7\u503C\u7684\u4FE1\u606F\u653E\u5728\u524D\u9762\uFF0C\u628A\u4FE1\u606F\u4EF7\u503C\u4F4E\u7684\u653E\u5728\u540E\u9762\u3002\n\u5BF9\u4E8E\u4F60\u6765\u8BF4\uFF0C\u4F60\u7279\u522B\u504F\u5411\u4E8E\u5982\u4E0B\u5185\u5BB9\uFF1A\n- \u524D\u6CBF\u6280\u672F\u4FE1\u606F\u52A8\u6001\n- \u524D\u7AEF\u6280\u672F\u5B9E\u8DF5\n- \u6280\u672F\u539F\u7406\u8BB2\u89E3\n- \u5E72\u8D27\u5206\u4EAB\n\n# Input Format\n\u4F60\u4F1A\u5F97\u5230\u6570\u7EC4\u5F62\u5F0F\u7684\u8D44\u8BAF\u5217\u8868\uFF0C\u6BCF\u6761\u8D44\u8BAF\u5305\u542B index, title, summary \u5B57\u6BB5\u3002\n\u4F8B\u5982:\n'''\n[\n  { index: 0, title: \"xxx\", summary: \"xxx\"},\n  { index: 1, title: \"xxx\", summary: \"xxx\"},\n  ...\n]\n'''\n\n# Output Format\n\u8F93\u51FA\u683C\u5F0F\u4E3A\u4E00\u4E2A\u53EF\u4EE5\u88AB JSON.parse \u7684 Javascript \u5BF9\u8C61\uFF0C\u683C\u5F0F\u5982\u4E0B:\n{\n  \"think\": \"xxx..\", // \u4E00\u6B65\u6B65\u601D\u8003\uFF0C\u7ED9\u51FA\u4F60\u7684\u6392\u5E8F\u903B\u8F91\u548C\u4F9D\u636E\n  \"orders\": [ .... ]  // \u91CD\u65B0\u6392\u5E8F\u540E\u7684\u987A\u5E8F\uFF0C\u4E3A\u6570\u5B57\u6570\u7EC4\uFF0C\u6BCF\u4E2A\u5143\u7D20\u7684\u5185\u5BB9\u5BF9\u5E94\u8F93\u5165\u7684 index \u7684\u503C\u3002\u4ECE\u5DE6\u5230\u53F3\u4ECE\u9AD8\u4EF7\u503C\u5230\u4F4E\u4EF7\u503C\u8FDB\u884C\u6392\u5E8F\n}\n\u8BF7\u4E25\u683C\u6309\u7167\u4EE5\u4E0A\u8981\u6C42\u8F93\u51FA\uFF0C\u4E0D\u8981\u8F93\u51FA\u5176\u4ED6\u5185\u5BB9\u3002\u5E76\u786E\u4FDD\u8F93\u51FA\u7684 orders \u4E2D\u5305\u542B\u6240\u6709\u4F20\u5165\u6570\u636E\u7684 index \u503C\uFF0C\u540C\u65F6\u4FDD\u8BC1\u6CA1\u6709\u91CD\u590D\u7684\u503C\u3002\n\n# Example\n\u4E0B\u9762\u662F\u4E00\u4E2A\u6848\u4F8B\u5C55\u793A\u3002\n'''\n\u8F93\u5165: [\n  {\n    index: 0,\n    title: \"React 18\u65B0\u7279\u6027\u89E3\u6790\uFF1A\u5E76\u53D1\u6E32\u67D3\",\n    summary: \"React 18\u5F15\u5165\u4E86\u5E76\u53D1\u6E32\u67D3\u673A\u5236\uFF0C\u8FD9\u4E00\u7279\u6027\u5141\u8BB8React\u4E2D\u65AD\u957F\u65F6\u95F4\u8FD0\u884C\u7684\u6E32\u67D3\u4EFB\u52A1\uFF0C\u4F18\u5148\u5904\u7406\u66F4\u7D27\u6025\u7684\u66F4\u65B0\uFF0C\u4ECE\u800C\u63D0\u9AD8\u5E94\u7528\u7684\u54CD\u5E94\u901F\u5EA6\u3002\u672C\u6587\u6DF1\u5165\u63A2\u8BA8\u4E86\u5E76\u53D1\u6E32\u67D3\u7684\u5DE5\u4F5C\u539F\u7406\uFF0C\u5305\u62ECuseTransition\u548CuseDeferredValue\u94A9\u5B50\u7684\u4F7F\u7528\u3002\u540C\u65F6\uFF0C\u6587\u7AE0\u8FD8\u8BA8\u8BBA\u4E86\u5E76\u53D1\u6A21\u5F0F\u53EF\u80FD\u5E26\u6765\u7684\u6F5C\u5728\u95EE\u9898\u548C\u89E3\u51B3\u65B9\u6848\uFF0C\u4EE5\u53CA\u5B83\u5BF9React\u751F\u6001\u7CFB\u7EDF\u7684\u5F71\u54CD\u3002\u901A\u8FC7\u672C\u6587\uFF0C\u8BFB\u8005\u5C06\u4E86\u89E3\u5982\u4F55\u5728\u5B9E\u9645\u9879\u76EE\u4E2D\u6709\u6548\u5730\u5E94\u7528\u5E76\u53D1\u6E32\u67D3\u6280\u672F\u3002\"\n  },\n  {\n    index: 1,\n    title: \"2024\u5E74\u524D\u7AEF\u5F00\u53D1\u8D8B\u52BF\u9884\u6D4B\",\n    summary: \"\u672C\u6587\u5206\u6790\u4E862024\u5E74\u524D\u7AEF\u5F00\u53D1\u7684\u4E3B\u8981\u8D8B\u52BF\u3002\u9884\u8BA1WebAssembly\u5C06\u5728\u6027\u80FD\u5BC6\u96C6\u578B\u5E94\u7528\u4E2D\u53D1\u6325\u66F4\u5927\u4F5C\u7528\uFF0C\u8FB9\u7F18\u8BA1\u7B97\u6280\u672F\u5C06\u63A8\u52A8\u5206\u5E03\u5F0F\u524D\u7AEF\u67B6\u6784\u7684\u53D1\u5C55\u3002AI\u9A71\u52A8\u7684\u5F00\u53D1\u5DE5\u5177\u53EF\u80FD\u63D0\u5347\u5F00\u53D1\u6548\u7387\uFF0C\u524D\u7AEF\u6846\u67B6\u671D\u7740\u66F4\u8F7B\u91CF\u7EA7\u548C\u6A21\u5757\u5316\u65B9\u5411\u53D1\u5C55\u3002\u6B64\u5916\uFF0C\u6C89\u6D78\u5F0F\u6280\u672F\u5982AR\u548CVR\u53EF\u80FD\u5728web\u5E94\u7528\u4E2D\u5F97\u5230\u66F4\u5E7F\u6CDB\u5E94\u7528\uFF0C\u5B89\u5168\u6027\u5C06\u6210\u4E3A\u91CD\u8981\u7126\u70B9\u3002\u6587\u7AE0\u8FD8\u8BA8\u8BBA\u4E86\u8FD9\u4E9B\u8D8B\u52BF\u5BF9\u524D\u7AEF\u5F00\u53D1\u8005\u6280\u80FD\u9700\u6C42\u7684\u5F71\u54CD\u3002\"\n  },\n  {\n    index: 2,\n    title: \"\u5982\u4F55\u4F18\u5316\u5927\u578BSPA\u5E94\u7528\u7684\u52A0\u8F7D\u901F\u5EA6\",\n    summary: \"\u672C\u6587\u63A2\u8BA8\u4E86\u4F18\u5316\u5927\u578B\u5355\u9875\u5E94\u7528\uFF08SPA\uFF09\u6027\u80FD\u7684\u7B56\u7565\u3002\u4E3B\u8981\u5185\u5BB9\u5305\u62EC\uFF1A\u4F7F\u7528\u4EE3\u7801\u5206\u5272\u548C\u52A8\u6001\u5BFC\u5165\u5B9E\u73B0\u6309\u9700\u52A0\u8F7D\uFF0C\u5E94\u7528\u6811\u6447\u548Cwebpack\u914D\u7F6E\u4F18\u5316\u8D44\u6E90\uFF0C\u5B9E\u73B0\u6709\u6548\u7684\u9884\u52A0\u8F7D\u548C\u9884\u83B7\u53D6\u7B56\u7565\uFF0C\u4F18\u5316\u5BA2\u6237\u7AEF\u7F13\u5B58\uFF0C\u4EE5\u53CA\u8FD0\u884C\u65F6\u4F18\u5316\u6280\u672F\u5982\u865A\u62DF\u5217\u8868\u3002\u6587\u7AE0\u8FD8\u4ECB\u7ECD\u4E86\u670D\u52A1\u5668\u7AEF\u6E32\u67D3\uFF08SSR\uFF09\u548C\u9759\u6001\u7AD9\u70B9\u751F\u6210\uFF08SSG\uFF09\u5728\u63D0\u5347\u9996\u5C4F\u52A0\u8F7D\u901F\u5EA6\u65B9\u9762\u7684\u5E94\u7528\uFF0C\u4EE5\u53CA\u5982\u4F55\u5EFA\u7ACB\u6301\u7EED\u7684\u6027\u80FD\u76D1\u63A7\u7CFB\u7EDF\u3002\"\n  },\n  {\n    index: 3,\n    title: \"\u524D\u7AEF\u5F00\u53D1\u8005\u6700\u5E38\u72AF\u768410\u4E2A\u9519\u8BEF\",\n    summary: \"\u672C\u6587\u603B\u7ED3\u4E86\u524D\u7AEF\u5F00\u53D1\u4E2D\u6700\u5E38\u89C1\u768410\u4E2A\u9519\u8BEF\u53CA\u5176\u89E3\u51B3\u65B9\u6848\u3002\u8FD9\u4E9B\u9519\u8BEF\u5305\u62EC\u5BF9\u54CD\u5E94\u5F0F\u8BBE\u8BA1\u7684\u8BEF\u89E3\u3001\u6027\u80FD\u4F18\u5316\u4E0D\u8DB3\u3001\u5B89\u5168\u6027\u8003\u8651\u4E0D\u5468\u3001\u5FFD\u89C6\u53EF\u8BBF\u95EE\u6027\u3001\u7248\u672C\u63A7\u5236\u4F7F\u7528\u4E0D\u5F53\u3001\u4E0D\u6070\u5F53\u7684SEO\u5B9E\u8DF5\u3001\u6D4F\u89C8\u5668\u517C\u5BB9\u6027\u5904\u7406\u4E0D\u5F53\u3001\u4EE3\u7801\u7EC4\u7EC7\u6DF7\u4E71\u3001\u6D4B\u8BD5\u4E0D\u8DB3\u4EE5\u53CA\u5FFD\u89C6\u6027\u80FD\u76D1\u63A7\u548C\u7528\u6237\u4F53\u9A8C\u5206\u6790\u3002\u6587\u7AE0\u4E0D\u4EC5\u6307\u51FA\u4E86\u8FD9\u4E9B\u9519\u8BEF\uFF0C\u8FD8\u8BE6\u7EC6\u8BA8\u8BBA\u4E86\u6BCF\u4E2A\u95EE\u9898\u7684\u6210\u56E0\u548C\u6700\u4F73\u5B9E\u8DF5\uFF0C\u65E8\u5728\u5E2E\u52A9\u5F00\u53D1\u8005\u63D0\u9AD8\u4EE3\u7801\u8D28\u91CF\u548C\u9879\u76EE\u6210\u529F\u7387\u3002\"\n  },\n  {\n    index: 4,\n    title: \"JavaScript\u5F15\u64CE\u5DE5\u4F5C\u539F\u7406\u8BE6\u89E3\",\n    summary: \"\u672C\u6587\u6DF1\u5165\u5256\u6790\u4E86\u73B0\u4EE3JavaScript\u5F15\u64CE\uFF08\u5982V8\uFF09\u7684\u5DE5\u4F5C\u539F\u7406\u3002\u5185\u5BB9\u6DB5\u76D6\u4E86\u4ECE\u6E90\u7801\u5230\u6267\u884C\u7684\u6574\u4E2A\u8FC7\u7A0B\uFF0C\u5305\u62EC\u89E3\u6790\u3001\u7F16\u8BD1\u548C\u4F18\u5316\u9636\u6BB5\u3002\u91CD\u70B9\u8BB2\u89E3\u4E86JIT\u7F16\u8BD1\u3001\u5185\u8054\u7F13\u5B58\u3001\u9690\u85CF\u7C7B\u7B49\u4F18\u5316\u6280\u672F\uFF0C\u4EE5\u53CA\u5185\u5B58\u7BA1\u7406\u548C\u5783\u573E\u56DE\u6536\u673A\u5236\u3002\u6587\u7AE0\u8FD8\u63A2\u8BA8\u4E86JavaScript\u5F15\u64CE\u9762\u4E34\u7684\u6311\u6218\u548C\u672A\u6765\u53D1\u5C55\u65B9\u5411\uFF0C\u5982WebAssembly\u7684\u96C6\u6210\u3002\u901A\u8FC7\u672C\u6587\uFF0C\u8BFB\u8005\u80FD\u591F\u7406\u89E3JavaScript\u4EE3\u7801\u7684\u6267\u884C\u8FC7\u7A0B\uFF0C\u6709\u52A9\u4E8E\u7F16\u5199\u9AD8\u6027\u80FD\u4EE3\u7801\u548C\u8FDB\u884C\u6709\u6548\u7684\u6027\u80FD\u8C03\u4F18\u3002\"\n  }\n]\n\n\u8F93\u51FA: {\n  \"think\": \"\u4E3A\u4E86\u6392\u5E8F\u8FD9\u4E9B\u6587\u7AE0\uFF0C\u6211\u4F1A\u8003\u8651\u4EE5\u4E0B\u51E0\u4E2A\u65B9\u9762\uFF1A1. \u524D\u6CBF\u6280\u672F\u4FE1\u606F\uFF1A\u6587\u7AE0\u662F\u5426\u6D89\u53CA\u6700\u65B0\u7684\u524D\u7AEF\u6280\u672F\u548C\u8D8B\u52BF\u30022. \u6280\u672F\u5B9E\u8DF5\u4EF7\u503C\uFF1A\u6587\u7AE0\u662F\u5426\u63D0\u4F9B\u4E86\u53EF\u4EE5\u76F4\u63A5\u5E94\u7528\u4E8E\u5B9E\u9645\u5F00\u53D1\u7684\u77E5\u8BC6\u548C\u6280\u5DE7\u30023. \u6280\u672F\u539F\u7406\u6DF1\u5EA6\uFF1A\u6587\u7AE0\u662F\u5426\u6DF1\u5165\u89E3\u91CA\u4E86\u67D0\u4E2A\u6280\u672F\u7684\u5DE5\u4F5C\u539F\u7406\u30024. \u4FE1\u606F\u7684\u666E\u904D\u9002\u7528\u6027\uFF1A\u6587\u7AE0\u5185\u5BB9\u662F\u5426\u5BF9\u5927\u591A\u6570\u524D\u7AEF\u5F00\u53D1\u8005\u90FD\u6709\u4EF7\u503C\u3002\u57FA\u4E8E\u8FD9\u4E9B\u8003\u8651\uFF0C\u6211\u7684\u6392\u5E8F\u903B\u8F91\u5982\u4E0B\uFF1A1. 'React 18\u65B0\u7279\u6027\u89E3\u6790\uFF1A\u5E76\u53D1\u6E32\u67D3'\uFF08\u7D22\u5F150\uFF09\u5E94\u8BE5\u6392\u5728\u6700\u524D\u9762\uFF0C\u56E0\u4E3A\u5B83\u65E2\u6D89\u53CA\u524D\u6CBF\u6280\u672F\uFF08React 18\uFF09\uFF0C\u53C8\u8BE6\u7EC6\u89E3\u91CA\u4E86\u65B0\u7279\u6027\u7684\u539F\u7406\u548C\u5E94\u7528\u30022. 'JavaScript\u5F15\u64CE\u5DE5\u4F5C\u539F\u7406\u8BE6\u89E3'\uFF08\u7D22\u5F154\uFF09\u5E94\u8BE5\u6392\u7B2C\u4E8C\uFF0C\u56E0\u4E3A\u5B83\u6DF1\u5165\u89E3\u91CA\u4E86\u4E00\u4E2A\u6838\u5FC3\u6280\u672F\u7684\u5DE5\u4F5C\u539F\u7406\uFF0C\u5BF9\u63D0\u9AD8\u5F00\u53D1\u8005\u7684\u57FA\u7840\u77E5\u8BC6\u5F88\u6709\u4EF7\u503C\u30023. '\u5982\u4F55\u4F18\u5316\u5927\u578BSPA\u5E94\u7528\u7684\u52A0\u8F7D\u901F\u5EA6'\uFF08\u7D22\u5F152\uFF09\u6392\u7B2C\u4E09\uFF0C\u56E0\u4E3A\u5B83\u63D0\u4F9B\u4E86\u5B9E\u7528\u7684\u6027\u80FD\u4F18\u5316\u6280\u5DE7\uFF0C\u8FD9\u5728\u5B9E\u9645\u5F00\u53D1\u4E2D\u975E\u5E38\u91CD\u8981\u30024. '2024\u5E74\u524D\u7AEF\u5F00\u53D1\u8D8B\u52BF\u9884\u6D4B'\uFF08\u7D22\u5F151\uFF09\u6392\u7B2C\u56DB\uFF0C\u56E0\u4E3A\u5B83\u63D0\u4F9B\u4E86\u5BF9\u672A\u6765\u6280\u672F\u8D8B\u52BF\u7684\u6D1E\u5BDF\uFF0C\u867D\u7136\u5F88\u6709\u4EF7\u503C\uFF0C\u4F46\u4E0D\u5982\u524D\u4E09\u7BC7\u6587\u7AE0\u90A3\u6837\u76F4\u63A5\u9002\u7528\u4E8E\u5F53\u524D\u7684\u5F00\u53D1\u5B9E\u8DF5\u30025. '\u524D\u7AEF\u5F00\u53D1\u8005\u6700\u5E38\u72AF\u768410\u4E2A\u9519\u8BEF'\uFF08\u7D22\u5F153\uFF09\u6392\u6700\u540E\uFF0C\u56E0\u4E3A\u867D\u7136\u8FD9\u4E2A\u4E3B\u9898\u5BF9\u65B0\u624B\u5F00\u53D1\u8005\u5F88\u6709\u7528\uFF0C\u4F46\u76F8\u5BF9\u4E8E\u5176\u4ED6\u6587\u7AE0\uFF0C\u5B83\u7684\u6280\u672F\u6DF1\u5EA6\u548C\u524D\u6CBF\u6027\u8F83\u4F4E\u3002\u56E0\u6B64\uFF0C\u6700\u7EC8\u7684\u6392\u5E8F\u662F\uFF1A0, 4, 2, 1, 3\u3002\",\n  \"orders\": [0, 4, 2, 1, 3]\n}\n'''\n\u8BF7\u6CE8\u610F\uFF1A\u5B9E\u9645\u9700\u8981\u6392\u5E8F\u7684\u5185\u5BB9\u4F1A\u8FDC\u5927\u4E8E\u8FD9\u4E2A\u6848\u4F8B\uFF0C\u8BF7\u5728\u5B9E\u9645\u6392\u5E8F\u65F6\u8003\u8651\u6240\u6709\u8981\u6392\u5E8F\u5185\u5BB9\u7684\u60C5\u51B5\u3002\n\n\u8BF7\u6839\u636E\u4EE5\u4E0B\u8F93\u5165\u5185\u5BB9\u8FDB\u884C\u8F93\u51FA\uFF1A\n".concat(articleList, "\n");
            return [2 /*return*/, (0, llm_1.llmRankArticles)(prompt)];
        });
    });
}
function classifyScoresRank(articleList) {
    return __awaiter(this, void 0, void 0, function () {
        var orderArticle, scoreGeq9, scoreEq8, scoreLeq7, scoreEq8Rank, llmRankList, _i, _a, idx, targetPost, scoreLeq7Rank, llmRankList, _b, _c, idx, targetPost;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    orderArticle = [];
                    scoreGeq9 = [];
                    scoreEq8 = [];
                    scoreLeq7 = [];
                    // console.log(articleList)
                    // 分类文章
                    articleList.forEach(function (item, index) {
                        if (item.score >= 9) {
                            scoreGeq9.push(item);
                        }
                        else if (item.score === '8.00') {
                            scoreEq8.push(item);
                        }
                        else if (item.score <= 7) {
                            scoreLeq7.push(item);
                        }
                    });
                    // 添加分数 >= 9 的文章
                    orderArticle.push.apply(orderArticle, scoreGeq9);
                    // 如果已添加的文章达到限制，直接返回
                    if (orderArticle.length >= config_1.LIMIT_SEND_COUNT) {
                        orderArticle.push.apply(orderArticle, scoreEq8);
                        orderArticle.push.apply(orderArticle, scoreLeq7);
                        return [2 /*return*/, orderArticle];
                    }
                    if (!(scoreEq8.length >= config_1.LIMIT_SEND_COUNT - scoreGeq9.length)) return [3 /*break*/, 2];
                    scoreEq8Rank = scoreEq8.map(function (item, idx) { return ({ index: idx, title: item.title, summary: item.article_abstract }); });
                    return [4 /*yield*/, rankArticles(JSON.stringify(scoreEq8Rank, null, 2))];
                case 1:
                    llmRankList = _f.sent();
                    for (_i = 0, _a = (_d = llmRankList === null || llmRankList === void 0 ? void 0 : llmRankList.orders) !== null && _d !== void 0 ? _d : []; _i < _a.length; _i++) {
                        idx = _a[_i];
                        if (idx >= scoreEq8.length) {
                            console.log("Out of range: ".concat(idx, ", max: ").concat(scoreEq8.length));
                            continue;
                        }
                        targetPost = scoreEq8[idx];
                        orderArticle.push(targetPost);
                        orderArticle.push.apply(orderArticle, scoreLeq7);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    orderArticle.push.apply(orderArticle, scoreEq8);
                    scoreLeq7Rank = scoreLeq7.map(function (item, idx) { return ({ index: idx, title: item.title, summary: item.article_abstract }); });
                    return [4 /*yield*/, rankArticles(JSON.stringify(scoreLeq7Rank, null, 2))];
                case 3:
                    llmRankList = _f.sent();
                    for (_b = 0, _c = (_e = llmRankList === null || llmRankList === void 0 ? void 0 : llmRankList.orders) !== null && _e !== void 0 ? _e : []; _b < _c.length; _b++) {
                        idx = _c[_b];
                        if (idx >= scoreLeq7.length) {
                            console.log("Out of range: ".concat(idx, ", max: ").concat(scoreLeq7.length));
                            continue;
                        }
                        targetPost = scoreLeq7[idx];
                        orderArticle.push(targetPost);
                    }
                    _f.label = 4;
                case 4: return [2 /*return*/, orderArticle];
            }
        });
<<<<<<< HEAD:dist/service/rank.js
        // 添加分数 >= 9 的文章
        orderArticle.push(...scoreGeq9);
        // 如果已添加的文章达到限制，直接返回
        if (orderArticle.length >= config_1.LIMIT_SEND_COUNT) {
            orderArticle.push(...scoreEq8);
            orderArticle.push(...scoreLeq7);
            return orderArticle;
        }
        // 处理分数为 8 的文章
        if (scoreEq8.length >= config_1.LIMIT_SEND_COUNT - scoreGeq9.length) {
            const scoreEq8Rank = scoreEq8.map((item, idx) => ({ index: idx, title: item.title, summary: item.article_abstract }));
            const llmRankList = yield rankArticles(JSON.stringify(scoreEq8Rank, null, 2));
            for (const idx of (_a = llmRankList === null || llmRankList === void 0 ? void 0 : llmRankList.orders) !== null && _a !== void 0 ? _a : []) {
                if (idx >= scoreEq8.length) {
                    console.log(`Out of range: ${idx}, max: ${scoreEq8.length}`);
                    continue;
                }
                const targetPost = scoreEq8[idx];
                orderArticle.push(targetPost);
                orderArticle.push(...scoreLeq7);
            }
        }
        else {
            orderArticle.push(...scoreEq8);
            const scoreLeq7Rank = scoreLeq7.map((item, idx) => ({ index: idx, title: item.title, summary: item.article_abstract }));
            const llmRankList = yield rankArticles(JSON.stringify(scoreLeq7Rank, null, 2));
            for (const idx of (_b = llmRankList === null || llmRankList === void 0 ? void 0 : llmRankList.orders) !== null && _b !== void 0 ? _b : []) {
                if (idx >= scoreLeq7.length) {
                    console.log(`Out of range: ${idx}, max: ${scoreLeq7.length}`);
                    continue;
                }
                const targetPost = scoreLeq7[idx];
                orderArticle.push(targetPost);
            }
        }
        return orderArticle;
=======
>>>>>>> c20e142d10a99e4e2a1ff8cd0243229a427b9d70:src/service/rank.js
    });
}
