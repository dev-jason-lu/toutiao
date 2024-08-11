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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArticle = createArticle;
exports.getArticle = getArticle;
exports.updateArticle = updateArticle;
exports.deleteArticle = deleteArticle;
exports.getSendedBlogLinks = getSendedBlogLinks;
exports.getArticleList = getArticleList;
const db_1 = __importDefault(require("../db")); // 引入数据库连接池
// 创建文章
function createArticle(article) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, article_link, article_abstract, article_content, tag, score, is_send } = article;
        // 使用 ON CONFLICT 子句处理唯一性冲突
        const result = yield db_1.default.query('INSERT INTO articles (title, article_link, article_abstract, article_content, tag, score, is_send) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (article_link) DO NOTHING RETURNING id', [title, article_link, article_abstract, article_content, tag, score, is_send]);
        // 如果插入成功，则返回新插入的记录的 id，否则返回 null
        return result.rows.length > 0 ? result.rows[0].id : null;
    });
}
// 查询文章
function getArticle(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield db_1.default.query('SELECT * FROM articles WHERE id = $1', [id]);
        return rows.length > 0 ? rows[0] : null;
    });
}
// 查询文章列表
function getArticleList(score) {
    return __awaiter(this, void 0, void 0, function* () {
        const { rows } = yield db_1.default.query('SELECT * FROM articles WHERE score = $1', [score]);
        return rows.length > 0 ? rows : [];
    });
}
// 更新文章
function updateArticle(id, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, article_link, article_abstract, article_content, tag, score, is_send } = updates;
        let query = 'UPDATE articles SET ';
        const values = [];
        let setClause = '';
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
        if (tag !== undefined) {
            setClause += 'tag = $5, ';
            values.push(tag);
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
        yield db_1.default.query(query, values);
    });
}
// 删除文章
function deleteArticle(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.default.query('DELETE FROM articles WHERE id = $1', [id]);
    });
}
// 查询已发送的文章链接
function getSendedBlogLinks() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { rows } = yield db_1.default.query('SELECT article_link FROM articles WHERE is_send = true;');
            return rows;
        }
        catch (error) {
            console.error('Error fetching sended blog links:', error);
            throw error; // 重新抛出错误以便在调用方处理
        }
    });
}
