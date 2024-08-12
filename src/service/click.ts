import {insertClickRecord} from "../database/models/article_click";


async function insertClick(article_id: number, open_id: string) {
    return await insertClickRecord(article_id, open_id);
}

export { insertClick }