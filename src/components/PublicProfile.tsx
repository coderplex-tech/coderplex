import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export function PublicProfile() {
  const { id } = useParams();
  console.log('PublicProfile rendered with id:', id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getAvatarUrl = async (path: string | null) => {
    if (!path) return null;
    try {
      const { data } = await supabase.storage
        .from('avatars')
        .createSignedUrl(path, 3600);

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return null;
    }
  };

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
        if (data?.avatar_url) {
          const signedUrl = await getAvatarUrl(data.avatar_url);
          setAvatarUrl(signedUrl);
        }
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
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="md:flex md:gap-8">
        {/* Avatar - responsive positioning */}
        <div className="mb-8 md:mb-0 flex justify-center md:block md:flex-shrink-0">
          <div style={{ width: '128px', height: '128px' }}>
            <img
              src={avatarUrl || `https://ui-avatars.com/api/?name=${profile?.name || 'User'}`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        {/* Main card */}
        <div className="flex-grow bg-white dark:bg-dark-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile?.name}
            </h2>
            {profile?.role && (
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {profile.role}
              </p>
            )}
            {profile?.company && (
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Currently at {profile.company}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-300">{profile?.bio}</p>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Skills</h3>
            <p className="text-gray-600 dark:text-gray-300">{profile?.skills}</p>
          </div>
          <div className="space-y-2">
            {profile?.github && (
              <a href={profile.github} className="block text-blue-600 dark:text-blue-400 hover:underline">
                GitHub
              </a>
            )}
            {profile?.linkedin && (
              <a href={profile.linkedin} className="block text-blue-600 dark:text-blue-400 hover:underline">
                LinkedIn
              </a>
            )}
            {profile?.website && (
              <a href={profile.website} className="block text-blue-600 dark:text-blue-400 hover:underline">
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 