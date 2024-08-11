import pool from "./db";

async function createTables() {
  try {
    const client = await pool.connect();
    const sql = await client.query('SELECT * FROM pg_read_file(\'sql/create_articles_table.sql\')');
    await client.query(sql.rows[0].data);
    console.log('Tables created successfully.');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    pool.end();
  }
}

createTables();