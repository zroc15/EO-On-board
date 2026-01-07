import { useState } from 'react';
import { OnboardingStatus, STATUS_LABELS } from '../types';

interface Props {
  currentStatus: OnboardingStatus;
  onStatusChange: (newStatus: OnboardingStatus, notes?: string) => void;
  disabled: boolean;
}

export default function StatusTransition({ currentStatus, onStatusChange, disabled }: Props) {
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OnboardingStatus | null>(null);

  const validTransitions: Record<OnboardingStatus, OnboardingStatus[]> = {
    draft: ['sa_complete'],
    sa_complete: ['leadership_approved', 'draft'],
    leadership_approved: ['ready_for_delivery', 'sa_complete'],
    ready_for_delivery: ['in_deployment', 'leadership_approved'],
    in_deployment: ['completed'],
    completed: []
  };

  const availableTransitions = validTransitions[currentStatus] || [];

  const handleTransitionClick = (newStatus: OnboardingStatus) => {
    setTargetStatus(newStatus);
    setShowConfirm(true);
  };

  const confirmTransition = () => {
    if (targetStatus) {
      onStatusChange(targetStatus, notes || undefined);
      setShowConfirm(false);
      setNotes('');
      setTargetStatus(null);
    }
  };

  const cancelTransition = () => {
    setShowConfirm(false);
    setNotes('');
    setTargetStatus(null);
  };

  const getStatusDescription = (status: OnboardingStatus): string => {
    const descriptions: Record<OnboardingStatus, string> = {
      draft: 'Initial data entry and information gathering',
      sa_complete: 'Solutions Architect has reviewed and approved technical details',
      leadership_approved: 'Leadership has approved scope, resourcing, and SOW',
      ready_for_delivery: 'Record locked, engineer assigned, ready for deployment',
      in_deployment: 'Active deployment in progress',
      completed: 'Deployment finished and handed off'
    };
    return descriptions[status];
  };

  const getStatusRequirements = (status: OnboardingStatus): string[] => {
    const requirements: Record<OnboardingStatus, string[]> = {
      draft: ['Customer name entered'],
      sa_complete: [
        'All stakeholders identified',
        'Technical environment documented',
        'Administrative details completed'
      ],
      leadership_approved: [
        'SOW created and approved',
        'Complexity level set',
        'Products and scope finalized'
      ],
      ready_for_delivery: [
        'Primary engineer assigned',
        'All required fields completed',
        'Record will be locked'
      ],
      in_deployment: ['Deployment started'],
      completed: ['All deployment tasks finished']
    };
    return requirements[status] || [];
  };

  if (availableTransitions.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          This onboarding is complete. No further status changes available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Available transitions:</span>
        {availableTransitions.map((status) => (
          <button
            key={status}
            onClick={() => handleTransitionClick(status)}
            disabled={disabled}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move to {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {showConfirm && targetStatus && (
        <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm Status Change
          </h4>
          <p className="text-sm text-gray-700 mb-4">
            You are about to change status from <strong>{STATUS_LABELS[currentStatus]}</strong> to{' '}
            <strong>{STATUS_LABELS[targetStatus]}</strong>.
          </p>

          <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm font-medium text-blue-900 mb-1">
              {STATUS_LABELS[targetStatus]}
            </p>
            <p className="text-xs text-blue-700 mb-2">{getStatusDescription(targetStatus)}</p>
            <div className="text-xs text-blue-700">
              <strong>Requirements:</strong>
              <ul className="list-disc list-inside mt-1">
                {getStatusRequirements(targetStatus).map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this status change..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelTransition}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmTransition}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Confirm Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
