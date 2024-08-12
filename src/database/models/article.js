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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArticle = createArticle;
exports.getArticle = getArticle;
exports.updateArticle = updateArticle;
exports.deleteArticle = deleteArticle;
exports.getSendedBlogLinks = getSendedBlogLinks;
exports.getArticleList = getArticleList;
var db_1 = require("../db"); // 引入数据库连接池
// 创建文章
function createArticle(article) {
    return __awaiter(this, void 0, void 0, function () {
        var title, article_link, article_abstract, article_content, tags, score, is_send, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    title = article.title, article_link = article.article_link, article_abstract = article.article_abstract, article_content = article.article_content, tags = article.tags, score = article.score, is_send = article.is_send;
                    return [4 /*yield*/, db_1.default.query('INSERT INTO articles (title, article_link, article_abstract, article_content, tags, score, is_send) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (article_link) DO UPDATE SET is_send = EXCLUDED.is_send RETURNING id', [title, article_link, article_abstract, article_content, tags, score, is_send])];
                case 1:
                    result = _a.sent();
                    // 如果插入成功，则返回新插入的记录的 id，否则返回 null
                    return [2 /*return*/, result.rows[0].id];
            }
        });
    });
}
// 查询文章
function getArticle(id) {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.default.query('SELECT * FROM articles WHERE id = $1', [id])];
                case 1:
                    rows = (_a.sent()).rows;
                    return [2 /*return*/, rows.length > 0 ? rows[0] : null];
            }
        });
    });
}
// 查询文章列表
function getArticleList(score) {
    return __awaiter(this, void 0, void 0, function () {
        var rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.default.query('SELECT * FROM articles WHERE score = $1', [score])];
                case 1:
                    rows = (_a.sent()).rows;
                    return [2 /*return*/, rows.length > 0 ? rows : []];
            }
        });
    });
}
// 更新文章
function updateArticle(id, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var title, article_link, article_abstract, article_content, tags, score, is_send, query, values, setClause;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    title = updates.title, article_link = updates.article_link, article_abstract = updates.article_abstract, article_content = updates.article_content, tags = updates.tags, score = updates.score, is_send = updates.is_send;
                    query = 'UPDATE articles SET ';
                    values = [];
                    setClause = '';
                    if (title !== undefined) {
                        setClause += 'title = $1, ';
                        values.push(title);
                    }
                    if (article_link !== undefined) {
                        setClause += 'article_link = $2, ';
                        values.push(article_link);
                    }
                    if (article_abstract !== undefined) {
                        setClause += 'article_abstract = $3, ';
                        values.push(article_abstract);
                    }
                    if (article_content !== undefined) {
                        setClause += 'article_content = $4, ';
                        values.push(article_content);
                    }
                    if (tags !== undefined) {
                        setClause += 'tags = $5, ';
                        values.push(tags);
                    }
                    if (score !== undefined) {
                        setClause += 'score = $6, ';
                        values.push(score);
                    }
                    if (is_send !== undefined) {
                        setClause += 'is_send = $7, ';
                        values.push(is_send);
                    }
                    setClause = setClause.slice(0, -2); // Remove the trailing comma and space
                    query += setClause + ' WHERE id = $8';
                    values.push(id);
                    return [4 /*yield*/, db_1.default.query(query, values)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// 删除文章
function deleteArticle(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.default.query('DELETE FROM articles WHERE id = $1', [id])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// 查询已发送的文章链接
function getSendedBlogLinks() {
    return __awaiter(this, void 0, void 0, function () {
        var rows, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db_1.default.query('SELECT article_link FROM articles WHERE is_send = true;')];
                case 1:
                    rows = (_a.sent()).rows;
                    return [2 /*return*/, rows];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching sended blog links:', error_1);
                    throw error_1; // 重新抛出错误以便在调用方处理
                case 3: return [2 /*return*/];
            }
        });
    });
}
