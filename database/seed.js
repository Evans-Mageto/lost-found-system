// database/seed.js
// Run this once after setting up the database to create the default admin account
// Usage: node database/seed.js

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seed() {
  const client = await pool.connect();
  try {
    const adminEmail = 'admin@school.edu';
    const adminPassword = 'Admin@1234';
    const hash = await bcrypt.hash(adminPassword, 12);

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (existing.rows.length > 0) {
      console.log('Admin already exists. Skipping seed.');
      return;
    }

    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      ['System Admin', adminEmail, hash, 'admin']
    );

    console.log('✅ Default admin created:');
    console.log('   Email:    admin@school.edu');
    console.log('   Password: Admin@1234');
    console.log('   ⚠️  Change the password after first login!');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
