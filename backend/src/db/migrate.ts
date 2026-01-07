import pool from './pool';

const migrations = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engineers table
CREATE TABLE IF NOT EXISTS engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_complexity_level VARCHAR(10) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  primary_timezone VARCHAR(100),
  current_projects_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding records (main table)
CREATE TABLE IF NOT EXISTS onboarding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesforce_account_id VARCHAR(255),
  salesforce_opportunity_id VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  complexity_level VARCHAR(10),
  teamwork_project_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  deployment_started_at TIMESTAMP,
  completed_at TIMESTAMP,
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMP,
  locked_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_records(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_salesforce ON onboarding_records(salesforce_opportunity_id);

-- Stakeholders table
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,
  eliteops_account_rep VARCHAR(255),
  eliteops_solutions_architect VARCHAR(255) NOT NULL,
  eliteops_engineering_lead VARCHAR(255),
  zscaler_account_rep VARCHAR(255),
  zscaler_se VARCHAR(255),
  customer_primary_name VARCHAR(255) NOT NULL,
  customer_primary_email VARCHAR(255) NOT NULL,
  customer_primary_phone VARCHAR(100),
  customer_secondary_name VARCHAR(255),
  customer_secondary_email VARCHAR(255),
  customer_secondary_phone VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commercial scope table
CREATE TABLE IF NOT EXISTS commercial_scope (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,
  products_sold JSONB NOT NULL DEFAULT '[]'::jsonb,
  contract_start_date DATE,
  deployment_type VARCHAR(50),
  term_length INTEGER,
  sow_created BOOLEAN DEFAULT FALSE,
  sow_approved BOOLEAN DEFAULT FALSE,
  sow_document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Technical environment table
CREATE TABLE IF NOT EXISTS technical_environment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,
  idp VARCHAR(100),
  edr VARCHAR(100),
  mdm VARCHAR(100),
  device_os_mac_percent INTEGER DEFAULT 0,
  device_os_windows_percent INTEGER DEFAULT 0,
  device_os_linux_percent INTEGER DEFAULT 0,
  zia_critical_saas_apps JSONB DEFAULT '[]'::jsonb,
  zpa_critical_internal_apps JSONB DEFAULT '[]'::jsonb,
  zpa_app_types JSONB DEFAULT '[]'::jsonb,
  branches_locations TEXT,
  lss_nss BOOLEAN DEFAULT FALSE,
  siem VARCHAR(100),
  vpn VARCHAR(100),
  cloud_providers JSONB DEFAULT '[]'::jsonb,
  replacing_tech BOOLEAN DEFAULT FALSE,
  replacing_tech_details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Administrative details table
CREATE TABLE IF NOT EXISTS administrative_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,
  primary_timezone VARCHAR(100),
  desired_go_live_date DATE,
  customer_bandwidth VARCHAR(50),
  known_blackout_periods JSONB DEFAULT '[]'::jsonb,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Engineer assignments table
CREATE TABLE IF NOT EXISTS engineer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES engineers(id),
  role VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  UNIQUE(onboarding_id, role)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_onboarding ON audit_log(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    await client.query(migrations);
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrate().catch(console.error);
}

export default migrate;
