import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, FormData } from '../types';

interface UserProfileProps {
  session: Session;
}

export function UserProfile({ session }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    bio: '',
    skills: '',
    github: '',
    twitter: '',
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
        twitter: data.twitter || '',
        website: data.website || ''
      });
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: session.user.id,
        ...formData,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      setProfile({ ...formData, user_id: session.user.id });
      setEditing(false);
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
      <div className="bg-white rounded-lg shadow p-6">
        {!editing ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{profile?.name || 'New User'}</h2>
              <p className="text-gray-600">{profile?.bio || 'No bio yet'}</p>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Skills</h3>
              <p>{profile?.skills || 'No skills listed'}</p>
            </div>
            <div className="space-y-2">
              {profile?.github && (
                <a href={profile.github} className="block text-blue-600 hover:underline">
                  GitHub
                </a>
              )}
              {profile?.twitter && (
                <a href={profile.twitter} className="block text-blue-600 hover:underline">
                  Twitter
                </a>
              )}
              {profile?.website && (
                <a href={profile.website} className="block text-blue-600 hover:underline">
                  Website
                </a>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={updateProfile}>
            <div className="space-y-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key}>
                  <label className="block mb-1 capitalize">
                    {key}
                  </label>
                  {key === 'bio' ? (
                    <textarea
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={key.includes('url') ? 'url' : 'text'}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 space-x-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
