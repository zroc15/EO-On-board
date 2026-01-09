import { useState } from 'react';
import { OnboardingStatus, STATUS_LABELS, OnboardingRecord, User } from '../types';
import { canTransitionToStatus } from '../utils/permissions';

interface Props {
  currentStatus: OnboardingStatus;
  onStatusChange: (newStatus: OnboardingStatus, notes?: string) => void;
  disabled: boolean;
  record: OnboardingRecord;
  currentUser: User | null;
}

export default function StatusTransition({ currentStatus, onStatusChange, disabled, record, currentUser }: Props) {
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetStatus, setTargetStatus] = useState<OnboardingStatus | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Simplified 3-status workflow transitions
  const validTransitions: Record<OnboardingStatus, OnboardingStatus[]> = {
    draft: ['sa_complete'],                           // Draft → Awaiting Review
    sa_complete: ['leadership_approved', 'draft'],    // Awaiting Review → Ready for Delivery or back to Draft
    leadership_approved: ['sa_complete']              // Ready for Delivery → back to Awaiting Review
  };

  const availableTransitions = validTransitions[currentStatus] || [];

  const handleTransitionClick = (newStatus: OnboardingStatus) => {
    // Check permissions and validate fields
    const transitionCheck = canTransitionToStatus(currentUser, currentStatus, newStatus, record);

    if (!transitionCheck.allowed) {
      setValidationError(transitionCheck.reason || 'This transition is not allowed');
      return;
    }

    setValidationError(null);
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
      sa_complete: 'Awaiting leadership review for complexity and engineer assignment',
      leadership_approved: 'Ready for delivery - engineer assigned and deployment can begin'
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
        'Complexity level set',
        'Primary engineer assigned',
        'SOW created and approved'
      ]
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

      {/* Validation Error */}
      {validationError && (
        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-red-800">Cannot proceed with status change</h3>
              <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                {validationError}
              </div>
            </div>
          </div>
        </div>
      )}

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
