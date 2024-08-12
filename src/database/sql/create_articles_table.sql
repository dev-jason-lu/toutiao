-- create_articles_table.sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  article_link VARCHAR(255) UNIQUE NOT NULL,
  article_abstract TEXT,
  article_content TEXT,
  tag VARCHAR(255)[],
  score DECIMAL(5, 2) DEFAULT 0.0,
  created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_send boolean,
);