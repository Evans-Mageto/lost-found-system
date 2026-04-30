const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const logActivity = require('../helpers/logger');

// POST /api/claims — submit a claim
router.post('/', authenticate, [
  body('item_id').isInt().withMessage('Valid item ID required'),
  body('claim_message').trim().notEmpty().withMessage('Claim message required'),
  body('verification_answer').trim().notEmpty().withMessage('Verification answer required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { item_id, claim_message, verification_answer } = req.body;
  try {
    const item = await pool.query('SELECT * FROM items WHERE id = $1', [item_id]);
    if (!item.rows[0]) return res.status(404).json({ error: 'Item not found.' });
    if (item.rows[0].user_id === req.user.id)
      return res.status(400).json({ error: 'You cannot claim your own item.' });

    const existing = await pool.query(
      'SELECT id FROM claims WHERE item_id = $1 AND claimant_id = $2',
      [item_id, req.user.id]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'You already submitted a claim for this item.' });

    const result = await pool.query(
      `INSERT INTO claims (item_id, claimant_id, claim_message, verification_answer)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [item_id, req.user.id, claim_message, verification_answer]
    );
    await logActivity(req.user.id, 'CLAIM_SUBMITTED', `Claim on item ID ${item_id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/claims/my — user's own claims
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, i.item_name, i.category, i.type, i.location, i.image_url
       FROM claims c
       JOIN items i ON c.item_id = i.id
       WHERE c.claimant_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/claims/:id — single claim detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, i.item_name, i.category, i.type, i.location
       FROM claims c
       JOIN items i ON c.item_id = i.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Claim not found.' });
    const claim = result.rows[0];
    if (claim.claimant_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Not authorized.' });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
