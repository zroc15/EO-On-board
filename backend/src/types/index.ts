// Type definitions for the onboarding system

export type OnboardingStatus =
  | 'draft'
  | 'sa_complete'
  | 'leadership_approved'
  | 'ready_for_delivery'
  | 'in_deployment'
  | 'completed';

export type ComplexityLevel = 'L1' | 'L2' | 'L3' | 'L4';

export type DeploymentType = 'POC' | 'Production';

export type CustomerBandwidth = 'Low' | 'Medium' | 'High';

export type UserRole =
  | 'account_rep'
  | 'solutions_architect'
  | 'engineering_lead'
  | 'leadership'
  | 'admin';

export type EngineerRole = 'primary' | 'secondary';

export interface OnboardingRecord {
  id: string;
  salesforce_account_id?: string;
  salesforce_opportunity_id?: string;
  customer_name: string;
  status: OnboardingStatus;
  complexity_level?: ComplexityLevel;
  teamwork_project_id?: string;
  created_at: Date;
  updated_at: Date;
  submitted_at?: Date;
  approved_at?: Date;
  deployment_started_at?: Date;
  completed_at?: Date;
  is_locked: boolean;
  locked_at?: Date;
  locked_by?: string;
}

export interface Stakeholders {
  id: string;
  onboarding_id: string;
  eliteops_account_rep?: string;
  eliteops_solutions_architect: string;
  eliteops_engineering_lead?: string;
  zscaler_account_rep?: string;
  zscaler_se?: string;
  customer_primary_name: string;
  customer_primary_email: string;
  customer_primary_phone?: string;
  customer_secondary_name?: string;
  customer_secondary_email?: string;
  customer_secondary_phone?: string;
}

export interface CommercialScope {
  id: string;
  onboarding_id: string;
  products_sold: string[];
  contract_start_date?: Date;
  deployment_type?: DeploymentType;
  term_length?: number;
  sow_created: boolean;
  sow_approved: boolean;
  sow_document_url?: string;
}

export interface TechnicalEnvironment {
  id: string;
  onboarding_id: string;
  idp?: string;
  edr?: string;
  mdm?: string;
  device_os_mac_percent: number;
  device_os_windows_percent: number;
  device_os_linux_percent: number;
  zia_critical_saas_apps: Array<{ name: string; importance: string }>;
  zpa_critical_internal_apps: Array<{ name: string; type: string }>;
  zpa_app_types: string[];
  branches_locations?: string;
  lss_nss: boolean;
  siem?: string;
  vpn?: string;
  cloud_providers: string[];
  replacing_tech: boolean;
  replacing_tech_details?: string;
}

export interface AdministrativeDetails {
  id: string;
  onboarding_id: string;
  primary_timezone?: string;
  desired_go_live_date?: Date;
  customer_bandwidth?: CustomerBandwidth;
  known_blackout_periods: Array<{ start: string; end: string; reason: string }>;
  additional_notes?: string;
}

export interface Engineer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  max_complexity_level: ComplexityLevel;
  is_available: boolean;
  primary_timezone?: string;
  current_projects_count: number;
}

export interface EngineerAssignment {
  id: string;
  onboarding_id: string;
  engineer_id: string;
  role: EngineerRole;
  assigned_at: Date;
  assigned_by?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  onboarding_id: string;
  user_id?: string;
  action: string;
  from_status?: string;
  to_status?: string;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

// Product options
export const PRODUCT_OPTIONS = [
  'Zscaler for users',
  'ZIA Deployment',
  'ZPA Deployment',
  'ZTB',
  'DLP',
  'Custom',
  'Environment Cleanup (ZIA)',
  'Environment Cleanup (ZIA/ZPA)'
] as const;

// Skill options for engineers
export const SKILL_OPTIONS = [
  'ZIA',
  'ZPA',
  'ZDX',
  'ZCC',
  'Cloud',
  'ZTB',
  'DLP'
] as const;
