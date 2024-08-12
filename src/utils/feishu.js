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
exports.simpleSendGroup = simpleSendGroup;
var axios_1 = require("axios");
var APP_ID = 'cli_a632c6e05238900b';
var APP_SECRET = 'VLjU4IYR8iMN7N8iiNvO5g6UhHNd2jCM';
/**
 * 获取访问令牌。
 *
 * @param appId - 应用的 ID。
 * @param appSecret - 应用的密钥。
 * @returns {Promise<string>} - 返回一个 Promise，解析为访问令牌。
 */
function getToken() {
    return __awaiter(this, void 0, void 0, function () {
        var tokenUrl, headers, requestData, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tokenUrl = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
                    headers = {
                        'Content-Type': 'application/json',
                    };
                    requestData = {
                        app_id: APP_ID,
                        app_secret: APP_SECRET,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(tokenUrl, requestData, { headers: headers })];
                case 2:
                    response = _a.sent();
                    return [2 /*return*/, response.data.tenant_access_token];
                case 3:
                    error_1 = _a.sent();
                    throw new Error('Failed to fetch token');
                case 4: return [2 /*return*/];
            }
        });
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
    return __awaiter(this, void 0, void 0, function () {
        var url, token, error_2, headers, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = 'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id';
                    token = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getToken()];
                case 2:
                    token = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error fetching token:", error_2);
                    return [3 /*break*/, 4];
                case 4:
                    headers = {
                        Authorization: "Bearer ".concat(token),
                        'Content-Type': 'application/json',
                    };
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, axios_1.default.post(url, data, { headers: headers })];
                case 6:
                    response = _a.sent();
                    return [2 /*return*/, response.data.code === 0];
                case 7:
                    error_3 = _a.sent();
                    console.log(error_3);
                    return [2 /*return*/, false];
                case 8: return [2 /*return*/];
            }
        });
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var token, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getToken()];
            case 1:
                token = _a.sent();
                console.log("Token:", token);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error("Error fetching token:", error_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
