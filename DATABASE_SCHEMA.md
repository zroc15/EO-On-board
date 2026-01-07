# Database Schema - EliteOps Customer Onboarding System

## Core Tables

### 1. onboarding_records
Main handoff record for each customer onboarding.

```sql
CREATE TABLE onboarding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Salesforce Integration
  salesforce_account_id VARCHAR(255),
  salesforce_opportunity_id VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,

  -- Readiness Gates (State Machine)
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  -- States: draft, sa_complete, leadership_approved, ready_for_delivery, in_deployment, completed

  -- Complexity Scoring
  complexity_level VARCHAR(10), -- L1, L2, L3, L4

  -- Teamwork Integration
  teamwork_project_id VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  deployment_started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Locking mechanism
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMP,
  locked_by UUID REFERENCES users(id)
);

CREATE INDEX idx_onboarding_status ON onboarding_records(status);
CREATE INDEX idx_onboarding_salesforce ON onboarding_records(salesforce_opportunity_id);
```

### 2. stakeholders
Mandatory stakeholders for each onboarding.

```sql
CREATE TABLE stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,

  -- EliteOps Team
  eliteops_account_rep VARCHAR(255),
  eliteops_solutions_architect VARCHAR(255) NOT NULL,
  eliteops_engineering_lead VARCHAR(255),

  -- Zscaler Team
  zscaler_account_rep VARCHAR(255),
  zscaler_se VARCHAR(255),

  -- Customer Contacts
  customer_primary_name VARCHAR(255) NOT NULL,
  customer_primary_email VARCHAR(255) NOT NULL,
  customer_primary_phone VARCHAR(100),

  customer_secondary_name VARCHAR(255),
  customer_secondary_email VARCHAR(255),
  customer_secondary_phone VARCHAR(100),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. commercial_scope
Commercial and scope data (pulled from Salesforce, editable by SA + Leadership).

```sql
CREATE TABLE commercial_scope (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,

  -- Products Sold (stored as JSONB array for flexibility)
  products_sold JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: ["ZIA Deployment", "ZPA Deployment", "DLP"]

  -- Contract Details
  contract_start_date DATE,
  deployment_type VARCHAR(50), -- POC or Production
  term_length INTEGER, -- in months

  -- SOW
  sow_created BOOLEAN DEFAULT FALSE,
  sow_approved BOOLEAN DEFAULT FALSE,
  sow_document_url VARCHAR(500),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. technical_environment
Structured technical environment data.

```sql
CREATE TABLE technical_environment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,

  -- Identity & Endpoint
  idp VARCHAR(100), -- Okta, Entra, Ping, Other
  edr VARCHAR(100),
  mdm VARCHAR(100),

  device_os_mac_percent INTEGER DEFAULT 0,
  device_os_windows_percent INTEGER DEFAULT 0,
  device_os_linux_percent INTEGER DEFAULT 0,

  -- Zscaler ZIA
  zia_critical_saas_apps JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"name": "Salesforce", "importance": "high"}]

  -- Zscaler ZPA
  zpa_critical_internal_apps JSONB DEFAULT '[]'::jsonb,
  zpa_app_types JSONB DEFAULT '[]'::jsonb,
  -- Example: ["web", "client-server", "SSH", "RDP"]

  branches_locations TEXT,

  -- Logging
  lss_nss BOOLEAN DEFAULT FALSE,
  siem VARCHAR(100),

  -- Network / Cloud
  vpn VARCHAR(100),
  cloud_providers JSONB DEFAULT '[]'::jsonb,
  -- Example: ["AWS", "Azure", "GCP"]

  replacing_tech BOOLEAN DEFAULT FALSE,
  replacing_tech_details TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. administrative_details
Administrative reality check.

```sql
CREATE TABLE administrative_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,

  primary_timezone VARCHAR(100),
  desired_go_live_date DATE,

  customer_bandwidth VARCHAR(50), -- Low, Medium, High

  known_blackout_periods JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"start": "2024-12-20", "end": "2024-12-31", "reason": "Holiday freeze"}]

  additional_notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. engineers
Engineer pool with skills and availability.

```sql
CREATE TABLE engineers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,

  -- Skill Tags
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: ["ZIA", "ZPA", "ZDX", "ZCC", "Cloud", "ZTB", "DLP"]

  -- Capability Levels
  max_complexity_level VARCHAR(10) NOT NULL, -- L1, L2, L3, L4

  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  primary_timezone VARCHAR(100),

  -- Workload
  current_projects_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. engineer_assignments
Track engineer assignments to onboarding records.

```sql
CREATE TABLE engineer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES engineers(id),

  role VARCHAR(50) NOT NULL, -- primary, secondary

  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),

  UNIQUE(onboarding_id, role)
);
```

### 8. users
System users (for authentication and authorization).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,

  role VARCHAR(50) NOT NULL,
  -- Roles: account_rep, solutions_architect, engineering_lead, leadership, admin

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. audit_log
Track all state changes and approvals.

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES onboarding_records(id) ON DELETE CASCADE,

  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  -- Actions: created, updated, submitted, approved, rejected, assigned, locked, unlocked

  from_status VARCHAR(50),
  to_status VARCHAR(50),

  notes TEXT,
  metadata JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_onboarding ON audit_log(onboarding_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

## Product Options Reference

### Available Products
- Zscaler for users
- ZIA Deployment
- ZPA Deployment
- ZTB (Zero Trust Branch)
- DLP (Data Loss Prevention)
- Custom
- Environment Cleanup (ZIA)
- Environment Cleanup (ZIA/ZPA)

## Readiness Gate State Machine

```
draft
  ↓
sa_complete (SA signs off)
  ↓
leadership_approved (Leadership approves scope & resourcing)
  ↓
ready_for_delivery (Record locked, Teamwork project created)
  ↓
in_deployment
  ↓
completed
```

## Business Rules

1. **Required Fields for State Transitions:**
   - `draft` → `sa_complete`: All stakeholders, technical environment, administrative details
   - `sa_complete` → `leadership_approved`: SOW created and approved, complexity level set
   - `leadership_approved` → `ready_for_delivery`: Engineer assigned

2. **Locking:**
   - Once status reaches `ready_for_delivery`, record is locked
   - Changes require approval and create audit log entries

3. **Engineer Assignment:**
   - Engineer's `max_complexity_level` must be >= onboarding's `complexity_level`
   - Engineer must have relevant skills matching products sold
