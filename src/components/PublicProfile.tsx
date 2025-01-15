import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { Button } from './ui/Button';
import { UserListDialog } from './UserListDialog';

function ProfileImageSkeleton() {
  return (
    <div className="relative" style={{ width: '128px', height: '128px' }}>
      <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    </div>
  );
}

export function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select()
          .eq('user_id', id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
          
          // Get signed URL if avatar exists
          if (data?.avatar_url) {
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
        setLoading(false);
        setIsLoadingAvatar(false);
      }
    }

    fetchProfile();
  }, [id]);

  // Check if current user is following this profile
  useEffect(() => {
    async function checkFollowStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && id) {
        const { data } = await supabase
          .from('follows')
          .select()
          .eq('follower_id', session.user.id)
          .eq('following_id', id)
          .single();
        
        setIsFollowing(!!data);
      }
    }
    checkFollowStatus();
  }, [id]);

  const handleFollow = async () => {
    setFollowLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !id) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert([
            { follower_id: session.user.id, following_id: id }
          ]);

        if (error) throw error;
      }

      // Fetch updated profile data after successful follow/unfollow
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', id)
        .single();

      if (profileError) throw profileError;

      setProfile(updatedProfile);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

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
          {isLoadingAvatar ? (
            <ProfileImageSkeleton />
          ) : (
            <div style={{ width: '128px', height: '128px' }}>
              <img
                src={avatarUrl || `https://ui-avatars.com/api/?name=${profile?.name || 'User'}`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Main card */}
        <div className="flex-grow bg-white dark:bg-dark-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
          <div className="flex justify-between items-start mb-6">
            <div>
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
              <div className="flex gap-4 mt-2 text-sm">
                <button
                  onClick={() => setShowFollowersDialog(true)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {profile?.followers_count || 0}
                  </span> followers
                  {isFollowing && (
                    <span className="ml-1 text-blue-600 dark:text-blue-400 text-xs">
                      • Including you
                    </span>
                  )}
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
              <p className="text-gray-600 dark:text-gray-300 mt-4">{profile?.bio}</p>
            </div>
            
            {/* Follow Button */}
            <Button
              onClick={handleFollow}
              variant={isFollowing ? "ghost" : "primary"}
              size="md"
              className={`min-w-[100px] group ${
                isFollowing 
                  ? 'border border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400' 
                  : ''
              }`}
              disabled={followLoading}
            >
              {followLoading ? (
                <span className="inline-block animate-spin">⋯</span>
              ) : isFollowing ? (
                <>
                  <span className="block group-hover:hidden">Following</span>
                  <span className="hidden group-hover:block">Unfollow</span>
                </>
              ) : (
                "Follow"
              )}
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Skills</h3>
            <p className="text-gray-600 dark:text-gray-300">{profile?.skills}</p>
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
        </div>
      </div>

      <UserListDialog
        isOpen={showFollowersDialog}
        onClose={() => setShowFollowersDialog(false)}
        userId={id!}
        type="followers"
        title="Followers"
      />

      <UserListDialog
        isOpen={showFollowingDialog}
        onClose={() => setShowFollowingDialog(false)}
        userId={id!}
        type="following"
        title="Following"
      />
    </div>
  );
} 