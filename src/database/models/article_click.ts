// 插入一条点击记录
import pool from "../db";

async function insertClickRecord(article_id: number, user_id: string): Promise<number> {
  const queryText = `
    INSERT INTO article_clicks (article_id, user_id)
    VALUES ($1, $2)
    RETURNING click_id
  `;
  const { rows } = await pool.query(queryText, [article_id, user_id]);
  return rows[0].click_id;
}

// 删除一条点击记录
async function deleteClickRecord(click_id: number): Promise<void> {
  const queryText = `
    DELETE FROM article_clicks
    WHERE click_id = $1
  `;
  await pool.query(queryText, [click_id]);
}

// 更新一条点击记录
async function updateClickRecord(click_id: number, user_id: string): Promise<void> {
  const queryText = `
    UPDATE article_clicks
    SET user_id = $1
    WHERE click_id = $2
  `;
  await pool.query(queryText, [user_id, click_id]);
}

// 查询点击记录
async function getClickRecords(): Promise<any[]> {
  const queryText = `
    SELECT * FROM article_clicks
  `;
  const { rows } = await pool.query(queryText);
  return rows;
}

// 导出方法
export { insertClickRecord, deleteClickRecord, updateClickRecord, getClickRecords };