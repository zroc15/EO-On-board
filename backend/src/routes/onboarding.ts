import express from 'express';
import pool from '../db/pool';
import { OnboardingStatus, ComplexityLevel } from '../types';
import TeamworkService from '../services/teamwork';

const router = express.Router();

// Get all onboarding records with filters
router.get('/', async (req, res, next) => {
  try {
    const { status, complexity_level } = req.query;

    let query = 'SELECT * FROM onboarding_records WHERE 1=1';
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (complexity_level) {
      params.push(complexity_level);
      query += ` AND complexity_level = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get single onboarding record with all related data
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get main record
    const recordResult = await pool.query(
      'SELECT * FROM onboarding_records WHERE id = $1',
      [id]
    );

    if (recordResult.rows.length === 0) {
      return res.status(404).json({ error: 'Onboarding record not found' });
    }

    // Get all related data
    const [stakeholders, commercial, technical, administrative, assignments] = await Promise.all([
      pool.query('SELECT * FROM stakeholders WHERE onboarding_id = $1', [id]),
      pool.query('SELECT * FROM commercial_scope WHERE onboarding_id = $1', [id]),
      pool.query('SELECT * FROM technical_environment WHERE onboarding_id = $1', [id]),
      pool.query('SELECT * FROM administrative_details WHERE onboarding_id = $1', [id]),
      pool.query(
        `SELECT ea.*, e.name as engineer_name, e.email as engineer_email
         FROM engineer_assignments ea
         JOIN engineers e ON ea.engineer_id = e.id
         WHERE ea.onboarding_id = $1`,
        [id]
      )
    ]);

    res.json({
      ...recordResult.rows[0],
      stakeholders: stakeholders.rows[0] || null,
      commercial_scope: commercial.rows[0] || null,
      technical_environment: technical.rows[0] || null,
      administrative_details: administrative.rows[0] || null,
      engineer_assignments: assignments.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create new onboarding record
router.post('/', async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { customer_name, salesforce_account_id, salesforce_opportunity_id } = req.body;

    // Create main record
    const recordResult = await client.query(
      `INSERT INTO onboarding_records
       (customer_name, salesforce_account_id, salesforce_opportunity_id, status)
       VALUES ($1, $2, $3, 'draft')
       RETURNING *`,
      [customer_name, salesforce_account_id, salesforce_opportunity_id]
    );

    const onboardingId = recordResult.rows[0].id;

    // Create empty related records
    await Promise.all([
      client.query(
        'INSERT INTO stakeholders (onboarding_id, eliteops_solutions_architect, customer_primary_name, customer_primary_email) VALUES ($1, $2, $3, $4)',
        [onboardingId, '', '', '']
      ),
      client.query('INSERT INTO commercial_scope (onboarding_id) VALUES ($1)', [onboardingId]),
      client.query('INSERT INTO technical_environment (onboarding_id) VALUES ($1)', [onboardingId]),
      client.query('INSERT INTO administrative_details (onboarding_id) VALUES ($1)', [onboardingId])
    ]);

    await client.query('COMMIT');

    res.status(201).json(recordResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Update stakeholders
router.put('/:id/stakeholders', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if record is locked
    const lockCheck = await pool.query(
      'SELECT is_locked FROM onboarding_records WHERE id = $1',
      [id]
    );

    if (lockCheck.rows[0]?.is_locked) {
      return res.status(403).json({ error: 'Record is locked. Changes require approval.' });
    }

    const result = await pool.query(
      `UPDATE stakeholders SET
       eliteops_account_rep = $1,
       eliteops_solutions_architect = $2,
       eliteops_engineering_lead = $3,
       zscaler_account_rep = $4,
       zscaler_se = $5,
       customer_primary_name = $6,
       customer_primary_email = $7,
       customer_primary_phone = $8,
       customer_secondary_name = $9,
       customer_secondary_email = $10,
       customer_secondary_phone = $11,
       updated_at = CURRENT_TIMESTAMP
       WHERE onboarding_id = $12
       RETURNING *`,
      [
        data.eliteops_account_rep,
        data.eliteops_solutions_architect,
        data.eliteops_engineering_lead,
        data.zscaler_account_rep,
        data.zscaler_se,
        data.customer_primary_name,
        data.customer_primary_email,
        data.customer_primary_phone,
        data.customer_secondary_name,
        data.customer_secondary_email,
        data.customer_secondary_phone,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update commercial scope
router.put('/:id/commercial', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const lockCheck = await pool.query(
      'SELECT is_locked FROM onboarding_records WHERE id = $1',
      [id]
    );

    if (lockCheck.rows[0]?.is_locked) {
      return res.status(403).json({ error: 'Record is locked. Changes require approval.' });
    }

    const result = await pool.query(
      `UPDATE commercial_scope SET
       products_sold = $1,
       contract_start_date = $2,
       deployment_type = $3,
       term_length = $4,
       sow_created = $5,
       sow_approved = $6,
       sow_document_url = $7,
       updated_at = CURRENT_TIMESTAMP
       WHERE onboarding_id = $8
       RETURNING *`,
      [
        JSON.stringify(data.products_sold),
        data.contract_start_date,
        data.deployment_type,
        data.term_length,
        data.sow_created,
        data.sow_approved,
        data.sow_document_url,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update technical environment
router.put('/:id/technical', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const lockCheck = await pool.query(
      'SELECT is_locked FROM onboarding_records WHERE id = $1',
      [id]
    );

    if (lockCheck.rows[0]?.is_locked) {
      return res.status(403).json({ error: 'Record is locked. Changes require approval.' });
    }

    const result = await pool.query(
      `UPDATE technical_environment SET
       idp = $1, edr = $2, mdm = $3,
       device_os_mac_percent = $4, device_os_windows_percent = $5, device_os_linux_percent = $6,
       zia_critical_saas_apps = $7, zpa_critical_internal_apps = $8, zpa_app_types = $9,
       branches_locations = $10, lss_nss = $11, siem = $12,
       vpn = $13, cloud_providers = $14,
       replacing_tech = $15, replacing_tech_details = $16,
       updated_at = CURRENT_TIMESTAMP
       WHERE onboarding_id = $17
       RETURNING *`,
      [
        data.idp, data.edr, data.mdm,
        data.device_os_mac_percent, data.device_os_windows_percent, data.device_os_linux_percent,
        JSON.stringify(data.zia_critical_saas_apps),
        JSON.stringify(data.zpa_critical_internal_apps),
        JSON.stringify(data.zpa_app_types),
        data.branches_locations, data.lss_nss, data.siem,
        data.vpn, JSON.stringify(data.cloud_providers),
        data.replacing_tech, data.replacing_tech_details,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update administrative details
router.put('/:id/administrative', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const lockCheck = await pool.query(
      'SELECT is_locked FROM onboarding_records WHERE id = $1',
      [id]
    );

    if (lockCheck.rows[0]?.is_locked) {
      return res.status(403).json({ error: 'Record is locked. Changes require approval.' });
    }

    const result = await pool.query(
      `UPDATE administrative_details SET
       primary_timezone = $1,
       desired_go_live_date = $2,
       customer_bandwidth = $3,
       known_blackout_periods = $4,
       additional_notes = $5,
       updated_at = CURRENT_TIMESTAMP
       WHERE onboarding_id = $6
       RETURNING *`,
      [
        data.primary_timezone,
        data.desired_go_live_date,
        data.customer_bandwidth,
        JSON.stringify(data.known_blackout_periods),
        data.additional_notes,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update status (state transition)
router.post('/:id/status', async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status, user_id, notes } = req.body;

    // Get current record
    const currentResult = await client.query(
      'SELECT * FROM onboarding_records WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Onboarding record not found' });
    }

    const currentStatus = currentResult.rows[0].status;

    // Validate state transition
    const validTransitions: Record<OnboardingStatus, OnboardingStatus[]> = {
      draft: ['sa_complete'],
      sa_complete: ['leadership_approved', 'draft'],
      leadership_approved: ['ready_for_delivery', 'sa_complete'],
      ready_for_delivery: ['in_deployment', 'leadership_approved'],
      in_deployment: ['completed'],
      completed: []
    };

    if (!validTransitions[currentStatus as OnboardingStatus]?.includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${currentStatus} to ${status}`
      });
    }

    // If transitioning to ready_for_delivery, lock the record and create Teamwork project
    let teamworkProjectId = currentResult.rows[0].teamwork_project_id;

    if (status === 'ready_for_delivery' && !currentResult.rows[0].is_locked) {
      // Lock the record
      await client.query(
        'UPDATE onboarding_records SET is_locked = TRUE, locked_at = CURRENT_TIMESTAMP, locked_by = $1 WHERE id = $2',
        [user_id, id]
      );

      // Create Teamwork project (if not already created)
      if (!teamworkProjectId) {
        const teamwork = new TeamworkService();
        try {
          teamworkProjectId = await teamwork.createProject(id);
          await client.query(
            'UPDATE onboarding_records SET teamwork_project_id = $1 WHERE id = $2',
            [teamworkProjectId, id]
          );
        } catch (err) {
          console.error('Failed to create Teamwork project:', err);
          // Don't fail the transition if Teamwork integration fails
        }
      }
    }

    // Update status
    const statusField = status === 'sa_complete' ? 'submitted_at' :
                        status === 'leadership_approved' ? 'approved_at' :
                        status === 'in_deployment' ? 'deployment_started_at' :
                        status === 'completed' ? 'completed_at' : null;

    let updateQuery = 'UPDATE onboarding_records SET status = $1, updated_at = CURRENT_TIMESTAMP';
    const params = [status, id];

    if (statusField) {
      updateQuery += `, ${statusField} = CURRENT_TIMESTAMP`;
    }

    updateQuery += ' WHERE id = $2 RETURNING *';

    const updateResult = await client.query(updateQuery, params);

    // Create audit log
    await client.query(
      `INSERT INTO audit_log (onboarding_id, user_id, action, from_status, to_status, notes)
       VALUES ($1, $2, 'status_change', $3, $4, $5)`,
      [id, user_id, currentStatus, status, notes]
    );

    await client.query('COMMIT');

    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Update complexity level
router.put('/:id/complexity', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { complexity_level } = req.body;

    const validLevels: ComplexityLevel[] = ['L1', 'L2', 'L3', 'L4'];

    if (!validLevels.includes(complexity_level)) {
      return res.status(400).json({ error: 'Invalid complexity level' });
    }

    const result = await pool.query(
      'UPDATE onboarding_records SET complexity_level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [complexity_level, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Assign engineer
router.post('/:id/assign', async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { engineer_id, role, assigned_by } = req.body;

    // Check if engineer exists
    const engineerResult = await client.query(
      'SELECT * FROM engineers WHERE id = $1',
      [engineer_id]
    );

    if (engineerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Engineer not found' });
    }

    // Get onboarding record
    const recordResult = await client.query(
      'SELECT complexity_level FROM onboarding_records WHERE id = $1',
      [id]
    );

    if (recordResult.rows.length === 0) {
      return res.status(404).json({ error: 'Onboarding record not found' });
    }

    const complexityLevel = recordResult.rows[0].complexity_level;
    const engineer = engineerResult.rows[0];

    // Validate engineer can handle complexity
    const complexityOrder = { L1: 1, L2: 2, L3: 3, L4: 4 };

    if (complexityLevel &&
        complexityOrder[engineer.max_complexity_level as ComplexityLevel] <
        complexityOrder[complexityLevel as ComplexityLevel]) {
      return res.status(400).json({
        error: `Engineer can only handle up to ${engineer.max_complexity_level} but this project is ${complexityLevel}`
      });
    }

    // Assign engineer (upsert)
    const assignResult = await client.query(
      `INSERT INTO engineer_assignments (onboarding_id, engineer_id, role, assigned_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (onboarding_id, role)
       DO UPDATE SET engineer_id = $2, assigned_by = $4, assigned_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id, engineer_id, role, assigned_by]
    );

    // Update engineer's project count
    await client.query(
      'UPDATE engineers SET current_projects_count = current_projects_count + 1 WHERE id = $1',
      [engineer_id]
    );

    // Create audit log
    await client.query(
      `INSERT INTO audit_log (onboarding_id, user_id, action, notes)
       VALUES ($1, $2, 'engineer_assigned', $3)`,
      [id, assigned_by, `${role} engineer assigned: ${engineer.name}`]
    );

    await client.query('COMMIT');

    res.json(assignResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Get audit log for an onboarding record
router.get('/:id/audit', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.onboarding_id = $1
       ORDER BY al.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
