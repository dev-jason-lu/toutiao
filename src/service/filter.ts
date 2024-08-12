import {getSendedBlogLinks} from "../database/models/article";
import {getFilterScore} from "../llm";

const CONTNET_LIMIT = 500; // 文章内容过短，有时候也可以判定为是抓取失效得到的一些错误信息，也可以过滤一下

async function filterBlogs(blogs: any) {
    // 过滤空内容, 或者失效内容
    let filteredBlogs = blogs.filter((blog: any) =>
      blog.article_content?.trim() !== '' && blog.article_content?.trim().length > CONTNET_LIMIT
    );

    // 过滤重复内容
    filteredBlogs = removeRepeatedByLink(filteredBlogs)
    // 过滤掉已经发送过的内容
    filteredBlogs = await sendedFilter(filteredBlogs)
    return filteredBlogs
}

// 过滤重复内容, 根据 link 是否重复而判定
function removeRepeatedByLink(allNews: any) {
  const newsSet = new Set();
  const finalNews = [];
  for (const newsItem of allNews) {
    if (newsSet.has(newsItem.article_link)) {
      continue;
    }

    newsSet.add(newsItem.article_link);
    finalNews.push(newsItem);
  }

  return finalNews;
}

async function llmFilter(articleList: any) {
    const responses = await Promise.all(
        articleList.map(async (article: any) => {
          const response = await getFilterScore(article.title, article.article_content);
          return { ...article, ...response };
        })
    );
    // 如果需要排序，可以在这里启用排序逻辑
  // responses.sort((a, b) => b.score - a.score);

  // 过滤评分大于 4 的文章
    const filteredResponses = responses.filter((item: any) => item.score > 4);

    return filteredResponses;
}

// 过滤已经发送过的内容
async function sendedFilter(blogs: any) {
    try {
        const sendedBlogLinks = await getSendedBlogLinks();
        return blogs.filter((b: any) => !sendedBlogLinks.includes(b.article_link))
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

export { filterBlogs, llmFilter };