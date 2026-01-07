import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/localStorage';
import { OnboardingRecord, STATUS_LABELS, STATUS_COLORS } from '../types';

export default function Dashboard() {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadRecords();
  }, [statusFilter]);

  const loadRecords = () => {
    try {
      setLoading(true);
      const data = storageService.getAllOnboarding(
        statusFilter ? { status: statusFilter } : undefined
      );
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const allRecords = storageService.getAllOnboarding();
  const stats = {
    total: allRecords.length,
    pending: allRecords.filter(r => r.status === 'sa_complete').length,
    inProgress: allRecords.filter(r => ['leadership_approved', 'ready_for_delivery', 'in_deployment'].includes(r.status)).length,
    completed: allRecords.filter(r => r.status === 'completed').length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Customer Onboarding</h1>
          <p className="text-primary-200">
            Manage customer onboarding records from sales handoff to deployment
          </p>
        </div>
        <Link
          to="/onboarding/new"
          className="group relative inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </span>
          <span className="ml-6">New Onboarding</span>
          <span className="absolute right-0 inset-y-0 flex items-center pr-4">
            <svg className="h-4 w-4 text-primary-200 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <div className="stat-card group p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Projects</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.total}</p>
              <div className="flex items-center text-xs text-primary-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-medium">All time</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gray-400/20 blur-xl rounded-full group-hover:bg-gray-500/30 transition-all"></div>
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="stat-card group p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.pending}</p>
              <div className="flex items-center text-xs text-yellow-600">
                <svg className="h-4 w-4 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Awaiting action</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full group-hover:bg-yellow-500/30 transition-all"></div>
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="stat-card group p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.inProgress}</p>
              <div className="flex items-center text-xs text-blue-600">
                <svg className="h-4 w-4 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">Active deployment</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all"></div>
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <svg className="h-8 w-8 text-blue-600 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="stat-card group p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">{stats.completed}</p>
              <div className="flex items-center text-xs text-green-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Successfully deployed</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-green-400/20 blur-xl rounded-full group-hover:bg-green-500/30 transition-all"></div>
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Projects</h2>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-2 border-primary-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sa_complete">SA Complete</option>
              <option value="leadership_approved">Leadership Approved</option>
              <option value="ready_for_delivery">Ready for Delivery</option>
              <option value="in_deployment">In Deployment</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-primary-100">
          {loading ? (
            <div className="bg-white px-4 py-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Loading projects...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="bg-white px-4 py-16 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-500">No onboarding records found.</p>
              <Link
                to="/onboarding/new"
                className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                Create your first onboarding record →
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-primary-50/30">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Complexity
                  </th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="relative py-3.5 pl-3 pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {records.map((record, idx) => (
                  <tr key={record.id} className="hover:bg-primary-50/30 transition-colors group" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-gray-900">
                      {record.customer_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[record.status]} border border-current/20`}>
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                        {STATUS_LABELS[record.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 font-medium">
                      {record.complexity_level || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <Link
                        to={`/onboarding/${record.id}`}
                        className="text-primary-600 hover:text-primary-900 font-semibold group-hover:translate-x-1 inline-flex items-center transition-all"
                      >
                        View
                        <svg className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
