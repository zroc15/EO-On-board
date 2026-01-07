import { useState, useEffect } from 'react';
import { engineerApi } from '../services/api';
import { Engineer, EngineerAssignment, ComplexityLevel } from '../types';

interface Props {
  onboardingId: string;
  complexityLevel?: ComplexityLevel;
  assignments: EngineerAssignment[];
  onAssign: (engineerId: string, role: 'primary' | 'secondary') => void;
  disabled: boolean;
}

export default function EngineerAssignmentSection({
  onboardingId,
  complexityLevel,
  assignments,
  onAssign,
  disabled
}: Props) {
  const [eligibleEngineers, setEligibleEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrimary, setSelectedPrimary] = useState('');
  const [selectedSecondary, setSelectedSecondary] = useState('');

  useEffect(() => {
    if (complexityLevel) {
      loadEligibleEngineers();
    }
  }, [complexityLevel, onboardingId]);

  const loadEligibleEngineers = async () => {
    try {
      setLoading(true);
      const response = await engineerApi.getEligible(onboardingId);
      setEligibleEngineers(response.data);
    } catch (error) {
      console.error('Failed to load eligible engineers:', error);
    } finally {
      setLoading(false);
    }
  };

  const primaryAssignment = assignments.find((a) => a.role === 'primary');
  const secondaryAssignment = assignments.find((a) => a.role === 'secondary');

  const handleAssignPrimary = () => {
    if (selectedPrimary) {
      onAssign(selectedPrimary, 'primary');
      setSelectedPrimary('');
    }
  };

  const handleAssignSecondary = () => {
    if (selectedSecondary) {
      onAssign(selectedSecondary, 'secondary');
      setSelectedSecondary('');
    }
  };

  if (!complexityLevel) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Complexity Level Required
          </h3>
          <p className="text-sm text-gray-500">
            Please set the complexity level in the Complexity tab before assigning engineers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="max-w-4xl">
          <h3 className="text-lg font-semibold text-gray-900">Engineer Assignment</h3>
          <p className="mt-1 text-sm text-gray-500">
            Assign engineers based on complexity level ({complexityLevel}), skills, and availability.
          </p>

          <div className="mt-6 space-y-6">
            {/* Current Assignments */}
            {(primaryAssignment || secondaryAssignment) && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Assignments</h4>
                {primaryAssignment && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">Primary:</span>{' '}
                    <span className="text-sm text-gray-900">
                      {primaryAssignment.engineer_name} ({primaryAssignment.engineer_email})
                    </span>
                  </div>
                )}
                {secondaryAssignment && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Secondary:</span>{' '}
                    <span className="text-sm text-gray-900">
                      {secondaryAssignment.engineer_name} ({secondaryAssignment.engineer_email})
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Primary Engineer Assignment */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Primary Engineer {!primaryAssignment && <span className="text-red-500">*</span>}
              </h4>
              <div className="flex gap-3">
                <select
                  value={selectedPrimary}
                  onChange={(e) => setSelectedPrimary(e.target.value)}
                  disabled={disabled || loading}
                  className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
                >
                  <option value="">Select engineer...</option>
                  {eligibleEngineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.name} - {engineer.max_complexity_level} ({engineer.current_projects_count}{' '}
                      active) - {engineer.skills.join(', ')}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignPrimary}
                  disabled={disabled || !selectedPrimary || loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {primaryAssignment ? 'Reassign' : 'Assign'}
                </button>
              </div>
            </div>

            {/* Secondary Engineer Assignment */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Secondary Engineer (Optional)</h4>
              <div className="flex gap-3">
                <select
                  value={selectedSecondary}
                  onChange={(e) => setSelectedSecondary(e.target.value)}
                  disabled={disabled || loading}
                  className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm disabled:bg-gray-100"
                >
                  <option value="">Select engineer...</option>
                  {eligibleEngineers
                    .filter((e) => e.id !== primaryAssignment?.engineer_id)
                    .map((engineer) => (
                      <option key={engineer.id} value={engineer.id}>
                        {engineer.name} - {engineer.max_complexity_level} ({engineer.current_projects_count}{' '}
                        active) - {engineer.skills.join(', ')}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignSecondary}
                  disabled={disabled || !selectedSecondary || loading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {secondaryAssignment ? 'Reassign' : 'Assign'}
                </button>
              </div>
            </div>

            {/* Eligible Engineers List */}
            {loading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Loading eligible engineers...</p>
              </div>
            ) : eligibleEngineers.length === 0 ? (
              <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No eligible engineers found for this complexity level ({complexityLevel}).
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Eligible Engineers ({eligibleEngineers.length})
                </h4>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
                          Max Level
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
                          Skills
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
                          Workload
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900">
                          Timezone
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {eligibleEngineers.map((engineer) => (
                        <tr key={engineer.id}>
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {engineer.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                            {engineer.max_complexity_level}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {engineer.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                            {engineer.current_projects_count} active
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                            {engineer.primary_timezone || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
