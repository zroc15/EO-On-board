import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/localStorage';
import { OnboardingRecord, Engineer } from '../types';

export default function LeadershipDashboard() {
  const [pendingReviews, setPendingReviews] = useState<OnboardingRecord[]>([]);
  const [readyForAssignment, setReadyForAssignment] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<OnboardingRecord | null>(null);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [selectedPrimaryEngineer, setSelectedPrimaryEngineer] = useState('');
  const [selectedSecondaryEngineer, setSelectedSecondaryEngineer] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);

      // Get records pending leadership approval
      const pending = storageService.getAllOnboarding({ status: 'sa_complete' });
      setPendingReviews(pending);

      // Get records approved but not yet assigned
      const approved = storageService.getAllOnboarding({ status: 'leadership_approved' });
      setReadyForAssignment(approved);

      setEngineers(storageService.getAllEngineers({ available: true }));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (recordId: string) => {
    try {
      storageService.updateOnboardingStatus(recordId, 'leadership_approved');
      loadData();
      alert('Onboarding record approved successfully!');
    } catch (error) {
      console.error('Failed to approve record:', error);
      alert('Failed to approve record');
    }
  };

  const handleReject = (recordId: string) => {
    try {
      storageService.updateOnboardingStatus(recordId, 'draft');
      loadData();
      alert('Onboarding record sent back to draft for revisions');
    } catch (error) {
      console.error('Failed to reject record:', error);
      alert('Failed to reject record');
    }
  };

  const handleAssignEngineers = () => {
    if (!selectedRecord || !selectedPrimaryEngineer) {
      alert('Please select a primary engineer');
      return;
    }

    try {
      // Assign primary engineer
      storageService.assignEngineer(selectedRecord.id, selectedPrimaryEngineer, 'primary');

      // Assign secondary engineer if selected
      if (selectedSecondaryEngineer) {
        storageService.assignEngineer(selectedRecord.id, selectedSecondaryEngineer, 'secondary');
      }

      // Engineer assignment is done during leadership approval, no need to update status again

      // Reset and reload
      setSelectedRecord(null);
      setSelectedPrimaryEngineer('');
      setSelectedSecondaryEngineer('');
      loadData();

      alert('Engineers assigned successfully! Onboarding is now ready for delivery.');
    } catch (error) {
      console.error('Failed to assign engineers:', error);
      alert('Failed to assign engineers');
    }
  };

  const getEligibleEngineers = (complexityLevel?: string) => {
    if (!complexityLevel) return engineers;

    const levels: Record<string, string[]> = {
      'L1': ['L1', 'L2', 'L3', 'L4'],
      'L2': ['L2', 'L3', 'L4'],
      'L3': ['L3', 'L4'],
      'L4': ['L4']
    };

    const validLevels = levels[complexityLevel] || [];
    return engineers.filter(e => validLevels.includes(e.max_complexity_level));
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leadership Review Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and approve onboarding records, then assign engineers for delivery.
          </p>
        </div>
      </div>

      {/* Pending Reviews Section */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Reviews ({pendingReviews.length})
        </h2>

        {pendingReviews.length === 0 ? (
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg p-8 text-center">
            <p className="text-gray-500">No records pending review</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Complexity
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    SA
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Submitted
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pendingReviews.map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {record.customer_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {record.complexity_level || 'Not set'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {record.stakeholders?.eliteops_solutions_architect || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium space-x-2 sm:pr-6">
                      <Link
                        to={`/onboarding/${record.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Review
                      </Link>
                      <button
                        onClick={() => handleApprove(record.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Engineer Assignment Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ready for Engineer Assignment ({readyForAssignment.length})
        </h2>

        {readyForAssignment.length === 0 ? (
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg p-8 text-center">
            <p className="text-gray-500">No records ready for engineer assignment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {readyForAssignment.map((record) => (
              <div
                key={record.id}
                className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {record.customer_name}
                    </h3>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Complexity</p>
                        <p className="text-sm font-medium text-gray-900">
                          {record.complexity_level}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Products</p>
                        <p className="text-sm font-medium text-gray-900">
                          {record.commercial_scope?.products_sold?.join(', ') || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">SA</p>
                        <p className="text-sm font-medium text-gray-900">
                          {record.stakeholders?.eliteops_solutions_architect || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                  >
                    Assign Engineers
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engineer Assignment Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Engineers to {selectedRecord.customer_name}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Complexity Level: <span className="font-semibold">{selectedRecord.complexity_level}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Eligible Engineers: {getEligibleEngineers(selectedRecord.complexity_level).length}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Primary Engineer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Engineer <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPrimaryEngineer}
                  onChange={(e) => setSelectedPrimaryEngineer(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select engineer...</option>
                  {getEligibleEngineers(selectedRecord.complexity_level).map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.name} - {engineer.max_complexity_level} ({engineer.current_projects_count} active) - {engineer.skills.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Engineer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Engineer (Optional)
                </label>
                <select
                  value={selectedSecondaryEngineer}
                  onChange={(e) => setSelectedSecondaryEngineer(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select engineer...</option>
                  {getEligibleEngineers(selectedRecord.complexity_level)
                    .filter(e => e.id !== selectedPrimaryEngineer)
                    .map((engineer) => (
                      <option key={engineer.id} value={engineer.id}>
                        {engineer.name} - {engineer.max_complexity_level} ({engineer.current_projects_count} active) - {engineer.skills.join(', ')}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setSelectedPrimaryEngineer('');
                  setSelectedSecondaryEngineer('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignEngineers}
                disabled={!selectedPrimaryEngineer}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign & Send to Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
