"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceList = exports.LIMIT_SEND_COUNT = void 0;
exports.LIMIT_SEND_COUNT = 5;
var SourceList = function () {
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
