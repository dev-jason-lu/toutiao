"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceList = void 0;
const SourceList = () => {
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
exports.SourceList = SourceList;
