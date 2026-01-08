import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/localStorage';
import {
  OnboardingRecord,
  Stakeholders,
  CommercialScope,
  TechnicalEnvironment,
  AdministrativeDetails,
  ComplexityLevel,
  STATUS_LABELS,
  STATUS_COLORS
} from '../types';
import { canEditRecord, canAssignEngineers } from '../utils/permissions';

import StakeholdersSection from '../components/StakeholdersSection';
import CommercialSection from '../components/CommercialSection';
import TechnicalSection from '../components/TechnicalSection';
import AdministrativeSection from '../components/AdministrativeSection';
import ComplexitySection from '../components/ComplexitySection';
import EngineerAssignmentSection from '../components/EngineerAssignmentSection';
import StatusTransition from '../components/StatusTransition';

export default function OnboardingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<OnboardingRecord | null>(null);
  const [activeTab, setActiveTab] = useState('stakeholders');

  useEffect(() => {
    if (id) {
      loadRecord();
    }
  }, [id]);

  const loadRecord = () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = storageService.getOnboardingById(id);
      setRecord(data);
    } catch (error) {
      console.error('Failed to load record:', error);
      alert('Failed to load onboarding record');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = (customerName: string) => {
    try {
      setSaving(true);
      const newRecord = storageService.createOnboarding({ customer_name: customerName });
      navigate(`/onboarding/${newRecord.id}`);
    } catch (error) {
      console.error('Failed to create record:', error);
      alert('Failed to create onboarding record');
      setSaving(false);
    }
  };

  const handleSaveStakeholders = (data: Stakeholders) => {
    if (!id) return;
    try {
      setSaving(true);
      storageService.updateStakeholders(id, data);
      loadRecord();
      alert('Stakeholders saved successfully');
    } catch (error: any) {
      console.error('Failed to save stakeholders:', error);
      alert(error.message || 'Failed to save stakeholders');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCommercial = (data: CommercialScope) => {
    if (!id) return;
    try {
      setSaving(true);
      storageService.updateCommercialScope(id, data);
      loadRecord();
      alert('Commercial data saved successfully');
    } catch (error: any) {
      console.error('Failed to save commercial data:', error);
      alert(error.message || 'Failed to save commercial data');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTechnical = (data: TechnicalEnvironment) => {
    if (!id) return;
    try {
      setSaving(true);
      storageService.updateTechnicalEnvironment(id, data);
      loadRecord();
      alert('Technical environment saved successfully');
    } catch (error: any) {
      console.error('Failed to save technical environment:', error);
      alert(error.message || 'Failed to save technical environment');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdministrative = (data: AdministrativeDetails) => {
    if (!id) return;
    try {
      setSaving(true);
      storageService.updateAdministrativeDetails(id, data);
      loadRecord();
      alert('Administrative details saved successfully');
    } catch (error: any) {
      console.error('Failed to save administrative details:', error);
      alert(error.message || 'Failed to save administrative details');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveComplexity = (level: ComplexityLevel) => {
    if (!id) return;
    try {
      setSaving(true);
      storageService.updateComplexity(id, level);
      loadRecord();
      alert('Complexity level saved successfully');
    } catch (error: any) {
      console.error('Failed to save complexity level:', error);
      alert(error.message || 'Failed to save complexity level');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignEngineer = (engineerId: string, role: 'primary' | 'secondary') => {
    if (!id) return;
    try {
      setSaving(true);
      storageService.assignEngineer(id, engineerId, role);
      loadRecord();
      alert('Engineer assigned successfully');
    } catch (error: any) {
      console.error('Failed to assign engineer:', error);
      alert(error.message || 'Failed to assign engineer');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!id) return;
    try {
      setSaving(true);
      storageService.updateOnboardingStatus(id, newStatus as any);
      loadRecord();
      alert('Status updated successfully');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(error.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Create New Onboarding Record
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateNew(formData.get('customer_name') as string);
            }}
            className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
          >
            <div className="px-4 py-6 sm:p-8">
              <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="customer_name" className="block text-sm font-medium leading-6 text-gray-900">
                    Customer Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="customer_name"
                      id="customer_name"
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Record not found</p>
        </div>
      </div>
    );
  }

  const currentUser = storageService.getCurrentUser();

  // Permission checks
  const canEdit = canEditRecord(currentUser, record.status);
  const canAssign = canAssignEngineers(currentUser);
  const isFormDisabled = !canEdit || record.is_locked || saving;

  const allTabs = [
    { id: 'stakeholders', name: 'Stakeholders', required: true },
    { id: 'commercial', name: 'Scope', required: true },
    { id: 'technical', name: 'Technical Environment', required: true },
    { id: 'administrative', name: 'Administrative', required: true },
    { id: 'complexity', name: 'Complexity', required: true },
    { id: 'engineer', name: 'Engineer Assignment', required: false }
  ];

  // Filter tabs based on permissions - hide Engineer Assignment for non-leaders
  const tabs = canAssign
    ? allTabs
    : allTabs.filter(tab => tab.id !== 'engineer');

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {record.customer_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {record.id}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                STATUS_COLORS[record.status]
              }`}
            >
              {STATUS_LABELS[record.status]}
            </span>
            {record.is_locked && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                🔒 Locked
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <StatusTransition
          currentStatus={record.status}
          onStatusChange={handleStatusChange}
          disabled={saving}
          record={record}
          currentUser={storageService.getCurrentUser()}
        />
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              {tab.name}
              {tab.required && <span className="text-red-500 ml-1">*</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'stakeholders' && (
          <StakeholdersSection
            data={record.stakeholders}
            onSave={handleSaveStakeholders}
            disabled={isFormDisabled}
          />
        )}
        {activeTab === 'commercial' && (
          <CommercialSection
            data={record.commercial_scope}
            onSave={handleSaveCommercial}
            disabled={isFormDisabled}
          />
        )}
        {activeTab === 'technical' && (
          <TechnicalSection
            data={record.technical_environment}
            onSave={handleSaveTechnical}
            disabled={isFormDisabled}
          />
        )}
        {activeTab === 'administrative' && (
          <AdministrativeSection
            data={record.administrative_details}
            onSave={handleSaveAdministrative}
            disabled={isFormDisabled}
          />
        )}
        {activeTab === 'complexity' && (
          <ComplexitySection
            complexityLevel={record.complexity_level}
            onSave={handleSaveComplexity}
            disabled={isFormDisabled}
          />
        )}
        {activeTab === 'engineer' && (
          <EngineerAssignmentSection
            onboardingId={record.id}
            complexityLevel={record.complexity_level}
            assignments={record.engineer_assignments || []}
            onAssign={handleAssignEngineer}
            disabled={!canAssign || saving}
          />
        )}
      </div>
    </div>
  );
}
