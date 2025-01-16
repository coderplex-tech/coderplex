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
  created_at?: string;
  updated_at?: string;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  is_student: boolean;
  is_employed: boolean;
  is_freelance: boolean;
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
  avatar_url: string;
  followers_count: number;
  following_count: number;
  is_student: boolean;
  is_employed: boolean;
  is_freelance: boolean;
}
