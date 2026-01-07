import express from 'express';
import pool from '../db/pool';

const router = express.Router();

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const { role, active } = req.query;

    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    if (active === 'true') {
      query += ' AND is_active = TRUE';
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Create user
router.post('/', async (req, res, next) => {
  try {
    const { email, name, role } = req.body;

    const result = await pool.query(
      'INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *',
      [email, name, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, name, role, is_active } = req.body;

    const result = await pool.query(
      `UPDATE users SET
       email = $1,
       name = $2,
       role = $3,
       is_active = $4,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [email, name, role, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
