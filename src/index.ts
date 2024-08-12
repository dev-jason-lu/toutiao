import axios from 'axios';
import * as cheerio from 'cheerio';
import {SourceList} from "./config";
import TurndownService from 'turndown';
const turndownService = new TurndownService();
import {filterBlogs, llmFilter} from "./service/filter";
import {getArticleAbstract} from "./service/abstract";
import {createArticle, getArticleList} from "./database/models/article";
import {classifyScoresRank} from "./service/rank";
import {sendAndStoreMessages} from "./service/send";

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
export async function handler(event: any, context: any) {
    console.log("receive event: \n" + event.toString());
    const demoWebsite = SourceList()[0]!;
    await processContent(demoWebsite);
}

// 立即执行的异步函数
// (async  () => {
//     const demoWebsite = SourceList()[0]!;
//     await processContent(demoWebsite);
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