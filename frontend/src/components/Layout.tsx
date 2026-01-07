import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { storageService } from '../services/localStorage';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
}

export default function Layout({ children, currentUser, onLogout }: LayoutProps) {
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  EliteOps Onboarding
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/engineers"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/engineers')
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Engineers
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{roleLabels[currentUser.role]}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
