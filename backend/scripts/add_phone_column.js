// backend/scripts/add_phone_column.js
require('dotenv').config({ path: __dirname + '/../../backend/.env' });
const { Pool } = require('pg');

(async () => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  try {
    const sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);";
    await pool.query(sql);
    console.log('✅ phone column added or already exists.');
    const check = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='phone'");
    console.log('Column present:', check.rows.length > 0);
    console.log(check.rows);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
