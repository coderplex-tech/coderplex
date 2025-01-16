import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { z } from 'zod';

interface OnboardingProps {
  session: Session;
}

// Validation schema
const onboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  role: z.string().min(2, 'Role must be at least 2 characters').max(50, 'Role is too long'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.string().max(200, 'Skills list is too long')
    .refine(val => !val || val.split(',').every(skill => skill.trim().length > 0), {
      message: 'Skills should be comma-separated values'
    })
    .optional(),
  github: z.string().max(100)
    .refine(val => !val || val.startsWith('https://github.com/'), {
      message: 'GitHub URL must start with https://github.com/'
    })
    .optional(),
  linkedin: z.string().max(100)
    .refine(val => !val || val.startsWith('https://linkedin.com/in/') || val.startsWith('https://www.linkedin.com/in/'), {
      message: 'LinkedIn URL must be a valid profile URL'
    })
    .optional(),
  company: z.string().max(50, 'Company name is too long').optional(),
  website: z.string().max(100)
    .refine(val => !val || val.startsWith('http://') || val.startsWith('https://'), {
      message: 'Website must start with http:// or https://'
    })
    .optional(),
  is_student: z.boolean(),
  is_employed: z.boolean(),
  is_freelance: z.boolean(),
});

type ValidationErrors = {
  [K in keyof z.infer<typeof onboardingSchema>]?: string;
};

export function Onboarding({ session }: OnboardingProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    company: '',
    website: '',
    is_student: false,
    is_employed: false,
    is_freelance: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const validatedData = onboardingSchema.parse(formData);
      console.log('Validated data:', validatedData);

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }

      console.log('Existing profile:', existingProfile);

      let updateError;
      if (existingProfile) {
        // Update existing profile
        const updateData = {
          ...validatedData,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        };
        console.log('Updating profile with:', updateData);

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', session.user.id);
        updateError = error;
      } else {
        // Create new profile
        const insertData = {
          user_id: session.user.id,
          ...validatedData,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log('Creating profile with:', insertData);

        const { error } = await supabase
          .from('profiles')
          .insert([insertData]);
        updateError = error;
      }

      if (updateError) {
        console.error('Error updating/creating profile:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }

      // Redirect to community page after successful onboarding
      navigate('/community');
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        err.errors.forEach(error => {
          const path = error.path[0] as keyof ValidationErrors;
          errors[path] = error.message;
        });
        setValidationErrors(errors);
        console.error('Validation errors:', errors);
      } else {
        console.error('Error updating profile:', {
          error: err,
          formData,
          session: session.user.id
        });
        setError('Failed to save profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Coderplex!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Let's get to know you better. Please fill out the following information to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Required Information
              </h2>
              
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 
                  shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-700
                  dark:text-white sm:text-sm"
                  required
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g., Frontend Developer, DevOps Engineer"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 
                  shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-700
                  dark:text-white sm:text-sm"
                  required
                />
                {validationErrors.role && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.role}</p>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_student"
                    checked={formData.is_student}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 
                    border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    I am currently a student
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_employed"
                    checked={formData.is_employed}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 
                    border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    I am currently employed
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_freelance"
                    checked={formData.is_freelance}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 
                    border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    I am open to freelance opportunities
                  </label>
                </div>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Additional Information (Optional)
              </h2>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 
                  shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-700
                  dark:text-white sm:text-sm"
                />
                {validationErrors.bio && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.bio}</p>
                )}
              </div>

              {/* Skills Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, React, Node.js"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 
                  shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-700
                  dark:text-white sm:text-sm"
                />
                {validationErrors.skills && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.skills}</p>
                )}
              </div>

              {/* Company Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 
                  shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-700
                  dark:text-white sm:text-sm"
                />
                {validationErrors.company && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.company}</p>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 
                    shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-700
                    dark:text-white sm:text-sm"
                  />
                  {validationErrors.github && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.github}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 
                    shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-700
                    dark:text-white sm:text-sm"
                  />
                  {validationErrors.linkedin && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.linkedin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Personal Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 
                    shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-dark-700
                    dark:text-white sm:text-sm"
                  />
                  {validationErrors.website && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.website}</p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 