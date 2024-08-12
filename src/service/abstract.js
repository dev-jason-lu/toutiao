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
exports.getArticleAbstract = getArticleAbstract;
const llm_1 = require("../llm");
// 将长文本分割为一个个的相同长度的 chunk
function splitText(text, length) {
    return Array.from({ length: Math.ceil(text.length / length) }, (_, i) => {
        const start = i * length;
        return text.slice(start, start + length);
    });
}
// 单独总结某个 chunk
function abstractChunk(chunk_1) {
    return __awaiter(this, arguments, void 0, function* (chunk, title = '') {
        const prompt = `你是一个内容抽取总结助手，你将得到一个完整博客网站的部分内容片段，并总结其中的内容。
内容片段中可能会包含无效的垃圾信息，你需要忽略其信息，并只关注和标题相关的信息。

标题：${title}
内容：<content>${chunk}</content>
内容总结 (只关注和标题相关的信息，并用中文总结):`;
        return yield (0, llm_1.llmArticleAbstract)(prompt);
    });
}
const LIMIT = 3000;
function getArticleAbstract(content, title) {
    return __awaiter(this, void 0, void 0, function* () {
        if (content.length < LIMIT) {
            const prompt = `
摘要内容要求:
- 最终一定是用中文进行总结
- 摘要的内容要简洁清晰, 直击重点
- 摘要内容不要太啰嗦，无论多长的内容，摘要内容字数都会在 4 句话以内，不超过 400 字

文章标题：${title}
文章内容(用 <article>...</article> 元素包裹):
<article>
${content}
</article>

摘要信息 (要求摘要为中文):`;
            return yield (0, llm_1.llmArticleAbstract)(prompt);
        }
        const chunks = splitText(content, LIMIT);
        const chunkConcludeTasks = [];
        for (const chunk of chunks) {
            chunkConcludeTasks.push(abstractChunk(chunk));
        }
        const contentChunks = yield Promise.all(chunkConcludeTasks);
        const sumarizeChunksPrompt = `以下是一篇博客文章的标题，以及博客文章的各个部分的内容总结，你需要根据这些信息整理成一份摘要。
标题：${title}
文章各部分的内容总结(用 <article_chunks>...</article_chunks> 包裹):
<article_chunks>
${contentChunks.join("\n----\n")}
</article_chunks>

摘要内容要求:
- 最终一定是用中文进行总结
- 摘要的内容要简洁清晰, 直击重点
- 摘要内容不要太啰嗦，无论多长的内容，摘要内容字数都会在 4 句话以内，不超过 400 字

摘要信息 (要求摘要为中文):`;
        return yield (0, llm_1.llmArticleAbstract)(sumarizeChunksPrompt);
    });
}
