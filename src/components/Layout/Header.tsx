import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Linkedin, LogOut, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Linkedin className="h-8 w-8 text-primary-500" />
          <span className="text-xl font-bold text-primary-800">Campaign Tracker</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-neutral-700 hover:text-primary-600">
                Dashboard
              </Link>
              <Link to="/campaigns" className="text-sm font-medium text-neutral-700 hover:text-primary-600">
                Campaigns
              </Link>
              <Link to="/settings" className="text-sm font-medium text-neutral-700 hover:text-primary-600">
                Settings
              </Link>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-neutral-600">
                  Welcome, {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-neutral-700 hover:text-primary-600">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center md:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-neutral-700" />
          ) : (
            <Menu className="h-6 w-6 text-neutral-700" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 z-20 w-full animate-fade-in border-b border-neutral-200 bg-white shadow-md md:hidden">
          <div className="container mx-auto flex flex-col space-y-4 px-4 py-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/campaigns"
                  className="px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Campaigns
                </Link>
                <Link
                  to="/settings"
                  className="px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4 inline" />
                  Settings
                </Link>
                <div className="border-t border-neutral-200 pt-2">
                  <div className="px-3 py-2 text-sm font-medium text-neutral-600">
                    Welcome, {user?.name}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center space-x-2 px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};