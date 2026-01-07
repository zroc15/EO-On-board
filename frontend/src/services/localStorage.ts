import {
  OnboardingRecord,
  Stakeholders,
  CommercialScope,
  TechnicalEnvironment,
  AdministrativeDetails,
  Engineer,
  ComplexityLevel,
  OnboardingStatus,
  User
} from '../types';

// Generate UUID
const generateId = () => crypto.randomUUID();

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_RECORDS: 'eliteops_onboarding_records',
  ENGINEERS: 'eliteops_engineers',
  USERS: 'eliteops_users',
  CURRENT_USER: 'eliteops_current_user',
  NOTIFICATIONS: 'eliteops_notifications'
};

// Initialize with sample data if empty
const initializeData = () => {
  // Initialize users
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const initialUsers: User[] = [
      // Leadership
      { id: generateId(), email: 'sarah.director@eliteops.com', name: 'Sarah Chen', role: 'director', is_active: true },
      { id: generateId(), email: 'michael.manager@eliteops.com', name: 'Michael Roberts', role: 'manager', is_active: true },

      // Sales
      { id: generateId(), email: 'jessica.sa@eliteops.com', name: 'Jessica Anderson', role: 'solutions_architect', is_active: true },
      { id: generateId(), email: 'david.rep@eliteops.com', name: 'David Martinez', role: 'account_rep', is_active: true },

      // Engineers
      { id: generateId(), email: 'john.smith@eliteops.com', name: 'John Smith', role: 'lead_solutions_engineer', is_active: true },
      { id: generateId(), email: 'emily.davis@eliteops.com', name: 'Emily Davis', role: 'solutions_engineer', is_active: true },
      { id: generateId(), email: 'alex.rodriguez@eliteops.com', name: 'Alex Rodriguez', role: 'delivery_engineer', is_active: true }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }

  // Initialize engineers
  if (!localStorage.getItem(STORAGE_KEYS.ENGINEERS)) {
    const initialEngineers: Engineer[] = [
      {
        id: generateId(),
        name: 'John Smith',
        email: 'john.smith@eliteops.com',
        skills: ['ZIA', 'ZPA', 'Cloud', 'DLP'],
        max_complexity_level: 'L4',
        is_available: true,
        primary_timezone: 'America/New_York',
        current_projects_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Emily Davis',
        email: 'emily.davis@eliteops.com',
        skills: ['ZIA', 'ZPA', 'ZCC'],
        max_complexity_level: 'L3',
        is_available: true,
        primary_timezone: 'America/Los_Angeles',
        current_projects_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@eliteops.com',
        skills: ['ZIA', 'ZPA'],
        max_complexity_level: 'L2',
        is_available: true,
        primary_timezone: 'America/Chicago',
        current_projects_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ENGINEERS, JSON.stringify(initialEngineers));
  }

  // Initialize onboarding records
  if (!localStorage.getItem(STORAGE_KEYS.ONBOARDING_RECORDS)) {
    const initialRecords: OnboardingRecord[] = [
      {
        id: generateId(),
        customer_name: 'Acme Corporation',
        salesforce_opportunity_id: 'OPP-12345',
        status: 'draft',
        complexity_level: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_locked: false
      },
      {
        id: generateId(),
        customer_name: 'TechStart Industries',
        salesforce_opportunity_id: 'OPP-12346',
        status: 'sa_complete',
        complexity_level: 'L2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_locked: false
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_RECORDS, JSON.stringify(initialRecords));
  }
};

// Initialize on load
initializeData();

// Storage Service
export const storageService = {
  // Users
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getAllUsers(): User[] {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  getUserByEmail(email: string): User | undefined {
    const users = this.getAllUsers();
    return users.find(u => u.email === email);
  },

  // Onboarding Records
  getAllOnboarding(filters?: { status?: string }): OnboardingRecord[] {
    const recordsJson = localStorage.getItem(STORAGE_KEYS.ONBOARDING_RECORDS);
    let records: OnboardingRecord[] = recordsJson ? JSON.parse(recordsJson) : [];

    if (filters?.status) {
      records = records.filter(r => r.status === filters.status);
    }

    return records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getOnboardingById(id: string): OnboardingRecord | null {
    const records = this.getAllOnboarding();
    const record = records.find(r => r.id === id);

    if (!record) return null;

    // Get related data
    const stakeholders = this.getStakeholders(id);
    const commercial = this.getCommercialScope(id);
    const technical = this.getTechnicalEnvironment(id);
    const administrative = this.getAdministrativeDetails(id);
    const assignments = this.getEngineerAssignments(id);

    return {
      ...record,
      stakeholders,
      commercial_scope: commercial,
      technical_environment: technical,
      administrative_details: administrative,
      engineer_assignments: assignments
    };
  },

  createOnboarding(data: { customer_name: string; salesforce_opportunity_id?: string }): OnboardingRecord {
    const records = this.getAllOnboarding();
    const newRecord: OnboardingRecord = {
      id: generateId(),
      customer_name: data.customer_name,
      salesforce_opportunity_id: data.salesforce_opportunity_id,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_locked: false
    };

    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_RECORDS, JSON.stringify(records));

    // Initialize empty related data
    this.updateStakeholders(newRecord.id, {
      eliteops_solutions_architect: '',
      customer_primary_name: '',
      customer_primary_email: ''
    } as Stakeholders);

    this.updateCommercialScope(newRecord.id, {
      products_sold: [],
      sow_created: false,
      sow_approved: false
    } as CommercialScope);

    this.updateTechnicalEnvironment(newRecord.id, {
      device_os_mac_percent: 0,
      device_os_windows_percent: 0,
      device_os_linux_percent: 0,
      zia_critical_saas_apps: [],
      zpa_critical_internal_apps: [],
      zpa_app_types: [],
      cloud_providers: [],
      lss_nss: false,
      replacing_tech: false
    } as TechnicalEnvironment);

    this.updateAdministrativeDetails(newRecord.id, {
      known_blackout_periods: []
    } as AdministrativeDetails);

    return newRecord;
  },

  updateOnboardingStatus(id: string, status: OnboardingStatus): OnboardingRecord | null {
    const records = this.getAllOnboarding();
    const index = records.findIndex(r => r.id === id);

    if (index === -1) return null;

    records[index] = {
      ...records[index],
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'sa_complete' && { submitted_at: new Date().toISOString() }),
      ...(status === 'leadership_approved' && { approved_at: new Date().toISOString() }),
      ...(status === 'ready_for_delivery' && {
        is_locked: true,
        locked_at: new Date().toISOString()
      }),
      ...(status === 'in_deployment' && { deployment_started_at: new Date().toISOString() }),
      ...(status === 'completed' && { completed_at: new Date().toISOString() })
    };

    localStorage.setItem(STORAGE_KEYS.ONBOARDING_RECORDS, JSON.stringify(records));

    // Create notification
    if (status === 'leadership_approved') {
      this.createNotification({
        title: 'New onboarding ready for review',
        message: `${records[index].customer_name} is ready for engineer assignment`,
        type: 'assignment_needed',
        onboarding_id: id
      });
    }

    return records[index];
  },

  updateComplexity(id: string, complexity_level: ComplexityLevel): OnboardingRecord | null {
    const records = this.getAllOnboarding();
    const index = records.findIndex(r => r.id === id);

    if (index === -1) return null;

    records[index] = {
      ...records[index],
      complexity_level,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.ONBOARDING_RECORDS, JSON.stringify(records));
    return records[index];
  },

  // Stakeholders
  getStakeholders(onboardingId: string): Stakeholders | undefined {
    const key = `stakeholders_${onboardingId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  },

  updateStakeholders(onboardingId: string, data: Stakeholders): Stakeholders {
    const key = `stakeholders_${onboardingId}`;
    localStorage.setItem(key, JSON.stringify(data));
    this.touchOnboarding(onboardingId);
    return data;
  },

  // Commercial Scope
  getCommercialScope(onboardingId: string): CommercialScope | undefined {
    const key = `commercial_${onboardingId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  },

  updateCommercialScope(onboardingId: string, data: CommercialScope): CommercialScope {
    const key = `commercial_${onboardingId}`;
    localStorage.setItem(key, JSON.stringify(data));
    this.touchOnboarding(onboardingId);
    return data;
  },

  // Technical Environment
  getTechnicalEnvironment(onboardingId: string): TechnicalEnvironment | undefined {
    const key = `technical_${onboardingId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  },

  updateTechnicalEnvironment(onboardingId: string, data: TechnicalEnvironment): TechnicalEnvironment {
    const key = `technical_${onboardingId}`;
    localStorage.setItem(key, JSON.stringify(data));
    this.touchOnboarding(onboardingId);
    return data;
  },

  // Administrative Details
  getAdministrativeDetails(onboardingId: string): AdministrativeDetails | undefined {
    const key = `administrative_${onboardingId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  },

  updateAdministrativeDetails(onboardingId: string, data: AdministrativeDetails): AdministrativeDetails {
    const key = `administrative_${onboardingId}`;
    localStorage.setItem(key, JSON.stringify(data));
    this.touchOnboarding(onboardingId);
    return data;
  },

  // Engineer Assignments
  getEngineerAssignments(onboardingId: string): any[] {
    const key = `assignments_${onboardingId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  assignEngineer(onboardingId: string, engineerId: string, role: 'primary' | 'secondary'): void {
    const assignments = this.getEngineerAssignments(onboardingId);
    const existingIndex = assignments.findIndex((a: any) => a.role === role);

    const engineer = this.getEngineerById(engineerId);
    const assignment = {
      id: generateId(),
      onboarding_id: onboardingId,
      engineer_id: engineerId,
      engineer_name: engineer?.name,
      engineer_email: engineer?.email,
      role,
      assigned_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      assignments[existingIndex] = assignment;
    } else {
      assignments.push(assignment);
    }

    const key = `assignments_${onboardingId}`;
    localStorage.setItem(key, JSON.stringify(assignments));
    this.touchOnboarding(onboardingId);

    // Create notification for engineer
    if (engineer) {
      const record = this.getAllOnboarding().find(r => r.id === onboardingId);
      this.createNotification({
        title: 'New deployment assigned',
        message: `You've been assigned to ${record?.customer_name} as ${role} engineer`,
        type: 'assignment',
        onboarding_id: onboardingId,
        user_email: engineer.email
      });
    }
  },

  // Engineers
  getAllEngineers(filters?: { available?: boolean; min_complexity?: ComplexityLevel }): Engineer[] {
    const engineersJson = localStorage.getItem(STORAGE_KEYS.ENGINEERS);
    let engineers: Engineer[] = engineersJson ? JSON.parse(engineersJson) : [];

    if (filters?.available !== undefined) {
      engineers = engineers.filter(e => e.is_available === filters.available);
    }

    if (filters?.min_complexity) {
      const levels: Record<ComplexityLevel, ComplexityLevel[]> = {
        'L1': ['L1', 'L2', 'L3', 'L4'],
        'L2': ['L2', 'L3', 'L4'],
        'L3': ['L3', 'L4'],
        'L4': ['L4']
      };
      const validLevels = levels[filters.min_complexity];
      engineers = engineers.filter(e => validLevels.includes(e.max_complexity_level));
    }

    return engineers;
  },

  getEngineerById(id: string): Engineer | undefined {
    const engineers = this.getAllEngineers();
    return engineers.find(e => e.id === id);
  },

  getEligibleEngineers(onboardingId: string): Engineer[] {
    const record = this.getAllOnboarding().find(r => r.id === onboardingId);
    if (!record?.complexity_level) return [];

    return this.getAllEngineers({
      available: true,
      min_complexity: record.complexity_level
    });
  },

  // Notifications
  createNotification(notification: {
    title: string;
    message: string;
    type: string;
    onboarding_id?: string;
    user_email?: string;
  }): void {
    const notificationsJson = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];

    notifications.push({
      id: generateId(),
      ...notification,
      created_at: new Date().toISOString(),
      read: false
    });

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  getNotifications(userEmail?: string): any[] {
    const notificationsJson = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let notifications = notificationsJson ? JSON.parse(notificationsJson) : [];

    if (userEmail) {
      notifications = notifications.filter((n: any) =>
        !n.user_email || n.user_email === userEmail
      );
    }

    return notifications.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  markNotificationRead(id: string): void {
    const notificationsJson = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];

    const index = notifications.findIndex((n: any) => n.id === id);
    if (index >= 0) {
      notifications[index].read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
  },

  // Helper to update timestamp
  touchOnboarding(id: string): void {
    const records = this.getAllOnboarding();
    const index = records.findIndex(r => r.id === id);
    if (index >= 0) {
      records[index].updated_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_RECORDS, JSON.stringify(records));
    }
  }
};
