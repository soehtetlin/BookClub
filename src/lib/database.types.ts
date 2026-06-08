export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reading_sessions: {
        Row: {
          id: string
          host_id: string
          title: string
          author: string
          total_chapters: number
          description: string | null
          cover_url: string | null
          visibility: string
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          author: string
          total_chapters: number
          description?: string | null
          cover_url?: string | null
          visibility?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          title?: string
          author?: string
          total_chapters?: number
          description?: string | null
          cover_url?: string | null
          visibility?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      session_members: {
        Row: {
          id: string
          session_id: string
          user_id: string
          is_host: boolean
          current_chapter: number
          reading_status: string
          joined_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          is_host?: boolean
          current_chapter?: number
          reading_status?: string
          joined_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          is_host?: boolean
          current_chapter?: number
          reading_status?: string
          joined_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          session_id: string
          user_id: string
          body: string
          created_at: string
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          body: string
          created_at?: string
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          body?: string
          created_at?: string
          updated_at?: string | null
          deleted_at?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      session_roster: {
        Row: {
          session_id: string
          user_id: string
          is_host: boolean
          joined_at: string
          display_name: string
          avatar_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      join_session: {
        Args: { p_session_id: string }
        Returns: Database['public']['Tables']['session_members']['Row']
      }
      get_session_progress_stats: {
        Args: { p_session_id: string }
        Returns: Json
      }
      get_session_roster: {
        Args: { p_session_id: string }
        Returns: {
          user_id: string
          display_name: string
          avatar_url: string | null
          is_host: boolean
          joined_at: string
        }[]
      }
      upsert_reaction: {
        Args: { p_comment_id: string; p_emoji: string }
        Returns: Database['public']['Tables']['reactions']['Row']
      }
      host_delete_comment: {
        Args: { p_comment_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
