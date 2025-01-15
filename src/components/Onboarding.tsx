import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';

interface OnboardingFormData {
  name: string;
  role: string;
  employment_status: 'employed' | 'unemployed' | 'student';
  looking_for_work: boolean;
  company?: string;
  bio?: string;
  skills?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    role: '',
    employment_status: 'employed',
    looking_for_work: false,
    company: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    website: '',
  });

  useEffect(() => {
    console.log('Onboarding component mounted');
  }, []);

  const updateFormData = (field: keyof OnboardingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // First, check if profile exists
      let profileCounts = { followers_count: 0, following_count: 0 };
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('followers_count, following_count')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (existingProfile) {
        profileCounts = existingProfile;
      }

      console.log('Existing profile:', existingProfile);

      const profileData = {
        name: formData.name,
        role: formData.role,
        employment_status: formData.employment_status,
        looking_for_work: formData.looking_for_work,
        company: formData.company || null,
        bio: formData.bio || null,
        skills: formData.skills || null,
        github: formData.github || null,
        linkedin: formData.linkedin || null,
        website: formData.website || null,
        onboarding_completed: true,
        followers_count: profileCounts.followers_count,
        following_count: profileCounts.following_count,
      };

      console.log('Updating with:', profileData);

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Refresh session and use replace navigation
      await supabase.auth.refreshSession();
      navigate('/community', { replace: true });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to coderplexDevCommunity()
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Let's get to know you better
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                What's your name? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                  focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                What's your role? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => updateFormData('role', e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                  bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                  focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Additional Information (Optional)
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What's your current status?
                  </label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => updateFormData('employment_status', e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                      focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                {formData.employment_status === 'employed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Where do you work?
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => updateFormData('company', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                        focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.looking_for_work}
                      onChange={(e) => updateFormData('looking_for_work', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I'm open to freelance opportunities
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateFormData('bio', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                      focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => updateFormData('skills', e.target.value)}
                    placeholder="e.g. React, TypeScript, Node.js"
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                      focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => updateFormData('github', e.target.value)}
                      placeholder="https://github.com/username"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                        focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => updateFormData('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                        focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Personal Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateFormData('website', e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                        focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.role}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 