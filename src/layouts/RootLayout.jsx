// src/layouts/RootLayout.jsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function RootLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex items-center flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-800">Rekap Surat</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-500"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/users" 
                  className="inline-flex items-center px-3 py-2 text-gray-900 hover:text-gray-500"
                >
                  Users
                </Link>
                
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="hidden mr-4 text-gray-700 md:block">
                Welcome, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
              
              <div className="flex items-center ml-4 md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute w-full bg-white shadow-lg`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/users"
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Users
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="px-3 py-2 text-sm text-gray-700">
              Welcome, {user?.username}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-screen pt-16 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}