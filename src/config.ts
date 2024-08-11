
// 定义 SourceList 函数，返回一个 Config 对象数组
import {Config} from "./typings/config_type";

export const SourceList = (): Config[] => {
    return [
        {
            source: "csdn",
            title_selector: ".blog-text",
            page_selector: "#content_views",
            source_link: "https://blog.csdn.net/nav/web",
            list_selector: ".active-blog > .Community-item-active > .Community-item > .content > a",
        },
    ];
};