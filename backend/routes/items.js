const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const logActivity = require('../helpers/logger');

// GET /api/items — public, search/filter
router.get('/', async (req, res) => {
  const { search, category, location, type, status, date_from, date_to, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const conditions = [];
  const params = [];

  // Only show pending/matched for public (not claimed/returned by default)
  conditions.push(`i.status IN ('pending','matched','claimed','returned')`);

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(i.item_name ILIKE $${params.length} OR i.description ILIKE $${params.length})`);
  }
  if (category) { params.push(category); conditions.push(`i.category = $${params.length}`); }
  if (location) { params.push(`%${location}%`); conditions.push(`i.location ILIKE $${params.length}`); }
  if (type) { params.push(type); conditions.push(`i.type = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`i.status = $${params.length}`); }
  if (date_from) { params.push(date_from); conditions.push(`i.date_lost_or_found >= $${params.length}`); }
  if (date_to) { params.push(date_to); conditions.push(`i.date_lost_or_found <= $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countRes = await pool.query(`SELECT COUNT(*) FROM items i ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit));
    params.push(offset);
    const result = await pool.query(
      `SELECT i.id, i.type, i.item_name, i.category, i.description, i.location,
              i.date_lost_or_found, i.public_details, i.image_url, i.status, i.created_at,
              u.full_name AS reporter_name
       FROM items i
       JOIN users u ON i.user_id = u.id
       ${where}
       ORDER BY i.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ items: result.rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items/my/reports — authenticated user's own items
router.get('/my/reports', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items/:id — public item detail (hide verification details)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.type, i.item_name, i.category, i.description, i.location,
              i.date_lost_or_found, i.public_details, i.image_url, i.status, i.created_at,
              u.full_name AS reporter_name, u.id AS reporter_id
       FROM items i
       JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Item not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/items/lost — report lost item
router.post('/lost', authenticate, upload.single('image'), [
  body('item_name').trim().notEmpty().withMessage('Item name required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('date_lost_or_found').isDate().withMessage('Valid date required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { item_name, category, description, location, date_lost_or_found, public_details, hidden_verification_details } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO items (user_id, type, item_name, category, description, location, date_lost_or_found, public_details, hidden_verification_details, image_url)
       VALUES ($1,'lost',$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, item_name, category, description, location, date_lost_or_found, public_details, hidden_verification_details, image_url]
    );
    await logActivity(req.user.id, 'ITEM_REPORTED', `Lost item: ${item_name}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/items/found — report found item
router.post('/found', authenticate, upload.single('image'), [
  body('item_name').trim().notEmpty().withMessage('Item name required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('date_lost_or_found').isDate().withMessage('Valid date required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { item_name, category, description, location, date_lost_or_found, public_details, hidden_verification_details } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO items (user_id, type, item_name, category, description, location, date_lost_or_found, public_details, hidden_verification_details, image_url)
       VALUES ($1,'found',$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, item_name, category, description, location, date_lost_or_found, public_details, hidden_verification_details, image_url]
    );

    // Smart matching — suggest possible matches
    const matches = await pool.query(
      `SELECT id, item_name, category, location, date_lost_or_found FROM items
       WHERE type = 'lost' AND status = 'pending'
       AND (category = $1 OR location ILIKE $2 OR item_name ILIKE $3)
       LIMIT 5`,
      [category, `%${location}%`, `%${item_name}%`]
    );

    await logActivity(req.user.id, 'ITEM_REPORTED', `Found item: ${item_name}`);
    res.status(201).json({ item: result.rows[0], possible_matches: matches.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/items/:id — update own item
router.put('/:id', authenticate, upload.single('image'), async (req, res) => {
  const { item_name, category, description, location, date_lost_or_found, public_details, hidden_verification_details } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Item not found.' });
    if (existing.rows[0].user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized.' });

    const image_url = req.file ? `/uploads/${req.file.filename}` : existing.rows[0].image_url;
    const result = await pool.query(
      `UPDATE items SET item_name=$1, category=$2, description=$3, location=$4,
       date_lost_or_found=$5, public_details=$6, hidden_verification_details=$7, image_url=$8
       WHERE id = $9 RETURNING *`,
      [item_name, category, description, location, date_lost_or_found, public_details, hidden_verification_details, image_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/items/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Item not found.' });
    if (existing.rows[0].user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized.' });

    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    await logActivity(req.user.id, 'ITEM_DELETED', `Deleted item ID ${req.params.id}`);
    res.json({ message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
