import express from 'express';
import pool from '../db/pool';
import { ComplexityLevel } from '../types';

const router = express.Router();

// Get all engineers
router.get('/', async (req, res, next) => {
  try {
    const { available, min_complexity } = req.query;

    let query = 'SELECT * FROM engineers WHERE 1=1';
    const params: any[] = [];

    if (available === 'true') {
      query += ' AND is_available = TRUE';
    }

    if (min_complexity) {
      // Filter engineers who can handle at least this complexity
      const complexityOrder: Record<string, string[]> = {
        L1: ['L1', 'L2', 'L3', 'L4'],
        L2: ['L2', 'L3', 'L4'],
        L3: ['L3', 'L4'],
        L4: ['L4']
      };

      const validLevels = complexityOrder[min_complexity as string];
      if (validLevels) {
        params.push(validLevels);
        query += ` AND max_complexity_level = ANY($${params.length})`;
      }
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get single engineer
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM engineers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Engineer not found' });
    }

    // Get current assignments
    const assignments = await pool.query(
      `SELECT ea.*, ob.customer_name, ob.status, ob.complexity_level
       FROM engineer_assignments ea
       JOIN onboarding_records ob ON ea.onboarding_id = ob.id
       WHERE ea.engineer_id = $1 AND ob.status NOT IN ('completed')
       ORDER BY ea.assigned_at DESC`,
      [id]
    );

    res.json({
      ...result.rows[0],
      current_assignments: assignments.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create new engineer
router.post('/', async (req, res, next) => {
  try {
    const { name, email, skills, max_complexity_level, primary_timezone } = req.body;

    const result = await pool.query(
      `INSERT INTO engineers (name, email, skills, max_complexity_level, primary_timezone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, JSON.stringify(skills), max_complexity_level, primary_timezone]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update engineer
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, skills, max_complexity_level, is_available, primary_timezone } = req.body;

    const result = await pool.query(
      `UPDATE engineers SET
       name = $1,
       email = $2,
       skills = $3,
       max_complexity_level = $4,
       is_available = $5,
       primary_timezone = $6,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, email, JSON.stringify(skills), max_complexity_level, is_available, primary_timezone, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Engineer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get engineers eligible for a specific onboarding
router.get('/eligible/:onboarding_id', async (req, res, next) => {
  try {
    const { onboarding_id } = req.params;

    // Get the onboarding record
    const recordResult = await pool.query(
      'SELECT complexity_level, (SELECT products_sold FROM commercial_scope WHERE onboarding_id = $1) as products_sold FROM onboarding_records WHERE id = $1',
      [onboarding_id]
    );

    if (recordResult.rows.length === 0) {
      return res.status(404).json({ error: 'Onboarding record not found' });
    }

    const { complexity_level, products_sold } = recordResult.rows[0];

    if (!complexity_level) {
      return res.status(400).json({ error: 'Complexity level not set for this onboarding' });
    }

    // Get engineers who can handle this complexity
    const complexityOrder: Record<string, string[]> = {
      L1: ['L1', 'L2', 'L3', 'L4'],
      L2: ['L2', 'L3', 'L4'],
      L3: ['L3', 'L4'],
      L4: ['L4']
    };

    const validLevels = complexityOrder[complexity_level];

    const result = await pool.query(
      `SELECT *,
       current_projects_count as workload
       FROM engineers
       WHERE is_available = TRUE
       AND max_complexity_level = ANY($1)
       ORDER BY current_projects_count ASC, name`,
      [validLevels]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
