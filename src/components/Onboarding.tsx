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
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  role: z.string().trim().min(2, 'Role must be at least 2 characters').max(50, 'Role is too long'),
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
  followers_count: z.number().default(0),
  following_count: z.number().default(0),
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
          followers_count: 0,
          following_count: 0,
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
    <div className="min-h-screen bg-light-900 dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg px-6 py-8 transition-colors duration-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Coderplex!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Let's get to know you better. Please fill out the following information to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Required Fields Section */}
            <div className="space-y-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Required Information
              </h2>
              
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-gray-900 dark:text-gray-100 
                  bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                  dark:focus:ring-blue-400 transition-colors duration-200"
                  required
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
                )}
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g., Frontend Developer, DevOps Engineer"
                  className="w-full px-4 py-2 text-gray-900 dark:text-gray-100 
                  bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                  dark:focus:ring-blue-400 transition-colors duration-200"
                  required
                />
                {validationErrors.role && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.role}</p>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Status
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_student"
                    checked={formData.is_student}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                    focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    I am currently a student
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_employed"
                    checked={formData.is_employed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                    focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    I am currently employed
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_freelance"
                    checked={formData.is_freelance}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                    focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    I am open to freelance opportunities
                  </span>
                </label>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Additional Information (Optional)
              </h2>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 text-gray-900 dark:text-gray-100 
                  bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                  dark:focus:ring-blue-400 transition-colors duration-200"
                />
              </div>

              {/* Skills Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript, React, Node.js"
                  className="w-full px-4 py-2 text-gray-900 dark:text-gray-100 
                  bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                  dark:focus:ring-blue-400 transition-colors duration-200"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username"
                    className="w-full px-4 py-2 text-gray-900 dark:text-gray-100 
                    bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    dark:focus:ring-blue-400 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-2 text-gray-900 dark:text-gray-100 
                    bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    dark:focus:ring-blue-400 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Personal Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 text-gray-900 dark:text-gray-100 
                    bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    dark:focus:ring-blue-400 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm mt-4">{error}</div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Saving...</span>
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 