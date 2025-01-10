import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, FormData } from '../types';
import { Button } from './ui/Button';

interface UserProfileProps {
  session: Session;
}

export function UserProfile({ session }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    company: '',
    website: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [session]);

  async function fetchProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        skills: data.skills || '',
        github: data.github || '',
        linkedin: data.linkedin || '',
        company: data.company || '',
        website: data.website || ''
      });
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: session.user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating profile:', error);
        setError('Failed to save profile. Please try again.');
        return;
      }

      setProfile({ ...formData, user_id: session.user.id });
      setEditing(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
        rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 transition-colors duration-200">
        {!editing ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {profile?.name || 'New User'}
              </h2>
              {profile?.company && (
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Currently at {profile.company}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-300">{profile?.bio || 'No bio yet'}</p>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Skills</h3>
              <p className="text-gray-600 dark:text-gray-300">{profile?.skills || 'No skills listed'}</p>
            </div>
            <div className="space-y-2">
              {profile?.github && (
                <a href={profile.github} className="block text-pink-600 dark:text-pink-400 hover:underline">
                  GitHub
                </a>
              )}
              {profile?.linkedin && (
                <a href={profile.linkedin} className="block text-pink-600 dark:text-pink-400 hover:underline">
                  LinkedIn
                </a>
              )}
              {profile?.website && (
                <a href={profile.website} className="block text-pink-600 dark:text-pink-400 hover:underline">
                  Website
                </a>
              )}
            </div>
            <Button
              onClick={() => setEditing(true)}
              variant="primary"
              size="md"
              className="mt-4"
            >
              Edit Profile
            </Button>
          </>
        ) : (
          <form onSubmit={updateProfile}>
            <div className="space-y-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <label className="block mb-1 capitalize text-gray-700 dark:text-gray-300">
                    {key === 'linkedin' ? 'LinkedIn' : key}
                  </label>
                  {key === 'bio' ? (
                    <textarea
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded bg-white dark:bg-dark-700 
                      text-gray-900 dark:text-white border-gray-300 dark:border-gray-600
                      focus:ring-pink-500 focus:border-pink-500 dark:focus:ring-pink-400"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={key.includes('url') || key === 'github' || key === 'linkedin' || key === 'website' ? 'url' : 'text'}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      placeholder={getPlaceholder(key)}
                      className="w-full p-2 border rounded bg-white dark:bg-dark-700 
                      text-gray-900 dark:text-white border-gray-300 dark:border-gray-600
                      focus:ring-pink-500 focus:border-pink-500 dark:focus:ring-pink-400"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 space-x-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="relative"
              >
                {loading ? (
                  <>
                    <span className="opacity-0">Save</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : (
                  'Save'
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                variant="ghost"
                size="md"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function getPlaceholder(key: string): string {
  switch (key) {
    case 'github':
      return 'https://github.com/username';
    case 'linkedin':
      return 'https://linkedin.com/in/username';
    case 'website':
      return 'https://example.com';
    case 'company':
      return 'Current Company';
    default:
      return '';
  }
}
