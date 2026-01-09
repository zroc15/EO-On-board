import { useState, useEffect } from 'react';
import { storageService } from '../services/localStorage';
import { User, UserRole } from '../types';
import { isLeadership } from '../utils/permissions';

const ROLE_LABELS: Record<UserRole, string> = {
  director: 'Director',
  senior_director: 'Senior Director',
  manager: 'Manager',
  solutions_architect: 'Solutions Architect',
  account_rep: 'Account Representative',
  lead_solutions_engineer: 'Lead Solutions Engineer',
  solutions_engineer: 'Solutions Engineer',
  delivery_engineer: 'Delivery Engineer'
};

const ROLE_CATEGORIES = {
  Leadership: ['director', 'senior_director', 'manager'],
  Sales: ['solutions_architect', 'account_rep'],
  Engineering: ['lead_solutions_engineer', 'solutions_engineer', 'delivery_engineer']
};

export default function EmployeeManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const currentUser = storageService.getCurrentUser();
  const canManage = currentUser && isLeadership(currentUser.role);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = storageService.getAllUsers();
    setUsers(allUsers.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      const allUsers = storageService.getAllUsers();

      if (editingUser) {
        // Update existing user
        const updatedUsers = allUsers.map(u =>
          u.id === editingUser.id
            ? { ...u, name: formData.name, email: formData.email, role: formData.role as UserRole, is_active: formData.is_active }
            : u
        );
        localStorage.setItem('eliteops_users', JSON.stringify(updatedUsers));

        // Update current user if editing self
        if (currentUser?.id === editingUser.id) {
          const updatedCurrentUser = updatedUsers.find(u => u.id === editingUser.id);
          if (updatedCurrentUser) {
            storageService.setCurrentUser(updatedCurrentUser);
          }
        }
      } else {
        // Check for duplicate email
        if (allUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
          alert('A user with this email already exists');
          setSaving(false);
          return;
        }

        // Add new user
        const newUser: User = {
          id: crypto.randomUUID(),
          name: formData.name,
          email: formData.email,
          role: formData.role as UserRole,
          is_active: formData.is_active
        };
        allUsers.push(newUser);
        localStorage.setItem('eliteops_users', JSON.stringify(allUsers));
      }

      loadUsers();
      setShowModal(false);
      alert(editingUser ? 'User updated successfully' : 'User added successfully');
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = (user: User) => {
    if (!canManage) return;

    // Prevent deactivating yourself
    if (user.id === currentUser?.id) {
      alert('You cannot deactivate your own account');
      return;
    }

    const allUsers = storageService.getAllUsers();
    const updatedUsers = allUsers.map(u =>
      u.id === user.id ? { ...u, is_active: !u.is_active } : u
    );
    localStorage.setItem('eliteops_users', JSON.stringify(updatedUsers));
    loadUsers();
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Group users by category
  const groupedUsers: Record<string, User[]> = {};
  filteredUsers.forEach(user => {
    for (const [category, roles] of Object.entries(ROLE_CATEGORIES)) {
      if (roles.includes(user.role)) {
        if (!groupedUsers[category]) groupedUsers[category] = [];
        groupedUsers[category].push(user);
        break;
      }
    }
  });

  // Permission check - ONLY LEADERS can manage employees
  if (!canManage) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">Only Leadership can manage employees.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage team members and their roles
            </p>
          </div>
          {canManage && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 shadow-md hover:shadow-glow transition-all duration-300 transform hover:scale-105"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="stat-card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_active).length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Leadership</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => isLeadership(u.role)).length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Engineers</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => ['lead_solutions_engineer', 'solutions_engineer', 'delivery_engineer'].includes(u.role)).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search employees</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">All Roles</option>
              <optgroup label="Leadership">
                <option value="director">Director</option>
                <option value="senior_director">Senior Director</option>
                <option value="manager">Manager</option>
              </optgroup>
              <optgroup label="Sales">
                <option value="solutions_architect">Solutions Architect</option>
                <option value="account_rep">Account Representative</option>
              </optgroup>
              <optgroup label="Engineering">
                <option value="lead_solutions_engineer">Lead Solutions Engineer</option>
                <option value="solutions_engineer">Solutions Engineer</option>
                <option value="delivery_engineer">Delivery Engineer</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Employee List by Category */}
      <div className="space-y-6">
        {Object.entries(groupedUsers).map(([category, categoryUsers]) => (
          <div key={category} className="glass-card rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{category}</h2>
              <p className="text-sm text-primary-100">{categoryUsers.length} member{categoryUsers.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="divide-y divide-gray-200">
              {categoryUsers.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-primary-50/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          {user.id === currentUser?.id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                              You
                            </span>
                          )}
                          {!user.is_active && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{ROLE_LABELS[user.role]}</p>
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={user.id === currentUser?.id}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            user.is_active
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 transition-all"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="mt-4 text-gray-500">No employees found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingUser ? 'Edit Employee' : 'Add New Employee'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="john.smith@eliteops.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="block w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a role...</option>
                  <optgroup label="Leadership">
                    <option value="director">Director</option>
                    <option value="senior_director">Senior Director</option>
                    <option value="manager">Manager</option>
                  </optgroup>
                  <optgroup label="Sales">
                    <option value="solutions_architect">Solutions Architect</option>
                    <option value="account_rep">Account Representative</option>
                  </optgroup>
                  <optgroup label="Engineering">
                    <option value="lead_solutions_engineer">Lead Solutions Engineer</option>
                    <option value="solutions_engineer">Solutions Engineer</option>
                    <option value="delivery_engineer">Delivery Engineer</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active Employee
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg hover:from-primary-500 hover:to-primary-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingUser ? 'Update' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
