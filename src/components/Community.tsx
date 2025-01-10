import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface CommunityProps {
  session: Session;
}

export function Community({ session }: CommunityProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    if (data) {
      setProfiles(data);
    }
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(profile => (
          <div
            key={profile.user_id}
            className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 cursor-pointer 
            hover:shadow-lg transition-all duration-200"
            onClick={() => setSelectedProfile(profile)}
          >
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {profile.name}
            </h3>
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
        ))}
      </div>

      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] 
          overflow-y-auto transition-colors duration-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {selectedProfile.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{selectedProfile.bio}</p>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProfile.skills?.split(',').map(skill => (
                  <span 
                    key={skill} 
                    className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 
                    text-gray-700 dark:text-gray-300"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {selectedProfile.github && (
                <a 
                  href={selectedProfile.github} 
                  className="block text-pink-600 dark:text-pink-400 hover:underline"
                >
                  GitHub
                </a>
              )}
              {selectedProfile.linkedin && (
                <a 
                  href={selectedProfile.linkedin} 
                  className="block text-pink-600 dark:text-pink-400 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {selectedProfile.website && (
                <a 
                  href={selectedProfile.website} 
                  className="block text-pink-600 dark:text-pink-400 hover:underline"
                >
                  Website
                </a>
              )}
            </div>
            <button
              onClick={() => setSelectedProfile(null)}
              className="mt-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded 
              transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
