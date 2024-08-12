import pool from '../db'; // 引入数据库连接池

interface Article {
  id: number;
  title: string;
  article_link: string;
  article_abstract: string;
  article_content: string;
  tags: string[];
  score: number;
  created_time: string;
  is_send: boolean;
}

// 创建文章
async function createArticle(article: Omit<Article, 'id' | 'created_time'>): Promise<number> {
  const { title, article_link, article_abstract, article_content, tags, score, is_send } = article;

  // 使用 ON CONFLICT 子句处理唯一性冲突
  const result = await pool.query(
  'INSERT INTO articles (title, article_link, article_abstract, article_content, tags, score, is_send) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (article_link) DO UPDATE SET is_send = EXCLUDED.is_send RETURNING id',
  [title, article_link, article_abstract, article_content, tags, score, is_send]
  );

  // 如果插入成功，则返回新插入的记录的 id，否则返回 null
  return result.rows[0].id
}

// 查询文章
async function getArticle(id: number): Promise<Article | null> {
  const { rows } = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
  return rows.length > 0 ? rows[0] : null;
}

// 查询文章列表
async function getArticleList(score: number): Promise<Article[] | any[]> {
  const { rows } = await pool.query('SELECT * FROM articles WHERE score = $1', [score]);
  return rows.length > 0 ? rows : [];
}

// 更新文章
async function updateArticle(id: number, updates: Partial<Omit<Article, 'id' | 'created_time'>>): Promise<void> {
  const { title, article_link, article_abstract, article_content, tags, score, is_send } = updates;
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

  await pool.query(query, values);
}

// 删除文章
async function deleteArticle(id: number): Promise<void> {
  await pool.query('DELETE FROM articles WHERE id = $1', [id]);
}

// 查询已发送的文章链接
async function getSendedBlogLinks(): Promise<Article[]> {
  try {
    const { rows } = await pool.query('SELECT article_link FROM articles WHERE is_send = true;');
    return rows;
  } catch (error) {
    console.error('Error fetching sended blog links:', error);
    throw error; // 重新抛出错误以便在调用方处理
  }
}

// 显式导出查询函数
export { createArticle, getArticle, updateArticle, deleteArticle, getSendedBlogLinks, getArticleList };