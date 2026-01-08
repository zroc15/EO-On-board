import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { storageService } from '../services/localStorage';
import { isEngineer } from '../utils/permissions';
import NotificationsPanel from './NotificationsPanel';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
}

export default function Layout({ children, currentUser, onLogout }: LayoutProps) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const roleLabels: Record<string, string> = {
    'director': 'Director',
    'senior_director': 'Senior Director',
    'manager': 'Manager',
    'solutions_architect': 'Solutions Architect',
    'account_rep': 'Account Rep',
    'lead_solutions_engineer': 'Lead Solutions Engineer',
    'solutions_engineer': 'Solutions Engineer',
    'delivery_engineer': 'Delivery Engineer'
  };

  const unreadNotifications = storageService.getNotifications(currentUser.email).filter(n => !n.read).length;
  const isLeadership = ['director', 'senior_director', 'manager'].includes(currentUser.role);
  const isEngineerRole = isEngineer(currentUser.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Subtle animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Glassmorphic Navbar */}
      <nav className="relative z-50 glass-panel border-b border-primary-500/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full group-hover:bg-primary-500/30 transition-all"></div>
                  <svg className="relative h-8 w-8" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="url(#gradient)" strokeWidth="2" className="animate-pulse-slow"/>
                    <circle cx="20" cy="20" r="12" fill="url(#gradient)" opacity="0.5"/>
                    <circle cx="20" cy="20" r="6" fill="#00a4ef"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00a4ef" />
                        <stop offset="100%" stopColor="#0087cc" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h1 className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-100 to-primary-200">
                  EliteOps
                </h1>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:ml-10 sm:flex sm:space-x-2">
                <Link
                  to="/"
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive('/')
                      ? 'text-white bg-primary-500/20 shadow-glow'
                      : 'text-primary-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive('/') && (
                    <span className="absolute inset-0 rounded-lg border-2 border-primary-500/50 animate-pulse-slow"></span>
                  )}
                  <span className="relative flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {isEngineerRole ? 'Projects' : 'Dashboard'}
                  </span>
                </Link>

                {isLeadership && (
                  <Link
                    to="/leadership"
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive('/leadership')
                        ? 'text-white bg-primary-500/20 shadow-glow'
                        : 'text-primary-100 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive('/leadership') && (
                      <span className="absolute inset-0 rounded-lg border-2 border-primary-500/50 animate-pulse-slow"></span>
                    )}
                    <span className="relative flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Leadership
                    </span>
                  </Link>
                )}

                <Link
                  to="/engineers"
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive('/engineers')
                      ? 'text-white bg-primary-500/20 shadow-glow'
                      : 'text-primary-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive('/engineers') && (
                    <span className="absolute inset-0 rounded-lg border-2 border-primary-500/50 animate-pulse-slow"></span>
                  )}
                  <span className="relative flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Engineers
                  </span>
                </Link>

                <Link
                  to="/employees"
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive('/employees')
                      ? 'text-white bg-primary-500/20 shadow-glow'
                      : 'text-primary-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive('/employees') && (
                    <span className="absolute inset-0 rounded-lg border-2 border-primary-500/50 animate-pulse-slow"></span>
                  )}
                  <span className="relative flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Employees
                  </span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-primary-200 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 group"
                >
                  <svg className="h-5 w-5 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold shadow-glow animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <NotificationsPanel
                  userEmail={currentUser.email}
                  isOpen={showNotifications}
                  onClose={() => setShowNotifications(false)}
                />
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 pl-3 border-l border-primary-500/20">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{currentUser.name}</p>
                  <p className="text-xs text-primary-300">{roleLabels[currentUser.role]}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center px-3 py-2 border border-primary-500/30 rounded-lg text-xs font-medium text-primary-100 hover:text-white hover:bg-primary-500/20 hover:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300 group"
                >
                  <svg className="h-4 w-4 mr-1.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
