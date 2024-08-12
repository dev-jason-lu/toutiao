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
exports.insertClickRecord = insertClickRecord;
exports.deleteClickRecord = deleteClickRecord;
exports.updateClickRecord = updateClickRecord;
exports.getClickRecords = getClickRecords;
// 插入一条点击记录
const db_1 = __importDefault(require("../db"));
function insertClickRecord(article_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryText = `
    INSERT INTO article_clicks (article_id, user_id)
    VALUES ($1, $2)
    RETURNING click_id
  `;
        const { rows } = yield db_1.default.query(queryText, [article_id, user_id]);
        return rows[0].click_id;
    });
}
// 删除一条点击记录
function deleteClickRecord(click_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryText = `
    DELETE FROM article_clicks
    WHERE click_id = $1
  `;
        yield db_1.default.query(queryText, [click_id]);
    });
}
// 更新一条点击记录
function updateClickRecord(click_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryText = `
    UPDATE article_clicks
    SET user_id = $1
    WHERE click_id = $2
  `;
        yield db_1.default.query(queryText, [user_id, click_id]);
    });
}
// 查询点击记录
function getClickRecords() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryText = `
    SELECT * FROM article_clicks
  `;
        const { rows } = yield db_1.default.query(queryText);
        return rows;
    });
}
