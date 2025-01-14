import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useDebounce } from '../hooks/useDebounce';

// Store scroll position in this object outside the component
const scrollPositions: { [key: string]: number } = {};

// Create a loading skeleton component
function ProfileImageSkeleton() {
  return (
    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
  );
}

export function Community({ session }: { session: Session }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({});
  const location = useLocation();
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);

  // Use debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update search functionality to search multiple fields
  useEffect(() => {
    setIsSearching(true);
    const searchTerm = debouncedSearchQuery.toLowerCase().trim();
    
    const filtered = profiles.filter(profile => {
      if (!searchTerm) return true;
      
      const searchFields = [
        profile.name,
        profile.role,
        profile.company,
        profile.skills
      ];

      return searchFields.some(field => 
        field?.toLowerCase().includes(searchTerm)
      );
    });

    // Add small delay before removing loading state
    setTimeout(() => {
      setFilteredProfiles(filtered);
      setIsSearching(false);
    }, 100);
  }, [debouncedSearchQuery, profiles]);

  // Save scroll position before navigation
  const handleProfileClick = (profileId: string, event: React.MouseEvent) => {
    // Only save scroll position, don't prevent default navigation
    scrollPositions[location.pathname] = window.scrollY;
  };

  // Restore scroll position
  useEffect(() => {
    requestAnimationFrame(() => {
      const savedPosition = scrollPositions[location.pathname];
      if (savedPosition) {
        window.scrollTo(0, savedPosition);
      }
    });
  }, [location.pathname, profiles]);

  const getAvatarUrl = async (path: string) => {
    try {
      const { data } = await supabase.storage
        .from('avatars')
        .createSignedUrl(path, 3600);

      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      // First get profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      if (profiles) {
        setProfiles(profiles);
        
        // Then get avatar URLs for profiles that have avatars
        const avatarPaths = profiles
          .filter(p => p.avatar_url)
          .map(p => p.avatar_url as string);

        if (avatarPaths.length > 0) {
          const { data: avatarData } = await supabase.storage
            .from('avatars')
            .createSignedUrls(avatarPaths, 3600);

          if (avatarData) {
            // Create a map of user_id to avatar URL
            const urls: { [key: string]: string } = {};
            avatarData.forEach((item) => {
              const profile = profiles.find(p => p.avatar_url === item.path);
              if (profile) {
                urls[profile.user_id] = item.signedUrl;
              }
            });
            setAvatarUrls(urls);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoadingAvatars(false);
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      // Show button when page is scrolled down 400px
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search by name, role, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-10 text-gray-900 dark:text-gray-100 
            bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-700 
            rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
            dark:focus:ring-blue-400 transition-colors duration-200"
          />
          <svg
            className={`absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-600
            ${isSearching ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSearching ? (
              // Loading spinner icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            ) : (
              // Search icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            )}
          </svg>

          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 
              dark:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Profile Grid - Update Link attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredProfiles.map(profile => (
          <Link
            key={profile.user_id}
            to={profile.user_id === session.user.id ? '/profile' : `/profile/${profile.user_id}`}
            onClick={(e) => handleProfileClick(profile.user_id, e)}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white dark:bg-dark-800 rounded-lg p-4 md:p-6 
            shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]
            hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]
            hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {isLoadingAvatars ? (
                <ProfileImageSkeleton />
              ) : (
                <img
                  src={avatarUrls[profile.user_id] || `https://ui-avatars.com/api/?name=${profile.name || 'User'}`}
                  alt={profile.name || 'User'}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 sm:justify-start">
                  <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white truncate">
                    {profile.name}
                  </h3>
                  {profile.user_id === session.user.id && (
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">(You)</span>
                  )}
                </div>
                {profile.role && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                    {profile.role}
                  </p>
                )}
                {profile.company && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    at {profile.company}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {profile.bio}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {profile.skills?.split(',').slice(0, 3).map(skill => (
                      <span 
                        key={skill} 
                        className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 
                        rounded px-2 py-1 border border-blue-100 dark:border-blue-800/30"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results Message */}
      {filteredProfiles.length === 0 && (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
          No profiles found matching "{searchQuery}"
        </div>
      )}

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-20 right-6 p-2 rounded-full bg-white dark:bg-dark-800 
        shadow-lg hover:shadow-xl transition-all duration-200 
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
        border border-gray-200 dark:border-gray-700
        ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
        aria-label="Scroll to top"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </div>
  );
}
