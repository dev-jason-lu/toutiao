import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Define the types for the payload
interface ChatMessage {
  content: string;
  role: string;
}

interface Response {
  think?: string;
  tags?: string[];
  score?: number;
  abstract?: string;
}

interface ResponseRank {
  think?: string;
  orders?: number[];
}

interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  frequency_penalty?: number;
  max_tokens?: number;
  presence_penalty?: number;
  response_format?: {
    type: string;
  };
  stop?: string | null;
  stream?: boolean;
  stream_options?: any | null;
  temperature?: number;
  top_p?: number;
  tools?: any | null;
  tool_choice?: string;
  logprobs?: boolean;
  top_logprobs?: any | null;
}

// Define the types for the response
interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_cache_hit_tokens: number;
  prompt_cache_miss_tokens: number;
}

interface Choice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  logprobs: null | object;
  finish_reason: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
  system_fingerprint: string;
}

// Define the API call function
async function getFilterScore(title: string, content: string): Promise<Response> {
  const prompt = `
# Task
你的任务是根据需求对文章进行识别和给出是否值得阅读的打分建议。对于那些不值得阅读的文章，你会毫不犹豫的打低分。
打分的核心准则就是文章是否值得阅读，满分为 10 分 (也即打分范围是 0-10)。
打分规则如下:
- 大于 9 分为非常推荐阅读
- 5-9 分为一般推荐
- 4 分以下为不推荐阅读。

# Judging standard
以下是一些需要考虑到的文章评判标准:
- 内容的准确性：文章提供的信息是否准确无误，是否有事实性错误。
- 深度和广度：好的文章通常深入探讨主题，提供足够的背景信息和细节，同时覆盖主题的多个方面。
- 原创性和创新性：文章是否提供了独特的观点、新的见解或创新的方法。
- 逻辑性和条理性：文章的结构是否清晰，论点是否逻辑严密，信息是否有序呈现。
- 语言和表达：语言是否流畅，表达是否清晰，是否有语法错误或拼写错误。
- 可读性：文章是否易于阅读，段落是否合理划分，是否有适当的标题和小标题。
- 实用性：对于技术博客来说，文章是否提供了实用的信息、技巧或解决方案。

## Not Recommend
以下类型的文章，不推荐阅读 (满足以下任意条件的请直接给低分甚至0分):
1. 文章内容没有价值，没有干货，没有启发，对读者没有帮助，对读者没有收获
2. 对于软文，广告，或者营销等内容，不推荐阅读
3. 内容比较简单，写的没有深度，价值意义不大，不推荐阅读
4. 文章整体结构混乱，没有重点，信息量少，不推荐阅读
5. 如果只是大量的信息罗列，不推荐阅读
6. 非前端相关领域的内容，不推荐阅读

## Recommend
以下类型的文章，更为推荐阅读:
- 技术原理讲解
- 干货分享
- 技术实践

# Output Format
输出格式为一个可以被 JSON.parse 的 Javascript 对象，格式如下，不要有markdown格式:
{
  "think": "..." // 对当前文章评价的思考，这里请按照上面提供的推荐标准，一步步思考和识别文章特点，以便于作为打分依据
  "tags: ["广告", "CSS", "JS", "React", "软文", ...] // 文章标签分类，数组形式
  "score": ..., // 打分分数，范围为 0-10, 大于 9 分为非常推荐阅读
}
请严格按照以上要求输出，不要输出其他内容。

# Input
下面是待打分的文章内容:
<article>
标题: ${title}
内容: ${content}
</article>
`
  const req: ChatCompletionRequest = {
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
  const data = JSON.stringify(req);

  const config: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.deepseek.com/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer sk-48781df778c74ed59c43339195ae7487',
    },
    data,
  };

  try {
    const response: AxiosResponse<ChatCompletionResponse> = await axios(config);
    const jsonParse = response.data.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '')
    console.log(response.data.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, ''))
    return JSON.parse(jsonParse);
  } catch (error) {
    console.log('llm req fail')
    const resp: Response = {
        think: '',
        tags: [],
        score: 0,
    }
    return resp;
  }
}

async function llmArticleAbstract(prompt: string): Promise<string> {
  const req: ChatCompletionRequest = {
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
  const data = JSON.stringify(req);

  const config: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.deepseek.com/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer sk-48781df778c74ed59c43339195ae7487',
    },
    data,
  };

  try {
    const response: AxiosResponse<ChatCompletionResponse> = await axios(config);
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(error);
    throw error; // Or handle the error as needed
  }
}

async function llmRankArticles(prompt: string): Promise<ResponseRank> {
  const req: ChatCompletionRequest = {
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
  const data = JSON.stringify(req);

  const config: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.deepseek.com/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer sk-48781df778c74ed59c43339195ae7487',
    },
    data,
  };

  try {
    const response: AxiosResponse<ChatCompletionResponse> = await axios(config);
    const jsonParse = response.data.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '')
    console.log(response.data.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, ''))
    return JSON.parse(jsonParse);
  } catch (error) {
    console.log('llm req fail')
    const resp: ResponseRank = {
      think: '',
      orders: [],
    }
    return resp;
  }
}

export {getFilterScore, llmArticleAbstract, llmRankArticles};
// Example usage
// (async () => {
//   const title = 'JavaScript 中的闭包';
//   const content = '在 JavaScript 中，闭包是一种常见的编程模式……'; // Provide actual article content here
//   const response = await getFilterScore(title, content);
//   console.log(response.choices[0].message.content); // Print the assistant's message
// })();