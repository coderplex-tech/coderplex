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
}
