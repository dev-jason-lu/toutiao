import axios from 'axios';
import * as cheerio from 'cheerio';
import {SourceList} from "./src/config";
import TurndownService from 'turndown';
const turndownService = new TurndownService();
import {filterBlogs, llmFilter} from "./src/service/filter";
import {getArticleAbstract} from "./src/service/abstract";
import {classifyScoresRank} from "./src/service/rank";
import {sendAndStoreMessages} from "./src/service/send";
import {insertClick} from "./src/service/click";

/**
 * 延迟执行函数
 * 
 * 用于在异步操作之间添加延迟，避免请求过于频繁。
 * 
 * @param ms - 延迟时间（毫秒）
 * @returns {Promise<void>} 延迟完成后resolve的Promise
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 爬取网页文章列表
 * 
 * 从指定的网站爬取文章列表，提取文章标题和链接。
 * 会自动清理HTML中的不必要标签，根据配置的选择器提取信息。
 * 
 * @param website - 网站配置对象，包含源链接、选择器等信息
 * @returns {Promise<Array<{title: string, article_link: string}>>} 返回文章列表数组
 * @throws 当网络请求失败或HTML解析失败时抛出错误
 */
async function scrapePage(website: any): Promise<Array<{title: string, article_link: string | undefined}>> {
    console.log("current website is ", website.source);
    await sleep(1000);
    const response = await axios.get(website.source_link); // 获得 html
    
    // 验证响应数据
    if (!response.data) {
      throw new Error(`获取网页内容失败：${website.source_link} 返回空数据`);
    }
    const $ = cheerio.load(response.data as string);

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
    const links = $(website.list_selector)
    // 遍历并分离出 link 和 title
    return links.toArray().map((linkElem) => {
        const elem = $(linkElem);

        // 从 a 标签中找到 span 元素
        const titleElem = elem.find(website.title_selector);
        const title = titleElem.text().trim();

        return {
            title: title,
            article_link: elem.attr("href")?.trim()
        };
    });
}

/**
 * 爬取文章内容
 * 
 * 从指定URL爬取文章的详细内容，将HTML转换为Markdown格式。
 * 会自动清理HTML中的不必要标签，提取主要内容。
 * 
 * @param website - 网站配置对象，包含页面选择器等信息
 * @param item - 文章对象，包含文章链接等信息
 * @returns {Promise<any>} 返回包含文章内容的文章对象
 * @throws 当网络请求失败或内容解析失败时抛出错误
 */
async function scrapeContent(website: any, item: any): Promise<any> {
    try {
        const response = await axios.get(item?.article_link ?? '');
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
        const markdown = turndownService.turndown(page ?? '');

        return {
            ...item,
            article_content: markdown,
        };
    } catch (error) {
        console.error('Error scraping content:', error);
        throw error;
    }
}

/**
 * 处理文章内容流程
 * 
 * 完整的文章处理流程，包括：
 * 1. 爬取文章列表
 * 2. 爬取文章内容
 * 3. 过滤文章
 * 4. LLM智能过滤
 * 5. 生成文章摘要
 * 6. 文章评分排序
 * 7. 发送消息和存储数据
 * 
 * @param demoWebsite - 网站配置对象
 * @returns {Promise<void>} 异步执行完成
 */
async function processContent(demoWebsite: any) {
    const result = (await scrapePage(demoWebsite));
    console.log(result)
    // 爬取文章内容
    const resultContentList = await Promise.all(
        result.map(
            async item => await scrapeContent(demoWebsite, item)
        )
    );
    console.log("✅ 文章内容爬取完成，共", resultContentList.length, "篇文章");
    
    // 基础过滤
    const filterList = await filterBlogs(resultContentList);
    console.log("✅ 基础过滤完成，剩余", filterList.length, "篇文章");
    
    // LLM智能过滤
    const llmFilterList = await llmFilter(filterList)
    console.log("✅ LLM过滤完成，剩余", llmFilterList.length, "篇文章");
    
    // 生成文章摘要
    const abstractList = await Promise.all(
        llmFilterList.map(async (article: any) => {
            const result = await getArticleAbstract(article.article_content, article.title);
            return {...article, article_abstract: result}
        })
    )
    console.log("✅ 摘要生成完成，共", abstractList.length, "篇文章");
    
    // 文章评分排序
    const rankList = await classifyScoresRank(abstractList);
    console.log("✅ 文章评分排序完成");
    
    // 发送消息和存储数据
    const sendResult = await sendAndStoreMessages(rankList)
    if (sendResult) {
      console.log("✅ 消息发送和数据存储成功");
    } else {
      console.error("❌ 消息发送或数据存储失败");
    }
}

// 入口函数
// {
//     "triggerTime": "2018-02-09T05:49:00Z",
//     "triggerName": "my_trigger",
//     "payload": "awesome-fc"
// }
/**
 * 云函数入口处理函数
 * 
 * 处理阿里云函数计算的事件触发，支持多种事件类型：
 * 1. 定时触发器 - 执行文章爬取和处理流程
 * 2. 飞书卡片交互 - 处理用户点击事件
 * 3. 飞书验证请求 - 处理验证挑战
 * 
 * @param event - 事件对象，包含触发信息
 * @param context - 函数计算上下文对象
 * @returns {Promise<any>} 返回处理结果
 */
export async function handler(event: any, context: any) {
    console.log("📨 接收到事件: \n" + event.toString());
    
    try {
      const eventObj = JSON.parse(event);
      
      // 处理定时触发器事件
      if (eventObj.triggerName === 'trigger-911a94b5') {
        console.log("⏰ 定时触发器激活，开始执行文章爬取任务");
        const demoWebsite = SourceList()[0]!;
        await processContent(demoWebsite);
        console.log("✅ 定时任务执行完成");
        return {code: 0, msg: 'success'}
      }
      
      // 处理飞书事件
      const req = JSON.parse(event);
      if (req.body) {
        const body = JSON.parse(req.body);
        
        // 处理飞书验证请求
        if (body.challenge) {
          console.log("🔐 飞书验证请求处理");
          return {challenge: body.challenge}
        }
        
        // 处理飞书卡片交互事件
        if (body.event) {
          if (body.header.event_type === "card.action.trigger") {
            console.log("👆 飞书卡片点击事件处理");
            const open_id = body.event.operator.open_id;
            const article_id = body.event.action.value;
            const result = await insertClick(Number(article_id), open_id);
            if (!result) {
              console.error("❌ 点击记录插入失败");
              return {code: 1, msg: 'insertClick Fail'}
            }
            console.log("✅ 点击记录插入成功");
            return {}
          }
          return {event: body.event}
        }
      }
      
      console.log("⚠️ 未识别的事件类型");
      return JSON.parse(event);
      
    } catch (error) {
      console.error("❌ 事件处理失败:", error);
      return {code: 1, msg: 'Event processing failed'}
    }
}

/**
 * 测试函数（已注释）
 * 
 * 用于本地测试的立即执行函数，可以手动取消注释进行调试。
 * 测试时传入空的事件和上下文对象。
 */
// (async  () => {
//     console.log("🧪 开始本地测试");
//     await handler('{}', '');
//     console.log("✅ 本地测试完成");
// })();

/**
 * 文件写入功能（已注释）
 * 
 * 用于将Markdown内容写入文件的示例代码，
 * 可以在需要时取消注释使用。
 */
// const filePath = './output.md';
// fs.writeFile(filePath, markdown, (err) => {
//   if (err) {
//     console.error(`❌ 文件写入失败: ${err}`);
//   } else {
//     console.log(`✅ Markdown文件已保存到: ${filePath}`);
//   }
// });