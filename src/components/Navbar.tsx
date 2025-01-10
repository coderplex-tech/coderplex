import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  
  return (
    <nav className="bg-light-800 dark:bg-dark-800 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                coderplex
              </span>
            </div>
            <div className="ml-6 flex space-x-4 items-center">
              <Button
                to="/profile"
                variant={location.pathname === '/profile' ? 'primary' : 'ghost'}
                size="md"
              >
                Profile
              </Button>
              <Button
                to="/community"
                variant={location.pathname === '/community' ? 'primary' : 'ghost'}
                size="md"
              >
                Community
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
