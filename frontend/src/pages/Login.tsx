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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,164,239,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,164,239,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Glass card */}
        <div className="glass-panel rounded-3xl p-8 backdrop-blur-2xl border-primary-500/20">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-white to-primary-50 rounded-2xl p-6 shadow-glow">
                <svg className="h-16 w-auto mx-auto" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="50" y="70" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="bold" fill="#00a4ef">eliteops</text>
                  <circle cx="20" cy="50" r="15" fill="#00a4ef" opacity="0.3"/>
                  <circle cx="20" cy="50" r="10" fill="#00a4ef" opacity="0.5"/>
                  <circle cx="20" cy="50" r="5" fill="#00a4ef"/>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-primary-200 text-sm">
              Customer Onboarding Platform
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-primary-100 mb-3">
                Select Your Account
              </label>
              <div className="relative">
                <select
                  id="user"
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  required
                  className="block w-full rounded-xl bg-white/10 border-2 border-primary-500/30 text-white shadow-inner-glow focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 text-sm py-3 px-4 transition-all duration-300 hover:border-primary-400/50 backdrop-blur-sm"
                >
                  <option value="" className="bg-dark-900 text-gray-300">Choose your role...</option>

                  {Object.entries(groupedUsers).map(([role, roleUsers]) => (
                    <optgroup key={role} label={roleLabels[role] || role} className="bg-dark-900">
                      {roleUsers.map((user) => (
                        <option key={user.id} value={user.email} className="bg-dark-900 text-white py-2">
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedEmail}
              className="group relative w-full flex justify-center py-3.5 px-4 border-2 border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-95"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-primary-200 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              Sign In
              <span className="absolute right-0 inset-y-0 flex items-center pr-4">
                <svg className="h-5 w-5 text-primary-200 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary-500/20">
            <div className="text-xs text-primary-200/80 space-y-3">
              <p className="font-semibold text-primary-100 mb-3 flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Demo Accounts Available:
              </p>
              <div className="grid grid-cols-1 gap-2 text-primary-200/70">
                <div className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                  <div>
                    <span className="font-medium text-primary-100">Leadership:</span> Director, Manager, Senior Director
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                  <div>
                    <span className="font-medium text-primary-100">Sales:</span> Solutions Architect, Account Rep
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-1.5 mr-2"></span>
                  <div>
                    <span className="font-medium text-primary-100">Engineering:</span> Lead SE, Solutions Engineer, Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-primary-300/60 flex items-center justify-center">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Demo - Data stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
