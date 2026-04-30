const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');
const logActivity = require('../helpers/logger');

// All admin routes require auth + admin role
router.use(authenticate, adminOnly);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [items, pending, claimed, returned, users, claims, lostCount, foundCount, pendingClaims, approvedClaims] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM items'),
      pool.query("SELECT COUNT(*) FROM items WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM items WHERE status = 'claimed'"),
      pool.query("SELECT COUNT(*) FROM items WHERE status = 'returned'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      pool.query('SELECT COUNT(*) FROM claims'),
      pool.query("SELECT COUNT(*) FROM items WHERE type = 'lost'"),
      pool.query("SELECT COUNT(*) FROM items WHERE type = 'found'"),
      pool.query("SELECT COUNT(*) FROM claims WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM claims WHERE status = 'approved'"),
    ]);
    res.json({
      total_items: parseInt(items.rows[0].count),
      pending_items: parseInt(pending.rows[0].count),
      claimed_items: parseInt(claimed.rows[0].count),
      returned_items: parseInt(returned.rows[0].count),
      total_users: parseInt(users.rows[0].count),
      total_claims: parseInt(claims.rows[0].count),
      lost_items: parseInt(lostCount.rows[0].count),
      found_items: parseInt(foundCount.rows[0].count),
      pending_claims: parseInt(pendingClaims.rows[0].count),
      approved_claims: parseInt(approvedClaims.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.user.id)
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [targetId]);
    if (!user.rows[0]) return res.status(404).json({ error: 'User not found.' });
    if (user.rows[0].role === 'admin')
      return res.status(400).json({ error: 'Cannot delete another admin account.' });
    await pool.query('DELETE FROM users WHERE id = $1', [targetId]);
    await logActivity(req.user.id, 'USER_DELETED', `Deleted user ID ${targetId}: ${user.rows[0].email}`);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id/toggle — activate/deactivate
router.put('/users/:id/toggle', async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.user.id)
    return res.status(400).json({ error: 'Cannot deactivate your own account.' });
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, full_name, email, is_active',
      [targetId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
    const u = result.rows[0];
    await logActivity(req.user.id, u.is_active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', `User ${u.email}`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/items
router.get('/items', async (req, res) => {
  const { search, type, status, category, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];

  if (search) { params.push(`%${search}%`); conditions.push(`(i.item_name ILIKE $${params.length} OR i.description ILIKE $${params.length})`); }
  if (type) { params.push(type); conditions.push(`i.type = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`i.status = $${params.length}`); }
  if (category) { params.push(category); conditions.push(`i.category = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM items i ${where}`, params);
    const total = parseInt(countRes.rows[0].count);
    params.push(parseInt(limit)); params.push(offset);
    const result = await pool.query(
      `SELECT i.*, u.full_name AS reporter_name, u.email AS reporter_email
       FROM items i JOIN users u ON i.user_id = u.id
       ${where} ORDER BY i.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ items: result.rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/items/:id — full detail including hidden fields
router.get('/items/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.full_name AS reporter_name, u.email AS reporter_email
       FROM items i JOIN users u ON i.user_id = u.id WHERE i.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Item not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/items/:id/status
router.put('/items/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'matched', 'claimed', 'returned'];
  if (!allowed.includes(status))
    return res.status(400).json({ error: 'Invalid status.' });
  try {
    const result = await pool.query(
      'UPDATE items SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Item not found.' });
    await logActivity(req.user.id, 'ITEM_STATUS_UPDATED', `Item ID ${req.params.id} → ${status}`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/items/:id
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    if (!item.rows[0]) return res.status(404).json({ error: 'Item not found.' });
    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    await logActivity(req.user.id, 'ITEM_DELETED', `Admin deleted item ID ${req.params.id}: ${item.rows[0].item_name}`);
    res.json({ message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/claims
router.get('/claims', async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const params = [];
  const conditions = [];
  if (status) { params.push(status); conditions.push(`c.status = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM claims c ${where}`, params);
    const total = parseInt(countRes.rows[0].count);
    params.push(parseInt(limit)); params.push(offset);
    const result = await pool.query(
      `SELECT c.*, i.item_name, i.category, i.type, i.location, i.hidden_verification_details,
              u.full_name AS claimant_name, u.email AS claimant_email
       FROM claims c
       JOIN items i ON c.item_id = i.id
       JOIN users u ON c.claimant_id = u.id
       ${where} ORDER BY c.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ claims: result.rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/claims/:id/approve
router.put('/claims/:id/approve', async (req, res) => {
  const { admin_response } = req.body;
  try {
    const result = await pool.query(
      `UPDATE claims SET status = 'approved', admin_response = $1 WHERE id = $2 RETURNING *`,
      [admin_response || 'Claim approved.', req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Claim not found.' });
    await pool.query(`UPDATE items SET status = 'claimed' WHERE id = $1`, [result.rows[0].item_id]);
    await logActivity(req.user.id, 'CLAIM_APPROVED', `Claim ID ${req.params.id}`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/claims/:id/reject
router.put('/claims/:id/reject', async (req, res) => {
  const { admin_response } = req.body;
  try {
    const result = await pool.query(
      `UPDATE claims SET status = 'rejected', admin_response = $1 WHERE id = $2 RETURNING *`,
      [admin_response || 'Claim rejected.', req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Claim not found.' });
    await logActivity(req.user.id, 'CLAIM_REJECTED', `Claim ID ${req.params.id}`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/activity-logs
router.get('/activity-logs', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM activity_logs');
    const total = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `SELECT l.*, u.full_name, u.email FROM activity_logs l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );
    res.json({ logs: result.rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
