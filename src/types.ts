export interface Profile {
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
  updated_at?: string;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
  employment_status: 'employed' | 'unemployed' | 'student';
  looking_for_work: boolean;
  onboarding_completed: boolean;
}

export interface FormData {
  name: string;
  bio: string;
  skills: string;
  github: string;
  linkedin: string;
  company: string;
  website: string;
  role: string;
  avatar_url?: string;
} 