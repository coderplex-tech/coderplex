import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { Button } from './ui/Button';

interface UserListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

interface FollowData {
  [key: string]: {
    user_id: string;
    name: string;
    bio: string | null;
    skills: string | null;
    github: string | null;
    linkedin: string | null;
    company: string | null;
    website: string | null;
    role: string | null;
    avatar_url: string | null;
    followers_count: number;
    following_count: number;
  }
}

export function UserListDialog({ isOpen, onClose, userId, type, title }: UserListDialogProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user's ID when component mounts
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    }
    getCurrentUser();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('follows')
          .select(`
            ${type === 'followers' 
              ? 'follower:profiles!follows_follower_id_fkey(*)' 
              : 'following:profiles!follows_following_id_fkey(*)'
            }
          `)
          .eq(type === 'followers' ? 'following_id' : 'follower_id', userId);

        if (error) throw error;

        // Extract the nested profile data correctly
        const profiles = data.map((item: any) => 
          type === 'followers' ? item.follower : item.following
        );
        setUsers(profiles);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  // Fetch avatar URLs for users
  useEffect(() => {
    async function fetchAvatarUrls() {
      const urls: { [key: string]: string } = {};
      
      for (const user of users) {
        if (user.avatar_url) {
          const { data } = await supabase.storage
            .from('avatars')
            .createSignedUrl(user.avatar_url, 3600);
            
          if (data) {
            urls[user.user_id] = data.signedUrl;
          }
        }
      }
      
      setAvatarUrls(urls);
    }

    if (users.length > 0) {
      fetchAvatarUrls();
    }
  }, [users]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </Button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 p-4">
              No {type} yet
            </p>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <Link
                  key={user.user_id}
                  to={user.user_id === currentUserId ? '/profile' : `/profile/${user.user_id}`}
                  onClick={() => onClose()}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <img
                    src={avatarUrls[user.user_id] || `https://ui-avatars.com/api/?name=${user.name || 'User'}`}
                    alt={user.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name}
                      {user.user_id === currentUserId && (
                        <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(You)</span>
                      )}
                    </p>
                    {user.role && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.role}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 