import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';

interface OnboardingFormData {
  name: string;
  role: string;
  employmentStatus: 'employed' | 'unemployed' | 'student';
  lookingForWork: boolean;
  company?: string;
  bio?: string;
  skills?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    role: '',
    employmentStatus: 'employed',
    lookingForWork: false,
    company: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    website: '',
  });

  const updateFormData = (field: keyof OnboardingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          role: formData.role,
          employment_status: formData.employmentStatus,
          looking_for_work: formData.lookingForWork,
          company: formData.company,
          bio: formData.bio,
          skills: formData.skills,
          github: formData.github,
          linkedin: formData.linkedin,
          website: formData.website,
          onboarding_completed: true,
        })
        .eq('user_id', session.user.id);

      if (error) throw error;
      navigate('/community');
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

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-1/3 h-2 rounded-full ${
                    i <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  What's your name?
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
                  What's your role?
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
            </div>
          )}

          {/* Step 2: Employment */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  What's your current status?
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => updateFormData('employmentStatus', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700
                    bg-white dark:bg-dark-900 px-3 py-2 text-gray-900 dark:text-white
                    focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="employed">Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                </select>
              </div>
              {formData.employmentStatus === 'employed' && (
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
                    checked={formData.lookingForWork}
                    onChange={(e) => updateFormData('lookingForWork', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    I'm open to freelance opportunities
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {step === 3 && (
            <div className="space-y-6">
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
              <div className="grid grid-cols-1 gap-6">
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
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="ghost"
              >
                Back
              </Button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && (!formData.name || !formData.role)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 