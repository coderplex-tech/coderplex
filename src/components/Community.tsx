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
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <Link
            key={profile.user_id}
            to={`/profile/${profile.user_id}`}
            className="block bg-white dark:bg-dark-800 rounded-lg shadow p-6 
            hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <img
                src={avatarUrls[profile.user_id] || `https://ui-avatars.com/api/?name=${profile.name || 'User'}`}
                alt={profile.name || 'User'}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white truncate">
                  {profile.name}
                </h3>
                {profile.role && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {profile.role}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {profile.bio}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.company && (
                    <p className="mb-2">Currently at {profile.company}</p>
                  )}
                  {profile.skills?.split(',').slice(0, 3).map(skill => (
                    <span 
                      key={skill} 
                      className="inline-block bg-gray-100 dark:bg-dark-700 rounded px-2 py-1 mr-2 mb-2"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
