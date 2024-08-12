import axios from 'axios';
import * as cheerio from 'cheerio';
import {SourceList} from "./src/config";
import * as TurndownService from 'turndown';
const turndownService = new TurndownService();
import {filterBlogs, llmFilter} from "./src/service/filter";
import {getArticleAbstract} from "./src/service/abstract";
import {classifyScoresRank} from "./src/service/rank";
import {sendAndStoreMessages} from "./src/service/send";
import {insertClick} from "./src/service/click";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// @ts-nocheck
async function scrapePage(website: any) {
    console.log("current website is ", website.source);
    await sleep(1000);
    const response = await axios.get(website.source_link); // 获得 html
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

async function processContent(demoWebsite: any) {
    const result = (await scrapePage(demoWebsite));
    console.log(result)
    const resultContentList = await Promise.all(
        result.map(
            async item => await scrapeContent(demoWebsite, item)
        )
    );
    console.log("resultContentList", resultContentList.length)
    const filterList = await filterBlogs(resultContentList);
    console.log("filterList", filterList.length)
    const llmFilterList = await llmFilter(filterList)
    console.log("llmFilterList", llmFilterList.length);
    const abstractList = await Promise.all(
        llmFilterList.map(async (article: any) => {
            const result = await getArticleAbstract(article.article_content, article.title);
            return {...article, article_abstract: result}
        })
    )
    console.log("abstractList = ", abstractList.length)
    // 调试用
    // const abstractList = await getArticleList(8);

    const rankList = await classifyScoresRank(abstractList);
    // 发送消息&存储
    // console.log(rankList)
    const sendResult = await sendAndStoreMessages(rankList)
    if (sendResult) {
      console.log("success!");
    } else {
      console.error("fail!");
    }
}

// 入口函数
// {
//     "triggerTime": "2018-02-09T05:49:00Z",
//     "triggerName": "my_trigger",
//     "payload": "awesome-fc"
// }
export async function handler(event: any, context: any) {
    console.log("receive event: \n" + event.toString());
    const eventObj = JSON.parse(event);
    if (eventObj.triggerName === 'trigger-911a94b5') {
        const demoWebsite = SourceList()[0]!;
        await processContent(demoWebsite);
        return {code: 0, msg: 'success'}
    }
    const req = JSON.parse(event);
      if (req.body) {
        const body = JSON.parse(req.body);
        if (body.challenge) {
          return {challenge: body.challenge}
        }
        if (body.event) {
          if (body.header.event_type === "card.action.trigger") {
            const user_id = body.event.operator.user_id;
            const article_id = body.event.action.value;
            const result = await insertClick(Number(article_id), user_id);
            if (!result) {
                return {code: 1, msg: 'insertClick Fail'}
            }
            return {}
          }
          return {event: body.event}
        }
      }
    return JSON.parse(event);
}

// 立即执行的异步函数
// (async  () => {
//     await handler('{}', '')
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