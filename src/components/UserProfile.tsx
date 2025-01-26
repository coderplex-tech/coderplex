import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, FormData } from '../types';
import { Button } from './ui/Button';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { PhotoUploadDialog } from './PhotoUploadDialog';
import { useNavigate } from 'react-router-dom';
import { UserListDialog } from './UserListDialog';

interface UserProfileProps {
  session: Session;
}

// Validation schema
const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  role: z.string().trim().min(2, 'Role must be at least 2 characters').max(50, 'Role is too long'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.string().max(200, 'Skills list is too long')
    .refine(val => !val || val.split(',').every(skill => skill.trim().length > 0), {
      message: 'Skills should be comma-separated values'
    }),
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
});

type ValidationErrors = {
  [K in keyof FormData]?: string;
};

// Add loading skeleton component at the top
function ProfileImageSkeleton() {
  return (
    <div className="relative" style={{ width: '128px', height: '128px' }}>
      <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    </div>
  );
}

export function UserProfile({ session }: UserProfileProps) {
  console.log('UserProfile rendered with session id:', session.user.id);
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
    website: '',
    role: '',
    avatar_url: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [session]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          skills: data.skills || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
          company: data.company || '',
          website: data.website || '',
          role: data.role || '',
          avatar_url: data.avatar_url || ''
        });

        // Get signed URL if avatar exists
        if (data.avatar_url) {
          const { data: urlData } = await supabase.storage
            .from('avatars')
            .createSignedUrl(data.avatar_url, 3600);
            
          if (urlData) {
            setAvatarUrl(urlData.signedUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoadingAvatar(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});
    
    try {
      const validatedData = profileSchema.parse(formData);

      // Include pending avatar URL in the update if it exists
      const updateData = {
        user_id: session.user.id,
        ...validatedData,
        updated_at: new Date().toISOString(),
        avatar_url: pendingAvatarUrl || profile?.avatar_url // Use pending URL if exists
      };

      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (supabaseError) {
        console.error('Error updating profile:', supabaseError);
        setError('Failed to save profile. Please try again.');
        return;
      }

      const profileData: Profile = {
        ...validatedData,
        user_id: session.user.id,
        followers_count: profile?.followers_count || 0,
        following_count: profile?.following_count || 0,
        avatar_url: pendingAvatarUrl || profile?.avatar_url || null,
        bio: validatedData.bio || null,
        github: validatedData.github || null,
        linkedin: validatedData.linkedin || null,
        company: validatedData.company || null,
        website: validatedData.website || null,
        role: validatedData.role || null,
        skills: validatedData.skills || null
      };

      setProfile(profileData);
      setPendingAvatarUrl(null); // Clear pending avatar URL
      setEditing(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Convert Zod errors to our validation error format
        const errors: ValidationErrors = {};
        err.errors.forEach(error => {
          const path = error.path[0] as keyof FormData;
          errors[path] = error.message;
        });
        setValidationErrors(errors);
      } else {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof FormData]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const formFields = [
    { key: 'name', type: 'text', placeholder: 'Your full name', required: true },
    { key: 'role', type: 'text', placeholder: 'e.g., Frontend Developer, DevOps Engineer', required: true },
    { key: 'bio', type: 'textarea', placeholder: 'Tell us about yourself', required: false },
    { key: 'skills', type: 'text', placeholder: 'e.g., JavaScript, React, Node.js', required: false },
    { key: 'company', type: 'text', placeholder: 'Current Company', required: false },
    { key: 'github', type: 'url', placeholder: 'https://github.com/username', required: false },
    { key: 'linkedin', type: 'url', placeholder: 'https://linkedin.com/in/username', required: false },
    { key: 'website', type: 'url', placeholder: 'https://example.com', required: false },
  ];

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

  const uploadAvatar = async (file: File) => {
    try {
      // Check file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File must be JPEG, PNG, or WebP');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Instead of updating profile immediately, store the path
      setPendingAvatarUrl(filePath);
      
      // Get signed URL for immediate display
      const signedUrl = await getAvatarUrl(filePath);
      setAvatarUrl(signedUrl);

      return filePath; // Return the path for use in profile update
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Failed to upload avatar. Please try again.');
      return null;
    }
  };

  const deleteAvatar = async () => {
    try {
      if (!profile?.avatar_url) return;

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([profile.avatar_url]);

      if (deleteError) throw deleteError;

      // Update profile to remove avatar_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', session.user.id);

      if (updateError) throw updateError;

      // Update local state
      setAvatarUrl(null);
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setError('Failed to delete avatar. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== 'yes') return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) return;

      const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: session.user.id }
      });

      if (error) throw error;

      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="md:flex md:gap-8">
        {/* Avatar - responsive positioning */}
        <div className="mb-8 md:mb-0 flex justify-center md:block md:flex-shrink-0">
          {isLoadingAvatar ? (
            <ProfileImageSkeleton />
          ) : (
            <div className="relative" style={{ width: '128px', height: '128px' }}>
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${profile?.name || 'User'}`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <Button
                onClick={() => setIsPhotoDialogOpen(true)}
                className="absolute -bottom-3 -right-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transform translate-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
              </Button>
            </div>
          )}
        </div>

        {/* Main card */}
        <div className="flex-grow bg-white dark:bg-dark-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
          {!editing ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.name || 'New User'}
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
                <div className="flex gap-4 mt-2 text-sm">
                  <button
                    onClick={() => setShowFollowersDialog(true)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile?.followers_count || 0}
                    </span> followers
                  </button>
                  <button
                    onClick={() => setShowFollowingDialog(true)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile?.following_count || 0}
                    </span> following
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-4">{profile?.bio || 'No bio yet'}</p>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Skills</h3>
                <p className="text-gray-600 dark:text-gray-300">{profile?.skills || 'No skills listed'}</p>
              </div>
              <div className="space-y-2">
                {profile?.github && (
                  <a 
                    href={profile.github} 
                    className="block text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                )}
                {profile?.linkedin && (
                  <a 
                    href={profile.linkedin} 
                    className="block text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                )}
                {profile?.website && (
                  <a 
                    href={profile.website} 
                    className="block text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
                {formFields.map(({ key, type, placeholder, required }) => (
                  <div key={key}>
                    <label className="block mb-1 capitalize text-gray-700 dark:text-gray-300">
                      {key === 'linkedin' ? 'LinkedIn' : key}
                      {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {type === 'textarea' ? (
                      <textarea
                        name={key}
                        value={formData[key as keyof FormData]}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className={`w-full p-2 border rounded bg-white dark:bg-dark-700 
                        text-gray-900 dark:text-white border-gray-300 dark:border-gray-600
                        focus:ring-pink-500 focus:border-pink-500 dark:focus:ring-pink-400
                        placeholder:text-gray-300 dark:placeholder:text-gray-600
                        focus:placeholder:opacity-0
                        ${validationErrors[key as keyof FormData] ? 'border-red-500' : ''}`}
                        rows={3}
                      />
                    ) : (
                      <input
                        type={type}
                        name={key}
                        value={formData[key as keyof FormData]}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        required={required}
                        className={`w-full p-2 border rounded bg-white dark:bg-dark-700 
                        text-gray-900 dark:text-white border-gray-300 dark:border-gray-600
                        focus:ring-pink-500 focus:border-pink-500 dark:focus:ring-pink-400
                        placeholder:text-gray-300 dark:placeholder:text-gray-600
                        focus:placeholder:opacity-0
                        ${validationErrors[key as keyof FormData] ? 'border-red-500' : ''}`}
                      />
                    )}
                    {validationErrors[key as keyof FormData] && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors[key as keyof FormData]}
                      </p>
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

      <PhotoUploadDialog
        isOpen={isPhotoDialogOpen}
        onClose={() => {
          setIsPhotoDialogOpen(false);
          setPendingAvatarUrl(null); // Clear pending URL if dialog is closed without saving
        }}
        onUpload={async (file) => {
          const filePath = await uploadAvatar(file);
          setIsPhotoDialogOpen(false);
        }}
        onDelete={async () => {
          await deleteAvatar();
          setIsPhotoDialogOpen(false);
        }}
        hasExistingAvatar={!!profile?.avatar_url}
      />

      {/* Delete Account Button - right aligned */}
      <div className="mt-16 flex justify-end">
        <Button
          onClick={() => setIsDeleteDialogOpen(true)}
          variant="ghost"
          size="md"
          className="border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 
          hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white
          hover:border-red-600 dark:hover:border-red-600 transition-colors duration-200"
        >
          Delete account
        </Button>
      </div>

      {/* Delete Account Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This action cannot be undone. Type <span className="font-semibold">yes</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              mb-6 bg-transparent text-gray-900 dark:text-white"
              placeholder="Type 'yes' to confirm"
            />
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteConfirmation('');
                }}
                variant="ghost"
                size="md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                variant="ghost"
                size="md"
                disabled={deleteConfirmation.toLowerCase() !== 'yes'}
                className="border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 
                hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white
                hover:border-red-600 dark:hover:border-red-600 transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      <UserListDialog
        isOpen={showFollowersDialog}
        onClose={() => setShowFollowersDialog(false)}
        userId={session.user.id}
        type="followers"
        title="Followers"
      />

      <UserListDialog
        isOpen={showFollowingDialog}
        onClose={() => setShowFollowingDialog(false)}
        userId={session.user.id}
        type="following"
        title="Following"
      />
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
