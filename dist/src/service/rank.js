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
exports.classifyScoresRank = classifyScoresRank;
const llm_1 = require("../llm");
const config_1 = require("../config");
function rankArticles(articleList) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `
    # Task
你的任务是针对给定的一系列资讯做一个排序，把你觉得有意思的，有价值的信息放在前面，把信息价值低的放在后面。
对于你来说，你特别偏向于如下内容：
- 前沿技术信息动态
- 前端技术实践
- 技术原理讲解
- 干货分享

# Input Format
你会得到数组形式的资讯列表，每条资讯包含 index, title, summary 字段。
例如:
'''
[
  { index: 0, title: "xxx", summary: "xxx"},
  { index: 1, title: "xxx", summary: "xxx"},
  ...
]
'''

# Output Format
输出格式为一个可以被 JSON.parse 的 Javascript 对象，格式如下:
{
  "think": "xxx..", // 一步步思考，给出你的排序逻辑和依据
  "orders": [ .... ]  // 重新排序后的顺序，为数字数组，每个元素的内容对应输入的 index 的值。从左到右从高价值到低价值进行排序
}
请严格按照以上要求输出，不要输出其他内容。并确保输出的 orders 中包含所有传入数据的 index 值，同时保证没有重复的值。

# Example
下面是一个案例展示。
'''
输入: [
  {
    index: 0,
    title: "React 18新特性解析：并发渲染",
    summary: "React 18引入了并发渲染机制，这一特性允许React中断长时间运行的渲染任务，优先处理更紧急的更新，从而提高应用的响应速度。本文深入探讨了并发渲染的工作原理，包括useTransition和useDeferredValue钩子的使用。同时，文章还讨论了并发模式可能带来的潜在问题和解决方案，以及它对React生态系统的影响。通过本文，读者将了解如何在实际项目中有效地应用并发渲染技术。"
  },
  {
    index: 1,
    title: "2024年前端开发趋势预测",
    summary: "本文分析了2024年前端开发的主要趋势。预计WebAssembly将在性能密集型应用中发挥更大作用，边缘计算技术将推动分布式前端架构的发展。AI驱动的开发工具可能提升开发效率，前端框架朝着更轻量级和模块化方向发展。此外，沉浸式技术如AR和VR可能在web应用中得到更广泛应用，安全性将成为重要焦点。文章还讨论了这些趋势对前端开发者技能需求的影响。"
  },
  {
    index: 2,
    title: "如何优化大型SPA应用的加载速度",
    summary: "本文探讨了优化大型单页应用（SPA）性能的策略。主要内容包括：使用代码分割和动态导入实现按需加载，应用树摇和webpack配置优化资源，实现有效的预加载和预获取策略，优化客户端缓存，以及运行时优化技术如虚拟列表。文章还介绍了服务器端渲染（SSR）和静态站点生成（SSG）在提升首屏加载速度方面的应用，以及如何建立持续的性能监控系统。"
  },
  {
    index: 3,
    title: "前端开发者最常犯的10个错误",
    summary: "本文总结了前端开发中最常见的10个错误及其解决方案。这些错误包括对响应式设计的误解、性能优化不足、安全性考虑不周、忽视可访问性、版本控制使用不当、不恰当的SEO实践、浏览器兼容性处理不当、代码组织混乱、测试不足以及忽视性能监控和用户体验分析。文章不仅指出了这些错误，还详细讨论了每个问题的成因和最佳实践，旨在帮助开发者提高代码质量和项目成功率。"
  },
  {
    index: 4,
    title: "JavaScript引擎工作原理详解",
    summary: "本文深入剖析了现代JavaScript引擎（如V8）的工作原理。内容涵盖了从源码到执行的整个过程，包括解析、编译和优化阶段。重点讲解了JIT编译、内联缓存、隐藏类等优化技术，以及内存管理和垃圾回收机制。文章还探讨了JavaScript引擎面临的挑战和未来发展方向，如WebAssembly的集成。通过本文，读者能够理解JavaScript代码的执行过程，有助于编写高性能代码和进行有效的性能调优。"
  }
]

输出: {
  "think": "为了排序这些文章，我会考虑以下几个方面：1. 前沿技术信息：文章是否涉及最新的前端技术和趋势。2. 技术实践价值：文章是否提供了可以直接应用于实际开发的知识和技巧。3. 技术原理深度：文章是否深入解释了某个技术的工作原理。4. 信息的普遍适用性：文章内容是否对大多数前端开发者都有价值。基于这些考虑，我的排序逻辑如下：1. 'React 18新特性解析：并发渲染'（索引0）应该排在最前面，因为它既涉及前沿技术（React 18），又详细解释了新特性的原理和应用。2. 'JavaScript引擎工作原理详解'（索引4）应该排第二，因为它深入解释了一个核心技术的工作原理，对提高开发者的基础知识很有价值。3. '如何优化大型SPA应用的加载速度'（索引2）排第三，因为它提供了实用的性能优化技巧，这在实际开发中非常重要。4. '2024年前端开发趋势预测'（索引1）排第四，因为它提供了对未来技术趋势的洞察，虽然很有价值，但不如前三篇文章那样直接适用于当前的开发实践。5. '前端开发者最常犯的10个错误'（索引3）排最后，因为虽然这个主题对新手开发者很有用，但相对于其他文章，它的技术深度和前沿性较低。因此，最终的排序是：0, 4, 2, 1, 3。",
  "orders": [0, 4, 2, 1, 3]
}
'''
请注意：实际需要排序的内容会远大于这个案例，请在实际排序时考虑所有要排序内容的情况。

请根据以下输入内容进行输出：
${articleList}
`;
        return (0, llm_1.llmRankArticles)(prompt);
    });
}
function classifyScoresRank(articleList) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const orderArticle = [];
        const scoreGeq9 = [];
        const scoreEq8 = [];
        const scoreLeq7 = [];
        // console.log(articleList)
        // 分类文章
        articleList.forEach((item, index) => {
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
    });
}
