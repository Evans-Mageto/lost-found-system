const pool = require('../db');

const logActivity = async (userId, action, details = '') => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId || null, action, details]
    );
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = logActivity;
