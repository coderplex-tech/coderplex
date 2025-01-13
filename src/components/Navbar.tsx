import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { useState } from 'react';

interface NavbarProps {
  isPublic?: boolean;
  onSearchClick?: () => void;
  isSearchVisible?: boolean;
}

export function Navbar({ isPublic, onSearchClick, isSearchVisible }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };
  
  return (
    <nav className="bg-light-800 dark:bg-dark-800 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link 
                to={isPublic ? "/" : "/community"}
                className="text-2xl font-bold text-gray-800 dark:text-gray-100 
                hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                coderplex
              </Link>
            </div>
            {!isPublic && (
              <div className="hidden md:flex md:ml-24 space-x-2">
                <Button
                  to="/profile"
                  variant={location.pathname === '/profile' ? 'primary' : 'ghost'}
                  size="md"
                  className={`px-6 ${
                    location.pathname !== '/profile' &&
                    'border border-blue-600/30 hover:border-blue-600/40 hover:bg-blue-600/5'
                  }`}
                  onClick={() => handleNavigation('/profile')}
                >
                  Profile
                </Button>
                <Button
                  to="/community"
                  variant={location.pathname === '/community' ? 'primary' : 'ghost'}
                  size="md"
                  className={`px-6 ${
                    location.pathname !== '/community' &&
                    'border border-blue-600/30 hover:border-blue-600/40 hover:bg-blue-600/5'
                  }`}
                  onClick={() => handleNavigation('/community')}
                >
                  Community
                </Button>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!isPublic && onSearchClick && (
              <Button
                onClick={onSearchClick}
                variant="secondary"
                size="sm"
                className="aspect-square"
                aria-label={isSearchVisible ? "Close search" : "Open search"}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </Button>
            )}
            <Button
              onClick={toggleTheme}
              variant="secondary"
              size="sm"
              className="aspect-square"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </Button>
            {!isPublic && (
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="md"
                className="border border-gray-200 dark:border-gray-700"
              >
                Sign Out
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="sm"
              className="inline-flex items-center justify-center p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        <div 
          className={`
            transform transition-all duration-300 ease-in-out md:hidden
            origin-top overflow-hidden
            ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="flex flex-col space-y-2 px-4 py-2">
            <Button
              to="/profile"
              variant={location.pathname === '/profile' ? 'primary' : 'ghost'}
              size="md"
              className="w-full justify-center"
              onClick={() => handleNavigation('/profile')}
            >
              Profile
            </Button>
            <Button
              to="/community"
              variant={location.pathname === '/community' ? 'primary' : 'ghost'}
              size="md"
              className="w-full justify-center"
              onClick={() => handleNavigation('/community')}
            >
              Community
            </Button>
            <div className="pt-2 flex items-center justify-center space-x-4">
              <Button
                onClick={toggleTheme}
                variant="secondary"
                size="sm"
                className="aspect-square"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-4 h-4" />
                ) : (
                  <MoonIcon className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                variant="ghost"
                size="md"
                className="border border-gray-200 dark:border-gray-700"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
