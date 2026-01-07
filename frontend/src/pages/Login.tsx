import { useState } from 'react';
import { storageService } from '../services/localStorage';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedEmail, setSelectedEmail] = useState('');
  const users = storageService.getAllUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmail) {
      const user = storageService.getUserByEmail(selectedEmail);
      if (user) {
        storageService.setCurrentUser(user);
        onLogin(user);
      }
    }
  };

  // Group users by role
  const groupedUsers = users.reduce((acc, user) => {
    const role = user.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  const roleLabels: Record<string, string> = {
    'director': 'Leadership - Director',
    'senior_director': 'Leadership - Senior Director',
    'manager': 'Leadership - Manager',
    'solutions_architect': 'Sales - Solutions Architect',
    'account_rep': 'Sales - Account Representative',
    'lead_solutions_engineer': 'Engineering - Lead Solutions Engineer',
    'solutions_engineer': 'Engineering - Solutions Engineer',
    'delivery_engineer': 'Engineering - Delivery Engineer'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-600 mb-4">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">EliteOps</h2>
            <p className="mt-2 text-sm text-gray-600">Customer Onboarding Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Account
              </label>
              <select
                id="user"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                required
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-3 px-4"
              >
                <option value="">Choose your role...</option>

                {Object.entries(groupedUsers).map(([role, roleUsers]) => (
                  <optgroup key={role} label={roleLabels[role] || role}>
                    {roleUsers.map((user) => (
                      <option key={user.id} value={user.email}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedEmail}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-2">
              <p className="font-semibold text-gray-700 mb-2">Demo Accounts Available:</p>
              <p><span className="font-medium">Leadership:</span> Director, Manager</p>
              <p><span className="font-medium">Sales:</span> Solutions Architect, Account Rep</p>
              <p><span className="font-medium">Engineering:</span> Lead SE, SE, Delivery Engineer</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          Demo Version - All data stored locally in browser
        </p>
      </div>
    </div>
  );
}
