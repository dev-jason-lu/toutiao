import {llmArticleAbstract} from "../llm";

// 将长文本分割为一个个的相同长度的 chunk
function splitText(text: string, length: number) {
  return Array.from({ length: Math.ceil(text.length / length) }, (_, i) => {
    const start = i * length;
    return text.slice(start, start + length);
  });
}

// 单独总结某个 chunk
async function abstractChunk(chunk: string, title='') {
  const prompt = `你是一个内容抽取总结助手，你将得到一个完整博客网站的部分内容片段，并总结其中的内容。
内容片段中可能会包含无效的垃圾信息，你需要忽略其信息，并只关注和标题相关的信息。

标题：${title}
内容：<content>${chunk}</content>
内容总结 (只关注和标题相关的信息，并用中文总结):`;
  return await llmArticleAbstract(prompt);
}

const LIMIT = 3000

async function getArticleAbstract(content: string, title: string) {
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
    return await llmArticleAbstract(prompt);
  }

  const chunks = splitText(content, LIMIT);
  const chunkConcludeTasks = [];
  for (const chunk of chunks) {
    chunkConcludeTasks.push(abstractChunk(chunk));
  }
  const contentChunks = await Promise.all(chunkConcludeTasks);
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
  return await llmArticleAbstract(sumarizeChunksPrompt);
}

export { getArticleAbstract };