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
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          id: string
          user_id: string | null
          slug: string
          destination_url: string
          title: string | null
          description: string | null
          is_active: boolean
          expires_at: string | null
          max_clicks: number | null
          click_count: number
          redirect_type: 301 | 302 | 307
          password_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          slug: string
          destination_url: string
          title?: string | null
          description?: string | null
          is_active?: boolean
          expires_at?: string | null
          max_clicks?: number | null
          click_count?: number
          redirect_type?: 301 | 302 | 307
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          slug?: string
          destination_url?: string
          title?: string | null
          description?: string | null
          is_active?: boolean
          expires_at?: string | null
          max_clicks?: number | null
          click_count?: number
          redirect_type?: 301 | 302 | 307
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      click_events: {
        Row: {
          id: number
          link_id: string
          created_at: string
          country: string | null
          city: string | null
          device: string | null
          browser: string | null
          os: string | null
          referrer: string | null
        }
        Insert: {
          id?: number
          link_id: string
          created_at?: string
          country?: string | null
          city?: string | null
          device?: string | null
          browser?: string | null
          os?: string | null
          referrer?: string | null
        }
        Update: {
          id?: number
          link_id?: string
          created_at?: string
          country?: string | null
          city?: string | null
          device?: string | null
          browser?: string | null
          os?: string | null
          referrer?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          link_id: string | null
          slug: string
          reason: 'spam' | 'phishing' | 'malware' | 'scam' | 'illegal' | 'other'
          description: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          link_id?: string | null
          slug: string
          reason: 'spam' | 'phishing' | 'malware' | 'scam' | 'illegal' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
        }
        Update: {
          id?: string
          link_id?: string | null
          slug?: string
          reason?: 'spam' | 'phishing' | 'malware' | 'scam' | 'illegal' | 'other'
          description?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
        }
        Relationships: []
      }
      blocked_domains: {
        Row: {
          id: string
          domain: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          domain: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          domain?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_link_clicks: {
        Args: { target_link_id: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
