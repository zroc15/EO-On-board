import axios from 'axios';
import {
  OnboardingRecord,
  Stakeholders,
  CommercialScope,
  TechnicalEnvironment,
  AdministrativeDetails,
  Engineer,
  ComplexityLevel,
  OnboardingStatus
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Onboarding API
export const onboardingApi = {
  getAll: (filters?: { status?: string; complexity_level?: string }) =>
    api.get<OnboardingRecord[]>('/onboarding', { params: filters }),

  getById: (id: string) =>
    api.get<OnboardingRecord>(`/onboarding/${id}`),

  create: (data: { customer_name: string; salesforce_account_id?: string; salesforce_opportunity_id?: string }) =>
    api.post<OnboardingRecord>('/onboarding', data),

  updateStakeholders: (id: string, data: Stakeholders) =>
    api.put(`/onboarding/${id}/stakeholders`, data),

  updateCommercial: (id: string, data: CommercialScope) =>
    api.put(`/onboarding/${id}/commercial`, data),

  updateTechnical: (id: string, data: TechnicalEnvironment) =>
    api.put(`/onboarding/${id}/technical`, data),

  updateAdministrative: (id: string, data: AdministrativeDetails) =>
    api.put(`/onboarding/${id}/administrative`, data),

  updateStatus: (id: string, status: OnboardingStatus, userId?: string, notes?: string) =>
    api.post(`/onboarding/${id}/status`, { status, user_id: userId, notes }),

  updateComplexity: (id: string, complexity_level: ComplexityLevel) =>
    api.put(`/onboarding/${id}/complexity`, { complexity_level }),

  assignEngineer: (id: string, engineerId: string, role: 'primary' | 'secondary', assignedBy?: string) =>
    api.post(`/onboarding/${id}/assign`, {
      engineer_id: engineerId,
      role,
      assigned_by: assignedBy
    }),

  getAuditLog: (id: string) =>
    api.get(`/onboarding/${id}/audit`)
};

// Engineer API
export const engineerApi = {
  getAll: (filters?: { available?: boolean; min_complexity?: ComplexityLevel }) =>
    api.get<Engineer[]>('/engineers', { params: filters }),

  getById: (id: string) =>
    api.get<Engineer>(`/engineers/${id}`),

  create: (data: Omit<Engineer, 'id' | 'current_projects_count'>) =>
    api.post<Engineer>('/engineers', data),

  update: (id: string, data: Partial<Engineer>) =>
    api.put<Engineer>(`/engineers/${id}`, data),

  getEligible: (onboardingId: string) =>
    api.get<Engineer[]>(`/engineers/eligible/${onboardingId}`)
};

export default api;
