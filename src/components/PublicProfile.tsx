import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export function PublicProfile() {
  const { id } = useParams();
  console.log('PublicProfile rendered with id:', id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Profile not found
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 transition-colors duration-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {profile.name}
          </h2>
          {profile.role && (
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {profile.role}
            </p>
          )}
          {profile.company && (
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Currently at {profile.company}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Skills</h3>
          <p className="text-gray-600 dark:text-gray-300">{profile.skills}</p>
        </div>
        <div className="space-y-2">
          {profile.github && (
            <a href={profile.github} className="block text-pink-600 dark:text-pink-400 hover:underline">
              GitHub
            </a>
          )}
          {profile.linkedin && (
            <a href={profile.linkedin} className="block text-pink-600 dark:text-pink-400 hover:underline">
              LinkedIn
            </a>
          )}
          {profile.website && (
            <a href={profile.website} className="block text-pink-600 dark:text-pink-400 hover:underline">
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 