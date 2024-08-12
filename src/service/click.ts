import {insertClickRecord} from "../database/models/article_click";


async function insertClick(article_id: number, user_id: string) {
    return await insertClickRecord(article_id, user_id);
}

export { insertClick }