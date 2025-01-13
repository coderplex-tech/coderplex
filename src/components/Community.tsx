import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export function Community({ session }: { session: Session }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({});

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
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    if (data) {
      setProfiles(data);
      // Fetch avatar URLs for all profiles
      const urls: { [key: string]: string } = {};
      await Promise.all(
        data.map(async (profile) => {
          if (profile.avatar_url) {
            const url = await getAvatarUrl(profile.avatar_url);
            if (url) urls[profile.user_id] = url;
          }
        })
      );
      setAvatarUrls(urls);
    }
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {profiles.map(profile => (
          <Link
            key={profile.user_id}
            to={profile.user_id === session.user.id ? '/profile' : `/profile/${profile.user_id}`}
            className="block bg-white dark:bg-dark-800 rounded-lg p-4 md:p-6 
            shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]
            hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]
            hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <img
                src={avatarUrls[profile.user_id] || `https://ui-avatars.com/api/?name=${profile.name || 'User'}`}
                alt={profile.name || 'User'}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
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
    </div>
  );
}
