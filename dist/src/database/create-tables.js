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
const db_1 = __importDefault(require("./db"));
function createTables() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield db_1.default.connect();
            const sql = yield client.query('SELECT * FROM pg_read_file(\'sql/create_articles_table.sql\')');
            yield client.query(sql.rows[0].data);
            console.log('Tables created successfully.');
        }
        catch (error) {
            console.error('Error creating tables:', error);
        }
        finally {
            db_1.default.end();
        }
    });
}
createTables();
