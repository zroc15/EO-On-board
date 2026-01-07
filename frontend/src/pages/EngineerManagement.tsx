import { useState, useEffect } from 'react';
import { storageService } from '../services/localStorage';
import { Engineer, SKILL_OPTIONS, ComplexityLevel } from '../types';

export default function EngineerManagement() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: [] as string[],
    max_complexity_level: 'L1' as ComplexityLevel,
    is_available: true,
    primary_timezone: ''
  });

  useEffect(() => {
    loadEngineers();
  }, []);

  const loadEngineers = () => {
    try {
      setLoading(true);
      const data = storageService.getAllEngineers();
      setEngineers(data);
    } catch (error) {
      console.error('Failed to load engineers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Note: Engineer CRUD will be added to storageService
      // For now, just show the form works
      alert('Engineer management will be available in the next update');
      loadEngineers();
      resetForm();
    } catch (error) {
      console.error('Failed to save engineer:', error);
      alert('Failed to save engineer');
    }
  };

  const handleEdit = (engineer: Engineer) => {
    setEditingEngineer(engineer);
    setFormData({
      name: engineer.name,
      email: engineer.email,
      skills: engineer.skills,
      max_complexity_level: engineer.max_complexity_level,
      is_available: engineer.is_available,
      primary_timezone: engineer.primary_timezone || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      skills: [],
      max_complexity_level: 'L1',
      is_available: true,
      primary_timezone: ''
    });
    setEditingEngineer(null);
    setShowForm(false);
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Engineer Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage engineering team members, their skills, and availability for assignments.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Add Engineer
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-6 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          <form onSubmit={handleSubmit} className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-900">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-900">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-900">
                  Max Complexity Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.max_complexity_level}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, max_complexity_level: e.target.value as ComplexityLevel }))
                  }
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                >
                  <option value="L1">L1 - Junior</option>
                  <option value="L2">L2 - Intermediate</option>
                  <option value="L3">L3 - Senior</option>
                  <option value="L4">L4 - Expert</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-900">Primary Timezone</label>
                <select
                  value={formData.primary_timezone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primary_timezone: e.target.value }))}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                >
                  <option value="">Select timezone...</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">GMT/UK</option>
                  <option value="Europe/Paris">CET</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {SKILL_OPTIONS.map((skill) => (
                    <div key={skill} className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label className="font-medium text-gray-900">{skill}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_available: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label className="font-medium text-gray-900">Available for assignments</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                {editingEngineer ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              {loading ? (
                <div className="bg-white px-4 py-12 text-center">
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : engineers.length === 0 ? (
                <div className="bg-white px-4 py-12 text-center">
                  <p className="text-gray-500">No engineers found. Add your first engineer to get started.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Max Level
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Skills
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Workload
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Available
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {engineers.map((engineer) => (
                      <tr key={engineer.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {engineer.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {engineer.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {engineer.max_complexity_level}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
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
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {engineer.current_projects_count} active
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                              engineer.is_available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {engineer.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleEdit(engineer)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
