const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  const connectionString = process.env.DATABASE_URL;
  
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    // Force SSL mode
    keepAlive: true,
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'lost_found_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });
}

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection FAILED:', err.message, err.stack);
  } else {
    console.log('Database connected at:', res.rows[0].now);
  }
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
});

module.exports = pool;