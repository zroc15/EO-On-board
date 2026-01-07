export type OnboardingStatus =
  | 'draft'
  | 'sa_complete'
  | 'leadership_approved'
  | 'ready_for_delivery'
  | 'in_deployment'
  | 'completed';

export type ComplexityLevel = 'L1' | 'L2' | 'L3' | 'L4';

export type DeploymentType = 'POC' | 'Greenfield' | 'Optimize' | 'ProServ';

export type CustomerBandwidth = 'Low' | 'Medium' | 'High';

export type UserRole =
  | 'director'
  | 'senior_director'
  | 'manager'
  | 'solutions_architect'
  | 'account_rep'
  | 'lead_solutions_engineer'
  | 'solutions_engineer'
  | 'delivery_engineer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
}

export interface OnboardingRecord {
  id: string;
  customer_name: string;
  salesforce_account_id?: string;
  salesforce_opportunity_id?: string;
  status: OnboardingStatus;
  complexity_level?: ComplexityLevel;
  teamwork_project_id?: string;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  stakeholders?: Stakeholders;
  commercial_scope?: CommercialScope;
  technical_environment?: TechnicalEnvironment;
  administrative_details?: AdministrativeDetails;
  engineer_assignments?: EngineerAssignment[];
}

export interface Stakeholders {
  eliteops_account_rep?: string;
  eliteops_solutions_architect: string;
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
  products_sold: string[];
  contract_start_date?: string;
  deployment_type?: DeploymentType;
  term_length?: number;
  sow_file_name?: string;
  sow_file_data?: string; // base64 encoded file
  sow_uploaded_at?: string;
}

export interface TechnicalEnvironment {
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
  primary_timezone?: string;
  desired_go_live_date?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface EngineerAssignment {
  id: string;
  onboarding_id: string;
  engineer_id: string;
  engineer_name?: string;
  engineer_email?: string;
  role: 'primary' | 'secondary';
  assigned_at: string;
}

export const PRODUCT_OPTIONS = [
  'Zscaler for users',
  'ZIA Deployment',
  'ZPA Deployment',
  'ZTB',
  'DLP',
  'Custom',
  'Environment Cleanup (ZIA)',
  'Environment Cleanup (ZIA/ZPA)'
];

export const SKILL_OPTIONS = [
  'ZIA',
  'ZPA',
  'ZDX',
  'ZCC',
  'Cloud',
  'ZTB',
  'DLP'
];

export const STATUS_LABELS: Record<OnboardingStatus, string> = {
  draft: 'Draft',
  sa_complete: 'SA Complete',
  leadership_approved: 'Leadership Approved',
  ready_for_delivery: 'Ready for Delivery',
  in_deployment: 'In Deployment',
  completed: 'Completed'
};

export const STATUS_COLORS: Record<OnboardingStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sa_complete: 'bg-blue-100 text-blue-800',
  leadership_approved: 'bg-purple-100 text-purple-800',
  ready_for_delivery: 'bg-green-100 text-green-800',
  in_deployment: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-emerald-100 text-emerald-800'
};
