import { User, UserRole, OnboardingStatus } from '../types';

// Role categories
export const isLeadership = (role: UserRole): boolean => {
  return ['director', 'senior_director', 'manager'].includes(role);
};

export const isSales = (role: UserRole): boolean => {
  return ['solutions_architect', 'account_rep'].includes(role);
};

export const isEngineer = (role: UserRole): boolean => {
  return ['lead_solutions_engineer', 'solutions_engineer', 'delivery_engineer'].includes(role);
};

// Permission checks
export const canEditRecord = (user: User | null, recordStatus: OnboardingStatus): boolean => {
  if (!user) return false;

  // Leaders can always edit
  if (isLeadership(user.role)) return true;

  // ONLY SALES can edit in draft status (engineers cannot edit!)
  if (isSales(user.role) && recordStatus === 'draft') return true;

  // Engineers cannot edit records at all
  return false;
};

export const canCreateCustomer = (user: User | null): boolean => {
  if (!user) return false;
  // Only sales and leaders can create new customers
  return isLeadership(user.role) || isSales(user.role);
};

export const canAssignEngineers = (user: User | null): boolean => {
  if (!user) return false;
  return isLeadership(user.role);
};

export const canSubmitToLeadership = (user: User | null): boolean => {
  if (!user) return false;
  // Only Sales can submit to leadership (engineers don't fill out forms!)
  return isSales(user.role);
};

export const canApproveRecord = (user: User | null): boolean => {
  if (!user) return false;
  return isLeadership(user.role);
};

// Filter records based on user role
export const filterRecordsByRole = (records: any[], user: User | null): any[] => {
  if (!user) return [];

  // Leaders see everything
  if (isLeadership(user.role)) return records;

  // Sales see everything
  if (isSales(user.role)) return records;

  // Engineers only see records assigned to them
  if (isEngineer(user.role)) {
    return records.filter(record => {
      if (!record.engineer_assignments || record.engineer_assignments.length === 0) {
        return false;
      }
      return record.engineer_assignments.some((assignment: any) =>
        assignment.engineer_email === user.email
      );
    });
  }

  return [];
};

// Validation
export const validateRequiredFields = (record: any): { valid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];

  // Stakeholders validation
  if (!record.stakeholders?.eliteops_solutions_architect) {
    missingFields.push('Solutions Architect (Stakeholders)');
  }
  if (!record.stakeholders?.customer_primary_name) {
    missingFields.push('Customer Primary Contact Name (Stakeholders)');
  }
  if (!record.stakeholders?.customer_primary_email) {
    missingFields.push('Customer Primary Contact Email (Stakeholders)');
  }

  // Scope validation
  if (!record.commercial_scope?.products_sold || record.commercial_scope.products_sold.length === 0) {
    missingFields.push('Products Sold (Scope)');
  }
  if (!record.commercial_scope?.deployment_type) {
    missingFields.push('Deployment Type (Scope)');
  }
  if (!record.commercial_scope?.sow_file_name) {
    missingFields.push('SOW Document Upload (Scope)');
  }

  // Technical Environment validation
  if (!record.technical_environment) {
    missingFields.push('Technical Environment (all fields)');
  }

  // Administrative validation
  if (!record.administrative_details) {
    missingFields.push('Administrative Details (all fields)');
  }

  // Complexity validation
  if (!record.complexity_level) {
    missingFields.push('Complexity Level');
  }

  return {
    valid: missingFields.length === 0,
    missingFields
  };
};

// Status transition permissions
export const canTransitionToStatus = (
  user: User | null,
  currentStatus: OnboardingStatus,
  targetStatus: OnboardingStatus,
  record: any
): { allowed: boolean; reason?: string } => {
  if (!user) return { allowed: false, reason: 'No user logged in' };

  // Draft -> SA Complete: Only Sales can do this if all fields are complete
  if (currentStatus === 'draft' && targetStatus === 'sa_complete') {
    if (!canSubmitToLeadership(user)) {
      return { allowed: false, reason: 'Only Sales can submit to leadership' };
    }

    const validation = validateRequiredFields(record);
    if (!validation.valid) {
      return {
        allowed: false,
        reason: `Please complete these required fields:\n${validation.missingFields.join('\n')}`
      };
    }

    return { allowed: true };
  }

  // SA Complete -> Leadership Approved: Only leaders, requires complexity and engineer
  if (currentStatus === 'sa_complete' && targetStatus === 'leadership_approved') {
    if (!isLeadership(user.role)) {
      return { allowed: false, reason: 'Only Leadership can approve records' };
    }

    // Check if complexity is assigned
    if (!record.complexity_level) {
      return { allowed: false, reason: 'Please assign a Complexity Level before approving' };
    }

    // Check if at least a primary engineer is assigned
    if (!record.engineer_assignments || record.engineer_assignments.length === 0) {
      return { allowed: false, reason: 'Please assign at least a Primary Engineer before approving' };
    }

    return { allowed: true };
  }

  // Leadership Approved -> Ready for Delivery: Only leaders (after assigning engineers)
  if (currentStatus === 'leadership_approved' && targetStatus === 'ready_for_delivery') {
    if (!isLeadership(user.role)) {
      return { allowed: false, reason: 'Only Leadership can move to Ready for Delivery' };
    }

    if (!record.engineer_assignments || record.engineer_assignments.length === 0) {
      return { allowed: false, reason: 'Please assign at least a primary engineer before proceeding' };
    }

    return { allowed: true };
  }

  // Ready for Delivery -> In Deployment: Engineers assigned to the project
  if (currentStatus === 'ready_for_delivery' && targetStatus === 'in_deployment') {
    if (!isEngineer(user.role)) {
      return { allowed: false, reason: 'Only assigned Engineers can start deployment' };
    }

    const isAssigned = record.engineer_assignments?.some((a: any) => a.engineer_email === user.email);
    if (!isAssigned) {
      return { allowed: false, reason: 'Only assigned Engineers can start deployment' };
    }

    return { allowed: true };
  }

  // In Deployment -> Completed: Assigned engineers
  if (currentStatus === 'in_deployment' && targetStatus === 'completed') {
    if (!isEngineer(user.role)) {
      return { allowed: false, reason: 'Only assigned Engineers can mark as completed' };
    }

    const isAssigned = record.engineer_assignments?.some((a: any) => a.engineer_email === user.email);
    if (!isAssigned) {
      return { allowed: false, reason: 'Only assigned Engineers can mark as completed' };
    }

    return { allowed: true };
  }

  // Rejection: SA Complete -> Draft (Leadership only)
  if (currentStatus === 'sa_complete' && targetStatus === 'draft') {
    if (!isLeadership(user.role)) {
      return { allowed: false, reason: 'Only Leadership can send back to draft' };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Invalid status transition' };
};
