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
exports.simpleSendGroup = simpleSendGroup;
const axios_1 = __importDefault(require("axios"));
const APP_ID = 'cli_a632c6e05238900b';
const APP_SECRET = 'VLjU4IYR8iMN7N8iiNvO5g6UhHNd2jCM';
/**
 * 获取访问令牌。
 *
 * @param appId - 应用的 ID。
 * @param appSecret - 应用的密钥。
 * @returns {Promise<string>} - 返回一个 Promise，解析为访问令牌。
 */
function getToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'; // 替换为实际的 URL
        const headers = {
            'Content-Type': 'application/json',
        };
        const requestData = {
            app_id: APP_ID,
            app_secret: APP_SECRET,
        };
        try {
            const response = yield axios_1.default.post(tokenUrl, requestData, { headers });
            return response.data.tenant_access_token;
        }
        catch (error) {
            throw new Error('Failed to fetch token');
        }
    });
}
/**
 * 发送富文本消息的实用工具方法。
 *
 * @param data - 要发送的数据对象。
 * @param token - 用于授权的令牌。
 * @returns {Promise<boolean>} - 返回一个布尔值，指示请求是否成功。
 */
function simpleSendGroup(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id';
        let token = '';
        try {
            token = yield getToken();
        }
        catch (error) {
            console.error("Error fetching token:", error);
        }
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
        try {
            const response = yield axios_1.default.post(url, data, { headers });
            return response.data.code === 0;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield getToken();
        console.log("Token:", token);
    }
    catch (error) {
        console.error("Error fetching token:", error);
    }
}))();
