# Toutiao 智能文章推荐系统 - 技术文档

**项目名称**: Toutiao（头条）
**项目版本**: v1.1.0
**最后更新**: 2025-11-18
**技术栈**: TypeScript + Node.js + PostgreSQL + DeepSeek LLM + 飞书API

---

## 📋 目录

1. [项目概述](#项目概述)
2. [系统架构](#系统架构)
3. [核心流程](#核心流程)
4. [模块详解](#模块详解)
5. [数据模型](#数据模型)
6. [部署架构](#部署架构)
7. [扩展功能规划](#扩展功能规划)

---

## 项目概述

### 定位与目标

**Toutiao** 是一个**智能技术文章推荐系统**，通过以下方式为用户提供高质量的技术内容：

1. 🤖 **自动采集**：每日从CSDN博客采集最新技术文章
2. 🧠 **智能评估**：利用DeepSeek LLM进行内容质量评分和理解
3. 📝 **动态总结**：自动生成精简的内容摘要
4. 🎯 **精准推荐**：基于评分和排序推荐前5篇高价值文章
5. 📊 **反馈收集**：通过飞书交互卡片记录用户点击行为

### 核心价值

- **内容质量控制**：多层次过滤机制确保推送的都是优质内容
- **用户体验优化**：精简摘要+交互式卡片提升阅读体验
- **数据驱动**：用户交互数据为后续优化提供依据

---

## 系统架构

### 2.1 整体架构图

```
┌──────────────────────────────────────────────────────────────────┐
│                      阿里云函数计算 SCF                           │
│                 (定时触发 Daily 11:00 AM)                        │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Toutiao 应用核心层                            │
├──────────────────┬──────────────────┬──────────────────────────────┤
│  数据采集层      │  智能处理层      │  推送反馈层                  │
├──────────────────┼──────────────────┼──────────────────────────────┤
│ • 网页爬虫       │ • 内容过滤       │ • 消息生成                   │
│ • 链接提取       │ • LLM评分        │ • 飞书推送                   │
│ • HTML解析       │ • 内容摘要       │ • 点击回调                   │
│                  │ • 智能排序       │ • 数据存储                   │
└──────────────────┴──────────────────┴──────────────────────────────┘
         │                  │                      │
         ▼                  ▼                      ▼
    ┌─────────┐        ┌──────────┐        ┌──────────────┐
    │  CSDN   │        │DeepSeek  │        │   飞书       │
    │ 博客    │        │   LLM    │        │ OpenAPI      │
    │ HTTP    │        │   API    │        │              │
    └─────────┘        └──────────┘        └──────────────┘
                                                    │
                                                    ▼
         ┌──────────────────────────────────┐    ┌─────────────┐
         │   PostgreSQL 数据库              │◄───│  飞书群组   │
         │  (阿里云RDS)                      │    │   消息推送  │
         │                                  │    └─────────────┘
         │ • articles 表                    │
         │ • article_clicks 表              │
         └──────────────────────────────────┘
```

### 2.2 技术栈详情

| 层级 | 技术 | 用途 |
|------|------|------|
| **语言运行时** | Node.js v24 + TypeScript | 类型安全、异步处理 |
| **HTTP请求** | axios + got-scraping | API调用、网页爬取 |
| **数据库** | PostgreSQL 15 (RDS) | 持久化存储 |
| **HTML解析** | cheerio | DOM选择器操作 |
| **文本处理** | turndown | HTML转Markdown |
| **AI模型** | DeepSeek Chat API | 智能评分、摘要、排序 |
| **消息推送** | 飞书 Open API | 群组通知、卡片消息 |
| **部署** | 阿里云函数计算 SCF | Serverless 运行 |

---

## 核心流程

### 3.1 主流程总览

```
START (每日11:00触发)
  │
  ├─► scrapePage()
  │   └─ 爬取CSDN列表页 → 获取文章链接/标题
  │
  ├─► scrapeContent()
  │   └─ 逐篇爬取内容 → HTML转Markdown
  │
  ├─► filterBlogs() [基础过滤]
  │   ├─ 长度过滤（>500字）
  │   ├─ 去重过滤（按link）
  │   └─ 已发送过滤（is_send=false）
  │
  ├─► llmFilter() [LLM过滤]
  │   ├─ 调用DeepSeek评分
  │   ├─ 提取标签
  │   └─ 筛选score > 4
  │
  ├─► getArticleAbstract() [摘要生成]
  │   ├─ 长文本分块
  │   ├─ 逐块总结
  │   └─ 最终压缩摘要
  │
  ├─► classifyScoresRank() [智能排序]
  │   ├─ 分类评分
  │   ├─ 低分重排
  │   └─ 取前5篇
  │
  ├─► sendAndStoreMessages() [发送&存储]
  │   ├─ 数据库存储
  │   ├─ 生成飞书卡片
  │   └─ 推送到群组
  │
  └─► END (返回结果)
```

### 3.2 处理流程时间复杂度

```
假设处理100篇文章：

1. 爬虫阶段        ~30-60秒
   ├─ 列表页      ~5秒
   └─ 内容爬取    ~50秒 (平均500ms/篇)

2. 过滤阶段        ~10-15秒
   ├─ 基础过滤    ~1秒 (内存操作)
   └─ LLM过滤     ~10-14秒 (DeepSeek API调用)

3. 摘要生成        ~20-30秒
   └─ DeepSeek总结 ~200-300ms/篇

4. 排序和发送      ~5秒
   └─ 排序+推送    ~1秒/篇

总耗时: 65-110秒 (约1-2分钟)
```

### 3.3 错误处理流程

```
异常处理策略：

┌─────────────────┐
│ 爬虫失败        │
├─────────────────┤
│ ├─ 网络超时     │─► 重试3次
│ ├─ 403禁止访问  │─► 记录日志
│ └─ 页面解析失败 │─► 跳过该文章
└─────────────────┘

┌─────────────────┐
│ LLM API失败     │
├─────────────────┤
│ ├─ 限流         │─► 等待后重试
│ ├─ token溢出    │─► 文本截断
│ └─ 连接超时     │─► 标记失败继续
└─────────────────┘

┌─────────────────┐
│ 数据库错误      │
├─────────────────┤
│ ├─ 连接失败     │─► 关键，中止流程
│ └─ 重复插入     │─► 捕获异常，去重
└─────────────────┘
```

---

## 模块详解

### 4.1 数据源配置模块 (config.ts)

**职责**: 管理数据源配置和爬虫参数

```typescript
// 关键配置
CSDN_LIST_URL = "https://blog.csdn.net/..."      // 列表页URL
ARTICLE_SELECTOR = ".feed-item"                  // 文章选择器
TITLE_SELECTOR = ".feed-item-title"              // 标题选择器
CONTENT_SELECTOR = ".markdown-body"              // 内容选择器
LIMIT_SEND_COUNT = 5                             // 每次推送数量
FILTER_SCORE_THRESHOLD = 4                       // LLM过滤评分
```

**可扩展性**:
- [ ] 支持多个数据源（掘金、InfoQ、Medium等）
- [ ] 动态配置管理（支持运行时修改）
- [ ] 按分类采集不同技术领域

---

### 4.2 网页爬虫模块 (index.ts)

**职责**: 采集网页数据并进行格式转换

#### 4.2.1 scrapePage() - 列表页爬取

```
输入: CSDN首页URL
处理流程:
  1. HTTP请求获取HTML
  2. Cheerio解析DOM
  3. CSS选择器提取链接和标题
  4. 去除重复链接
输出: Article[]
  {
    article_link: string
    title: string
  }
```

**核心代码逻辑**:
```typescript
const $ = cheerio.load(html);
const articles = $(ARTICLE_SELECTOR).map((_, el) => ({
  article_link: $(el).find('a').attr('href'),
  title: $(el).find(TITLE_SELECTOR).text()
})).get();
```

#### 4.2.2 scrapeContent() - 内容页爬取

```
输入: article_link[], options { timeout, headless }
处理流程:
  1. got-scraping爬取页面 (防反爬)
  2. Cheerio提取main内容区
  3. 移除垃圾标签 (script, iframe, ads)
  4. Turndown HTML→Markdown
  5. 文本清理和规范化
输出: 完整文章对象
  {
    article_link
    title
    article_content: markdown格式
    created_time
  }
```

**关键处理**:
- 移除标签: `<script>`, `<iframe>`, `<video>`, `<!-- 广告 -->`
- Markdown格式保留: 标题、代码块、列表、表格
- 文本清理: 移除多余空白和特殊字符

---

### 4.3 内容过滤模块 (filter.ts)

**职责**: 多层次过滤确保内容质量

#### 4.3.1 filterBlogs() - 基础过滤

```
过滤规则 (严格执行顺序):

1️⃣ 长度过滤
   └─ article_content.length > 500 字符
   └─ 理由: 太短的文章价值有限

2️⃣ 去重过滤
   └─ 按 article_link 去重
   └─ 理由: 防止重复推送

3️⃣ 已发送过滤
   └─ 查询数据库: WHERE article_link NOT IN (已发送列表)
   └─ 理由: 不重复推荐
```

**时间复杂度**: O(n)

#### 4.3.2 llmFilter() - LLM智能过滤

```
调用DeepSeek API:

┌──────────────────────────────────────────┐
│ Prompt: 内容质量评估                      │
│ 输入: 文章标题 + 摘要(前2000字)          │
│ 输出格式:                                │
│ {                                        │
│   "score": 8.5,        // 0-10分        │
│   "reason": "...",     // 评分理由       │
│   "tags": ["AI", ...], // 技术标签      │
│   "quality": "high"    // 质量等级      │
│ }                                        │
└──────────────────────────────────────────┘

过滤条件:
  IF score > FILTER_SCORE_THRESHOLD (4分)
    ├─ 保留该文章
    ├─ 存储tags
    └─ 存储score
  ELSE
    └─ 丢弃该文章
```

**评分维度** (由提示词定义):
- 技术深度
- 原创性
- 逻辑清晰度
- 实用价值
- 准确性

**批量优化**: 可将多篇合并成一个请求（减少API调用）

---

### 4.4 内容摘要模块 (service/abstract.ts)

**职责**: 生成精简、准确的内容摘要

#### 4.4.1 处理流程

```
┌─────────────────────────────────────┐
│ 输入: 完整文章内容 (可能>10000字)    │
└────────────────┬────────────────────┘
                 │
                 ▼
     ┌──────────────────────────┐
     │ 长度判断                 │
     └────────┬─────────┬──────┘
     短(<3000)│   中    │长(>3000)
              │(3000-6k)│
              ▼         ▼
         直接总结  分块处理
                   └─── 3000字符分块
                        │
                        ▼
                  ┌──────────────────┐
                  │ 逐块总结          │
                  │ (利用LLM)         │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │ 合并块总结        │
                  │ (拼接所有块摘要) │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │ 最终总结          │
                  │ 4句话/400字以内  │
                  └──────────────────┘
```

#### 4.4.2 具体算法

```typescript
// 伪代码
function getArticleAbstract(content: string) {
  if (content.length < 3000) {
    // 短文本: 直接总结
    return llmSummarize(content);
  }

  // 长文本: 分块处理
  const chunks = splitIntoChunks(content, 3000);
  const summaries = chunks.map(chunk => llmSummarize(chunk));

  // 合并块总结
  const mergedSummary = llmMergeSummaries(summaries);

  // 最终压缩
  const finalSummary = llmCompress(mergedSummary, {
    maxLines: 4,
    maxChars: 400
  });

  return finalSummary;
}
```

**关键参数**:
- **分块大小**: 3000字符
- **输出限制**: 4句话、400字以内
- **保留内容**: 核心观点、技术亮点、实践建议

---

### 4.5 智能排序模块 (service/rank.ts)

**职责**: 基于多个维度进行文章排序

#### 4.5.1 排序算法

```
分类规则:

输入: articles[] 含 { score, ... }

  ├─ 高质量 (score ≥ 9)
  │  └─ 保留原始排序
  │     └─ 理由: 已是优质内容
  │
  ├─ 中质量 (score = 8)
  │  └─ LLM重新评分排序
  │     └─ 理由: 精细区分，避免同分拥挤
  │
  └─ 低质量 (score ≤ 7)
     └─ LLM重新评分排序
        └─ 理由: 可能有遗漏的优质内容

最后: 取前 LIMIT_SEND_COUNT (5) 篇
```

#### 4.5.2 LLM重排提示词

```
对以下文章进行二次评分排序，考虑因素：
1. 实用性：是否解决实际问题
2. 创新性：是否包含新颖思路
3. 完整性：是否有完整的例子和代码
4. 时效性：是否涉及最新技术趋势

每篇给出 0-10 的精细分数和排序理由。
```

#### 4.5.3 排序结果

```
返回: 前5篇（按最终得分从高到低）

  [文章1] score: 9.5 (直接推送)
  [文章2] score: 8.7 (LLM重排后)
  [文章3] score: 8.2 (LLM重排后)
  [文章4] score: 7.9 (LLM重排后)
  [文章5] score: 7.1 (LLM重排后)
```

---

### 4.6 消息发送模块 (service/send.ts)

**职责**: 生成飞书卡片并推送用户交互

#### 4.6.1 飞书卡片结构

```
┌──────────────────────────────────────┐
│ 📰 文章标题 (蓝色高亮)               │
├──────────────────────────────────────┤
│ 摘要内容 (支持Markdown)              │
│ - 核心观点1                          │
│ - 核心观点2                          │
│ - 推荐原因                           │
├──────────────────────────────────────┤
│ 🏷️ 标签显示                          │
│ [AI] [LLM] [深度学习]                │
├──────────────────────────────────────┤
│ ⭐ 推荐指数: 8.5/10                   │
│ 🔗 来源: CSDN                        │
├──────────────────────────────────────┤
│ [📖 查看原文] [👍 有用] [🙅 无用]    │
└──────────────────────────────────────┘
```

#### 4.6.2 交互回调处理

```
用户点击 → 飞书回调 → 处理器

回调流程:
  1. 解析request body
  2. 验证签名 (安全校验)
  3. 识别是哪篇文章 (article_id)
  4. 识别用户 (open_id)
  5. 识别操作类型 (like/dislike/view)
  6. 记录到数据库 (article_clicks表)
  7. 返回200确认

数据库记录:
  INSERT INTO article_clicks
  (article_id, user_id, action_type, click_time)
  VALUES (...)
```

#### 4.6.3 发送流程

```
generateFeishuCard()
  └─► 生成JSON格式卡片

  ┌─────────────────────────────┐
  │ 飞书 OpenAPI                │
  │ POST /im/v1/messages        │
  │ receive_id_type: "chat_id"  │
  │ receive_id: "[群ID]"        │
  └──────────┬──────────────────┘
             │
             ▼
    消息推送成功 / 失败处理
```

---

### 4.7 数据库模型 (database/)

#### 4.7.1 articles 表

```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,

  -- 文章基本信息
  title VARCHAR(500) NOT NULL,
  article_link VARCHAR(1000) UNIQUE NOT NULL,
  article_content TEXT,
  article_abstract TEXT,

  -- LLM处理结果
  tags TEXT[] DEFAULT '{}',          -- 标签数组
  score DECIMAL(3,1),                 -- 评分 0-10

  -- 发送状态
  is_send BOOLEAN DEFAULT FALSE,      -- 是否已发送
  send_time TIMESTAMP,                -- 发送时间

  -- 时间戳
  created_time TIMESTAMP DEFAULT NOW(),
  updated_time TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_article_link ON articles(article_link);
CREATE INDEX idx_is_send ON articles(is_send);
CREATE INDEX idx_created_time ON articles(created_time DESC);
```

**字段说明**:
- `article_link`: 唯一标识，需要去重检查
- `tags`: PostgreSQL数组类型，存储["AI", "LLM"]等
- `score`: DeepSeek给出的评分
- `is_send`: 发送标记，避免重复推送

#### 4.7.2 article_clicks 表

```sql
CREATE TABLE article_clicks (
  click_id SERIAL PRIMARY KEY,

  -- 关联关系
  article_id INTEGER REFERENCES articles(id),
  user_id VARCHAR(100),              -- 飞书open_id

  -- 交互信息
  action_type VARCHAR(20),           -- 'like'/'dislike'/'view'

  -- 时间戳
  click_time TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_article_id ON article_clicks(article_id);
CREATE INDEX idx_user_id ON article_clicks(user_id);
CREATE INDEX idx_click_time ON article_clicks(click_time DESC);
```

**分析用途**:
- 统计热门文章（点击次数）
- 用户偏好分析
- 优化排序算法

#### 4.7.3 表初始化流程

```
启动应用
  │
  ▼
连接PostgreSQL
  │
  ▼
检查表是否存在
  ├─ 存在 → 使用现有表
  └─ 不存在 → 执行建表脚本
       ├─ create_articles_table.sql
       └─ create_article_clicks_table.sql
  │
  ▼
验证表结构和索引
  │
  ▼
应用就绪
```

---

### 4.8 LLM集成模块 (llm/index.ts)

**职责**: 集中管理所有DeepSeek API调用

#### 4.8.1 API配置

```typescript
// 使用参数
const config = {
  model: "deepseek-chat",
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0.7,          // 创意度 (摘要:0.7, 评分:0.3)
  maxTokens: 2048,           // 输出限制
  timeout: 30000             // API超时30秒
};
```

#### 4.8.2 核心API调用

```typescript
// 1. 评分和标签提取
getFilterScore(title: string, content: string)
  → Promise<{ score, tags, reason }>

// 2. 内容摘要
llmArticleAbstract(content: string)
  → Promise<string>

// 3. 文章排序
llmRankArticles(articles: Article[])
  → Promise<RankedArticle[]>
```

#### 4.8.3 提示词管理

```
prompts/
├── abstract.txt        # 摘要提示词
│   └─ 4句话、400字内、保留核心观点
├── filter.txt          # 评分提示词
│   └─ 0-10分评分、技术标签、质量等级
└── rank.txt            # 排序提示词
    └─ 重新评分、实用性优先

可视化视图:
rank.txt: "优先推荐解决实际问题的文章..."
         ↓
         实用性权重 > 创新性权重
         ↓
         最终排序更贴近用户需求
```

#### 4.8.4 错误处理

```
API调用异常处理:

┌─────────────────────┐
│ DeepSeek API Error  │
└────────┬────────────┘
         │
    ┌────┴────┬────────┬────────┐
    │          │        │        │
    ▼          ▼        ▼        ▼
  限流(429) 超时 token溢出 其他
    │        │      │         │
    ├─重试   ├─重试 ├─截断   └─记录日志
    │        │      │ 文本      继续处理
    └────────┴──────┘
```

---

### 4.9 飞书集成模块 (utils/feishu.ts)

**职责**: 飞书API认证和消息推送

#### 4.9.1 认证流程

```
启动时:
  1. 读取环境变量
     ├─ APP_ID
     ├─ APP_SECRET
     └─ BOT_NAME

  2. 获取tenant_access_token
     └─ POST /open-apis/auth/v3/app_access_token
     └─ 返回: { access_token, expire_in }

  3. 将token缓存 (1小时有效期)

  4. 自动刷新机制
     └─ token即将过期时，提前刷新
```

#### 4.9.2 消息推送

```
sendMessageToChat(chatId, card)

  ▼

  POST /im/v1/messages
  Headers:
    Authorization: Bearer {access_token}
    Content-Type: application/json

  Body:
    {
      "receive_id_type": "chat_id",
      "receive_id": "{chatId}",
      "msg_type": "interactive",
      "content": "{card}"  // JSON string
    }

  ▼

  response.code === 0 ?
    ├─ 成功: 返回message_id
    └─ 失败: 抛出异常
```

#### 4.9.3 回调处理

```
飞书 POST /webhook
  │
  ▼
验证签名:
  HMAC_SHA256(
    timestamp + nonce + body,
    app_secret
  ) === header['X-Lark-Request-Timestamp']

  ├─ 验证通过 → 处理事件
  └─ 验证失败 → 401拒绝

处理事件:
  ├─ message event → 解析用户点击
  └─ callback event → 异步确认
```

---

### 4.10 工具函数和辅助 (utils/)

```typescript
// 文本处理
truncateText(text, maxLength)      // 文本截断
cleanMarkdown(html)                // HTML→Markdown
splitIntoChunks(text, chunkSize)  // 分块处理

// 时间处理
formatDate(date, format)           // 格式化时间
getTimestamp()                     // 获取时间戳

// 验证处理
validateEmail(email)               // 邮箱验证
sanitizeInput(input)               // 输入清理

// 日志记录
logger.info/warn/error(msg)        // 日志记录
```

---

## 数据模型

### 5.1 完整数据流转

```
来源数据 → 处理过程 → 存储数据 → 推送数据 → 反馈数据
  │         │         │         │         │
  ├─ 标题   ├─ 爬虫   ├─ articles ├─ 飞书 ├─ 点击
  ├─ 链接   ├─ 过滤   │ table    │ card │ 反馈
  ├─ 内容   ├─ LLM    │          │      │
  └─ 作者   └─ 排序   └─ 索引    └─────┴─ 用户交互
```

### 5.2 核心实体关系

```
┌─────────────────────────────────────────────────┐
│ Articles (一篇文章)                              │
├─────────────────────────────────────────────────┤
│ id (PK)                                         │
│ title, article_link (UNIQUE)                   │
│ content, abstract                              │
│ tags, score, is_send                           │
│ created_time, updated_time                     │
└────────────────────┬────────────────────────────┘
                     │ 1:N
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ ArticleClicks (用户交互)                         │
├─────────────────────────────────────────────────┤
│ click_id (PK)                                  │
│ article_id (FK)                                │
│ user_id (飞书open_id)                          │
│ action_type (like/dislike/view)                │
│ click_time                                     │
└─────────────────────────────────────────────────┘
```

### 5.3 业务流程中的数据转换

```
阶段1: 采集
  输入: CSDN HTML
  输出: { title, link, content }

阶段2: 处理
  输入: { title, link, content }
  处理: LLM评分 + 摘要 + 排序
  输出: { title, link, abstract, tags, score }

阶段3: 存储
  输入: 处理后的文章
  存储: articles表 (is_send=false)

阶段4: 推送
  输入: 前5篇文章
  生成: 飞书卡片JSON
  输出: 推送到群组 (is_send=true)

阶段5: 反馈
  输入: 用户点击事件
  存储: article_clicks表
  用途: 用户偏好分析、反馈优化
```

---

## 部署架构

### 6.1 完整部署图

```
┌─────────────────────────────────────────────────────────┐
│ 阿里云 Serverless 环境                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐  ┌──────────┐  ┌─────────┐
    │ 函数计算  │  │   环境   │  │  触发器 │
    │ SCF     │  │ Node.js  │  │ Cron    │
    │ Handler │  │ v24      │  │ 11:00AM │
    └────┬────┘  └──────────┘  └─────────┘
         │
         ├─ 代码逻辑 (index.ts)
         ├─ 依赖: node_modules/
         └─ 环境变量: .env
              ├─ DEEPSEEK_API_KEY
              ├─ DB_HOST
              ├─ DB_PASSWORD
              ├─ FEISHU_APP_ID
              └─ FEISHU_APP_SECRET

         │
         ├──────────────────────────┬──────────────────────┬─────────────┐
         ▼                          ▼                      ▼             ▼
    ┌─────────────┐          ┌──────────────┐      ┌──────────┐   ┌──────────┐
    │ CSDN网站    │          │ DeepSeek     │      │PostgreSQL│   │飞书      │
    │ HTTP爬取    │          │ LLM API      │      │RDS 数据库 │  │OpenAPI   │
    │             │          │              │      │          │   │          │
    │ 文章列表    │          │• 评分        │      │• articles│   │• 认证    │
    │ 文章内容    │          │• 摘要        │      │• clicks  │   │• 推送    │
    │ 元数据      │          │• 排序        │      │• 索引    │   │• 回调    │
    └─────────────┘          └──────────────┘      └──────────┘   └──────────┘
```

### 6.2 环境变量配置

```bash
# .env 文件或阿里云SCF环境变量

# LLM配置
DEEPSEEK_API_KEY=sk_live_xxxxx
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com

# 数据库配置
DB_HOST=rm-xxxxx.postgres.rds.aliyuncs.com
DB_PORT=5432
DB_NAME=toutiao_db
DB_USER=postgres
DB_PASSWORD=xxxxx
DB_POOL_SIZE=10

# 飞书配置
FEISHU_APP_ID=xxxxxxxx
FEISHU_APP_SECRET=xxxxx
FEISHU_BOT_NAME=Toutiao推荐机器人
FEISHU_CHAT_ID=oc_xxxxx          # 目标群组ID

# 应用配置
NODE_ENV=production
LOG_LEVEL=info
TIMEOUT=120000                    # 函数超时120秒
```

### 6.3 构建和打包

```bash
# 本地开发
npm install
npm run build

# 构建输出
dist/
├── index.js          # 编译后的主文件
├── src/
│   ├── service/
│   ├── database/
│   ├── utils/
│   └── ...
└── node_modules/     # 依赖

# 部署到阿里云SCF
serverless deploy     # 或 aliyun fc deploy

# 触发器配置
类型: 定时触发 (Timer)
Cron表达式: 0 11 * * * (每天11:00)
时区: Asia/Shanghai
```

### 6.4 监控和日志

```
阿里云 CloudWatch / 日志服务

关键指标:
├─ 函数执行时间: < 120秒
├─ 错误率: < 1%
├─ API配额使用: < 80%
├─ 数据库连接池: 监控活跃连接

日志级别:
├─ INFO: 正常流程记录
├─ WARN: 潜在问题 (如API限流)
├─ ERROR: 异常和失败

告警规则:
├─ 函数超时 → 告警
├─ API错误率 > 5% → 告警
├─ 数据库连接失败 → 告警
```

---

## 扩展功能规划

### 7.1 短期扩展（1-2个月）

#### 7.1.1 多数据源支持

**当前**: 仅支持CSDN
**目标**: 支持多个技术社区

```
计划添加:
├─ 掘金 (juejin.cn)
│  ├─ 前端技术
│  ├─ Node.js
│  └─ 全栈开发
├─ InfoQ (infoq.cn)
│  ├─ 深度文章
│  └─ 大咖观点
├─ Medium (medium.com)
│  ├─ 英文技术文章
│  └─ 国际视野
└─ GitHub Trending
   ├─ 项目介绍
   └─ 开源动态

实现方式:
├─ 创建 IDataSource 接口
├─ 为每个源实现 DataSourceAdapter
├─ 配置文件驱动源管理
└─ 支持动态启用/禁用

代码结构:
src/
├── sources/
│   ├── IDataSource.ts (接口)
│   ├── csdn.ts
│   ├── juejin.ts
│   ├── infoq.ts
│   ├── medium.ts
│   └── github.ts
└── config/
    └── sources.config.ts
```

**预计工作量**: 80小时

---

#### 7.1.2 内容分类系统

**当前**: 无分类，全量推送
**目标**: 按技术领域分类推送

```
分类维度:
├─ 后端 (Java/Python/Go)
├─ 前端 (React/Vue/Angular)
├─ 移动 (iOS/Android)
├─ DevOps (Docker/K8s/CI/CD)
├─ AI/ML (深度学习/NLP/CV)
├─ 数据库 (SQL/NoSQL/缓存)
├─ 架构 (系统设计/微服务)
└─ 其他

实现流程:
  1. 扩展articles表
     ├─ ADD COLUMN category VARCHAR(50)
     ├─ ADD COLUMN subcategory VARCHAR(50)
     └─ ADD INDEX idx_category

  2. LLM分类器
     ├─ 新增 classifyArticle() 函数
     ├─ 提示词: 请将文章分类到...
     └─ 返回: { category, subcategory, confidence }

  3. 按类别推送
     ├─ 为每个分类创建独立飞书群组
     ├─ 只推送相关分类的文章
     └─ 支持订阅选择

数据库变更:
articles {
  + category: 'backend' | 'frontend' | ...
  + subcategory: 'java' | 'python' | ...
  + confidence: 0.95 (分类置信度)
}
```

**预计工作量**: 60小时

---

#### 7.1.3 用户反馈系统增强

**当前**: 仅记录点击
**目标**: 完整的反馈和评分系统

```
新增功能:
├─ 👍 点赞 / 👎 点踩
├─ ⭐ 5星评分
├─ 💬 文本评论
└─ 🔖 收藏和分享

扩展表结构:
article_feedbacks {
  feedback_id: serial
  article_id: integer
  user_id: string
  rating: 1-5         -- 评分
  comment: text       -- 评论
  tags: text[]        -- 标签 (有用/深度/过时)
  created_time
  updated_time
}

反馈统计查询:
SELECT
  article_id,
  AVG(rating) as avg_rating,
  COUNT(*) as feedback_count,
  array_agg(DISTINCT tags) as top_tags
FROM article_feedbacks
GROUP BY article_id
ORDER BY feedback_count DESC;

用途:
├─ 优化LLM排序算法 (反馈作为微调数据)
├─ 显示文章热度指标
├─ 改进推荐精准度
└─ 用户信任度提升
```

**预计工作量**: 40小时

---

### 7.2 中期扩展（2-3个月）

#### 7.2.1 个性化推荐引擎

**当前**: 固定推荐方式
**目标**: 根据用户偏好个性化推荐

```
实现思路:

┌─────────────────────────────────────┐
│ 用户行为分析                         │
├─────────────────────────────────────┤
│ 1. 用户浏览历史                     │
│    └─ 保存用户看过的所有文章        │
│                                     │
│ 2. 用户兴趣标签                     │
│    └─ 根据点赞文章的标签提取兴趣   │
│                                     │
│ 3. 用户偏好模型                     │
│    └─ 建立 user_preferences 表      │
│       { user_id, tags[], weights }  │
└─────────────────────────────────────┘

个性化排序:

  基础分数 + 用户偏好权重 + 协同过滤 = 最终排序

  user_score = base_score * (1 + preference_boost)

  其中:
    base_score: LLM评分 (0-10)
    preference_boost: 用户偏好加成 (-0.5 ~ 0.5)

  示例:
    用户喜欢AI文章 → boost = 0.3
    用户不喜欢运维文章 → boost = -0.2

存储结构:
users {
  user_id: string (飞书open_id)
  preferences: {
    tags: { 'AI': 0.8, 'Java': 0.5, ... }
    disliked_tags: { 'DevOps': -0.3 }
  }
  last_activity: timestamp
}

user_read_history {
  user_id: string
  article_id: integer
  read_time: timestamp
  time_spent: integer (秒)  -- 停留时长
  rating: 1-5
}
```

**新增表**:
```sql
-- 用户表
CREATE TABLE users (
  user_id VARCHAR(100) PRIMARY KEY,
  open_id VARCHAR(100),
  name VARCHAR(200),
  preferences JSONB,
  created_time TIMESTAMP,
  last_active TIMESTAMP
);

-- 阅读历史
CREATE TABLE user_read_history (
  history_id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  article_id INTEGER,
  read_time TIMESTAMP,
  time_spent INTEGER,
  rating INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (article_id) REFERENCES articles(id)
);
```

**算法伪代码**:
```typescript
function calculatePersonalizedScore(
  article: Article,
  userPreferences: UserPreference
): number {
  const baseScore = article.score;  // 0-10

  // 计算标签匹配度
  const tagMatch = article.tags.reduce((sum, tag) => {
    const weight = userPreferences.tags[tag] || 0;
    return sum + weight;
  }, 0) / article.tags.length;

  // 规范化 (-0.5 ~ 0.5)
  const boost = Math.max(-0.5, Math.min(0.5, tagMatch));

  // 最终分数
  return baseScore * (1 + boost);
}
```

**预计工作量**: 120小时

---

#### 7.2.2 智能摘要和内容生成

**当前**: LLM摘要
**目标**: 多种形式的内容产物

```
新增产物:

1. 思维导图 (MindMap)
   └─ LLM生成JSON格式思维导图
   └─ 前端渲染可视化

2. 关键要点提取 (Key Points)
   ├─ 核心观点提取 (3-5个)
   ├─ 实践建议 (2-3个)
   └─ 学习资源链接

3. Q&A生成
   └─ 根据文章内容自动生成常见问题和答案
   └─ 帮助快速理解

4. 代码片段提取
   ├─ 自动识别和提取代码示例
   ├─ 按语言分类
   └─ 代码高亮

实现方式:
┌────────────────────────────────────┐
│ 原文章内容                          │
└──────────────┬─────────────────────┘
               │
      ┌────────┴────────┐
      │ LLM并行处理     │
      │ (多个提示词)     │
      │                 │
┌─────┴──────┬────────┬─────────┐
│            │        │         │
▼            ▼        ▼         ▼
摘要        思维导图  Q&A      代码片段
│            │        │         │
└────────────┴────────┴─────────┘
             │
             ▼
         article_enriched {
           abstract
           mindmap
           qa_pairs[]
           code_snippets[]
         }
```

**数据库扩展**:
```sql
ALTER TABLE articles ADD COLUMN (
  mindmap JSONB,
  key_points TEXT[],
  qa_pairs JSONB,
  code_snippets JSONB
);
```

**飞书卡片展示**:
```
原有:
  标题 + 摘要 + 标签

新增:
  标题 + 摘要 + 关键点 + 思维导图预览 + 标签 + 按钮

  按钮:
    [查看全文] [思维导图] [Q&A] [代码示例]
```

**预计工作量**: 100小时

---

#### 7.2.3 内容质量评估系统

**当前**: LLM单维度评分
**目标**: 多维度质量评估和报告

```
评估维度:

1. 技术深度 (Depth)
   ├─ 1-3分: 入门科普
   ├─ 4-6分: 中级应用
   └─ 7-10分: 高深研究

2. 实用性 (Usefulness)
   ├─ 是否有代码示例
   ├─ 是否有实战建议
   └─ 是否解决实际问题

3. 原创性 (Originality)
   ├─ 是否全网独家观点
   ├─ 是否引用了多个源
   └─ 是否有新颖见解

4. 表达清晰度 (Clarity)
   ├─ 逻辑是否清晰
   ├─ 语言是否规范
   └─ 结构是否合理

5. 时效性 (Timeliness)
   ├─ 涉及最新技术吗?
   ├─ 技术是否过时?
   └─ 发布时间相关度

评估结果存储:
```sql
article_quality_metrics {
  article_id
  depth_score: 1-10
  usefulness_score: 1-10
  originality_score: 1-10
  clarity_score: 1-10
  timeliness_score: 1-10
  overall_score: average of above
  evaluation_details: {
    strengths: [],
    weaknesses: [],
    recommendations: []
  }
  evaluated_time
}
```

**质量报告**:
```
┌──────────────────────────────────────┐
│ 📊 文章质量评估报告                   │
├──────────────────────────────────────┤
│ 总体评分: ★★★★★ (8.5/10)            │
│                                      │
│ 详细评分:                             │
│  • 技术深度: ★★★★☆ (8)              │
│  • 实用性: ★★★★★ (9)                │
│  • 原创性: ★★★☆☆ (7)                │
│  • 表达清晰: ★★★★★ (9)              │
│  • 时效性: ★★★★☆ (8)                │
│                                      │
│ 优势:                                 │
│  ✓ 代码示例丰富                       │
│  ✓ 逻辑层次清晰                       │
│  ✓ 涉及最新技术                       │
│                                      │
│ 不足:                                 │
│  ✗ 部分观点缺乏引证                   │
│  ✗ 性能测试数据较少                   │
│                                      │
│ 推荐阅读人群:                         │
│  • 中高级开发者                       │
│  • 要素学习深度技术                   │
│  • 准备系统升级的架构师                │
└──────────────────────────────────────┘
```

**预计工作量**: 80小时

---

### 7.3 长期扩展（3-6个月）

#### 7.3.1 AI学习助手集成

**目标**: 将推荐内容转化为主动学习计划

```
功能:
├─ 学习路径规划
│  ├─ 根据用户技能等级制定学习路径
│  ├─ 将相关文章组织成课程
│  └─ 提供学习进度追踪
│
├─ 知识图谱
│  ├─ 自动构建技术知识图谱
│  ├─ 识别文章之间的关联
│  └─ 推荐相关阅读

├─ 交互式学习
│  ├─ 生成练习题
│  ├─ 提供代码笔记功能
│  └─ 同步学习笔记

└─ 学习统计
   ├─ 学习时间统计
   ├─ 掌握度评估
   └─ 进度可视化

实现:
┌──────────────────────────────┐
│ 知识图谱构建                   │
│                              │
│ 文章A → 标签: AI/LLM        │
│ 文章B → 标签: LLM/微调      │
│ 文章C → 标签: 微调/LoRA     │
│                              │
│ 关系: A → B → C (学习链)    │
└──────────────────────────────┘

推荐学习路径:
入门者: A(基础) → B(进阶) → C(实战)
进阶者: B → C → [相关文章]
```

**新表**:
```sql
-- 学习课程
learning_courses {
  course_id
  course_name
  description
  prerequisites
  articles: integer[]  -- 文章ID列表
  order: integer[]     -- 推荐顺序
}

-- 用户学习进度
user_learning_progress {
  user_id
  course_id
  current_article_index
  completed_articles: integer[]
  progress_percentage
  last_updated
}

-- 知识图谱
knowledge_graph {
  node_id
  concept: string      -- 概念名称
  articles: integer[]  -- 相关文章
  related_concepts: string[] -- 相关概念
}
```

**预计工作量**: 150小时

---

#### 7.3.2 社区和协作功能

**目标**: 将推荐平台转变为学习社区

```
新功能:
├─ 用户评论和讨论
│  ├─ 文章下的评论区
│  ├─ 用户讨论线程
│  └─ 标记有用评论

├─ 推荐和分享
│  ├─ 用户可推荐文章给其他人
│  ├─ 分享学习笔记
│  └─ 建立学习小组

├─ 贡献者系统
│  ├─ 文章提交平台
│  ├─ 社区审核机制
│  └─ 贡献者排行榜

└─ 通知和互动
   ├─ @ 提及功能
   ├─ 赞赏和奖励
   └─ 实时通知

表结构:
comments {
  comment_id
  article_id
  user_id
  content
  likes_count
  created_time
  updated_time
  parent_comment_id  -- 回复
}

recommendations {
  recommendation_id
  article_id
  from_user_id
  to_user_id
  recommendation_reason
  accepted: boolean
}
```

**预计工作量**: 200小时

---

#### 7.3.3 高级分析和洞察

**目标**: 为平台管理员提供数据驱动的洞察

```
分析维度:

1. 技术趋势分析
   ├─ 热门技术词汇统计
   ├─ 技术热度变化趋势
   └─ 新兴技术识别

2. 用户行为分析
   ├─ 用户活跃度统计
   ├─ 用户兴趣分布
   ├─ 用户留存分析
   └─ 用户转化漏斗

3. 内容质量分析
   ├─ 文章流行度vs质量关系
   ├─ 来源质量排名
   ├─ 重复率和去重效果
   └─ LLM评分准确性校准

4. 推荐效果评估
   ├─ 点击率 (CTR)
   ├─ 平均阅读时长
   ├─ 用户满意度
   └─ 推荐命中率

仪表板示例:
┌─────────────────────────────────────┐
│ 📊 系统分析仪表板                     │
├─────────────────────────────────────┤
│ 周统计:                              │
│  • 新文章: 156篇                     │
│  • 推送成功: 145篇                   │
│  • 平均点击率: 32%                   │
│  • 用户满意度: 4.3/5                │
│                                     │
│ 热门技术 (本周):                     │
│  1. AI/LLM ↑↑↑ (热度+45%)           │
│  2. React 18 ↑ (热度+12%)            │
│  3. Go 并发 → (热度持平)             │
│  4. Docker 5 ↓ (热度-8%)             │
│                                     │
│ 来源排名 (质量评分):                  │
│  1. 阿里技术 (8.2/10)               │
│  2. 美团技术 (8.0/10)               │
│  3. 字节技术 (7.8/10)               │
│                                     │
│ 推荐效果:                             │
│  • CTR: 32.5% (上周: 28%)            │
│  • 平均阅读: 3.2分钟 (目标: 3分钟) │
└─────────────────────────────────────┘

实现技术:
├─ 数据仓库 (DW)
├─ ELT 管道
├─ BI 工具集成 (Metabase/Tableau)
└─ 实时指标聚合
```

**预计工作量**: 200小时

---

### 7.4 扩展功能优先级矩阵

| 优先级 | 功能 | 工作量 | 价值度 | 实现周期 |
|--------|------|--------|---------|----------|
| 🔴 P0 | 多数据源支持 | 80h | ⭐⭐⭐⭐⭐ | 4周 |
| 🔴 P0 | 内容分类系统 | 60h | ⭐⭐⭐⭐⭐ | 3周 |
| 🟠 P1 | 用户反馈增强 | 40h | ⭐⭐⭐⭐ | 2周 |
| 🟠 P1 | 个性化推荐 | 120h | ⭐⭐⭐⭐⭐ | 6周 |
| 🟠 P1 | 内容富化 | 100h | ⭐⭐⭐⭐ | 5周 |
| 🟡 P2 | 质量评估系统 | 80h | ⭐⭐⭐ | 4周 |
| 🟡 P2 | 学习助手 | 150h | ⭐⭐⭐⭐ | 8周 |
| 🟡 P2 | 社区功能 | 200h | ⭐⭐⭐⭐ | 10周 |
| 🟢 P3 | 高级分析 | 200h | ⭐⭐⭐ | 10周 |

**推荐实施顺序**:
1. **第1阶段** (1月): P0功能 (多源 + 分类) → 扩大内容面
2. **第2阶段** (2月): P1功能 (反馈 + 个性化) → 提升体验
3. **第3阶段** (3月): P1功能续 (内容富化) → 增强质量
4. **第4阶段** (4-5月): P2功能 (分析 + 学习) → 提升价值

---

## 总结

### 8.1 项目核心特点

1. **端到端自动化**: 从采集到推送的完整管道
2. **AI驱动**: 深度整合LLM进行智能评估和排序
3. **用户反馈闭环**: 通过交互收集数据反馈优化
4. **Serverless架构**: 无需运维，成本低廉
5. **可扩展设计**: 为后续扩展预留了充分接口

### 8.2 关键技术成就

- ✅ 多层次内容过滤确保质量
- ✅ 动态长文本摘要算法
- ✅ LLM驱动的智能排序
- ✅ 飞书富文本交互卡片
- ✅ PostgreSQL关系数据建模
- ✅ 定时Serverless调度

### 8.3 未来演进方向

```
现状: 内容推荐平台
  ↓
阶段1: 智能推荐平台 (个性化/分类)
  ↓
阶段2: 学习协作平台 (社区/知识图谱)
  ↓
阶段3: AI学习生态 (从推荐到深度学习)
```

---

**文档完成时间**: 2025-11-18
**版本**: 1.0
**维护者**: [Your Name]

