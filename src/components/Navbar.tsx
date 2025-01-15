import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { useState, useEffect, useRef } from 'react';
import { Profile } from '../types';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isPublic) {
      // Fetch user profile and avatar
      const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase
            .from('profiles')
            .select()
            .eq('user_id', session.user.id)
            .single();
          
          if (data?.avatar_url) {
            const { data: urlData } = await supabase.storage
              .from('avatars')
              .createSignedUrl(data.avatar_url, 3600);
            
            if (urlData) {
              setAvatarUrl(urlData.signedUrl);
            }
          }
          setProfile(data);
        }
      };
      fetchProfile();
    }
  }, [isPublic]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-light-800 dark:bg-dark-800 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link 
                to={isPublic ? "/" : "/community"}
                className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100"
              >
                <span className="inline-block">
                  coderplexDev
                </span>
                <span className="inline-block">
                  <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-700">
                    Community
                  </span>
                  ()
                </span>
              </Link>
            </div>
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
              <div className="relative" ref={profileMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="aspect-square rounded-full overflow-hidden hover:ring-2 ring-blue-500 transition-all"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8" />
                  )}
                </Button>

                {/* Profile Dropdown Menu */}
                <div
                  className={`
                    absolute right-0 mt-2 w-32 rounded-md shadow-lg 
                    bg-white dark:bg-dark-800 ring-1 ring-black ring-opacity-5
                    transform transition-all duration-200 ease-in-out origin-top-right
                    ${isProfileMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
                  `}
                >
                  <div className="py-0.5">
                    <Button
                      to="/profile"
                      variant="ghost"
                      size="md"
                      className="w-full justify-start text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 menu-item"
                    >
                      My Profile
                    </Button>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="md"
                      className="w-full justify-start text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 menu-item"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
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
            ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="flex flex-col space-y-4 px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="flex-grow">
                <Button
                  to="/profile"
                  variant="ghost"
                  size="md"
                  className="w-full justify-start !px-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  View Profile
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="aspect-square border border-gray-200 dark:border-gray-700"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
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
          </div>
        </div>
      </div>
    </nav>
  );
}
