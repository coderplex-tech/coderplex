import { useLocation, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  return (
    <nav className="bg-light-800 dark:bg-dark-800 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                coderplex
              </span>
            </div>
            <div className="hidden md:flex md:ml-24 space-x-2">
              <Button
                to="/profile"
                variant={location.pathname === '/profile' ? 'primary' : 'ghost'}
                size="md"
                className={`px-6 ${
                  location.pathname !== '/profile' &&
                  'border border-pink-600/30 hover:border-pink-600/40 hover:bg-pink-600/5'
                }`}
              >
                Profile
              </Button>
              <Button
                to="/community"
                variant={location.pathname === '/community' ? 'primary' : 'ghost'}
                size="md"
                className={`px-6 ${
                  location.pathname !== '/community' &&
                  'border border-pink-600/30 hover:border-pink-600/40 hover:bg-pink-600/5'
                }`}
              >
                Community
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
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
              onClick={handleSignOut}
              variant="ghost"
              size="md"
              className="border border-gray-200 dark:border-gray-700"
            >
              Sign Out
            </Button>
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

        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden pb-4`}>
          <div className="flex flex-col space-y-2">
            <Button
              to="/profile"
              variant={location.pathname === '/profile' ? 'primary' : 'ghost'}
              size="md"
              className="w-full justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Button>
            <Button
              to="/community"
              variant={location.pathname === '/community' ? 'primary' : 'ghost'}
              size="md"
              className="w-full justify-center"
              onClick={() => setIsMenuOpen(false)}
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
