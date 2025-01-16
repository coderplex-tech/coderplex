export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          name: string | null
          bio: string | null
          skills: string | null
          github: string | null
          linkedin: string | null
          company: string | null
          website: string | null
          role: string | null
          created_at: string
          updated_at: string | null
          is_student: boolean
          is_employed: boolean
          is_freelance: boolean
          onboarding_completed: boolean
        }
        Insert: {
          user_id: string
          name?: string | null
          bio?: string | null
          skills?: string | null
          github?: string | null
          linkedin?: string | null
          company?: string | null
          website?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string | null
          is_student?: boolean
          is_employed?: boolean
          is_freelance?: boolean
          onboarding_completed?: boolean
        }
        Update: {
          user_id?: string
          name?: string | null
          bio?: string | null
          skills?: string | null
          github?: string | null
          linkedin?: string | null
          company?: string | null
          website?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string | null
          is_student?: boolean
          is_employed?: boolean
          is_freelance?: boolean
          onboarding_completed?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 