// Placeholder for Supabase CLI generated types
// Run: npx supabase gen types typescript --local > lib/supabase/database.types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          role: 'party_admin' | 'worker' | 'platform_admin';
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          cvr_number: string;
          party_name: string;
          party_color: string;
          contact_email: string;
          contact_phone: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          election_type: 'kommunal' | 'regional' | 'folketings' | 'europa';
          election_date: string;
          hanging_start: string;
          removal_deadline: string;
          poster_count: number;
          posters_hung: number;
          posters_removed: number;
          price_per_poster_hang: number;
          price_per_poster_remove: number;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          description: string | null;
          poster_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'posters_hung' | 'posters_removed' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>;
      };
      campaign_zones: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          geojson: Json;
          poster_count: number;
          posters_assigned: number;
          priority: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['campaign_zones']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['campaign_zones']['Insert']>;
      };
      worker_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          rating: number;
          total_posters_hung: number;
          total_posters_removed: number;
          total_earnings: number;
          is_verified: boolean;
          is_active: boolean;
          preferred_zones: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['worker_profiles']['Row'], 'id' | 'rating' | 'total_posters_hung' | 'total_posters_removed' | 'total_earnings' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['worker_profiles']['Insert']>;
      };
      task_claims: {
        Row: {
          id: string;
          campaign_id: string;
          zone_id: string;
          worker_id: string;
          type: 'hang' | 'remove';
          poster_count: number;
          posters_completed: number;
          status: 'claimed' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
          claimed_at: string;
          started_at: string | null;
          completed_at: string | null;
          expires_at: string;
          earnings: number;
          settlement_status: 'unsettled' | 'marked_settled' | 'paid';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['task_claims']['Row'], 'id' | 'posters_completed' | 'started_at' | 'completed_at' | 'earnings' | 'settlement_status' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['task_claims']['Insert']>;
      };
      poster_logs: {
        Row: {
          id: string;
          task_claim_id: string;
          campaign_id: string;
          worker_id: string;
          type: 'hang' | 'remove';
          latitude: number;
          longitude: number;
          photo_url: string;
          thumbnail_url: string | null;
          address: string | null;
          notes: string | null;
          rule_violations: string[];
          verified: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['poster_logs']['Row'], 'id' | 'thumbnail_url' | 'verified' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['poster_logs']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type: 'task_available' | 'task_expiring' | 'payment_sent' | 'campaign_update' | 'system';
          data: Json | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      record_poster_log: {
        Args: {
          p_task_claim_id: string;
          p_campaign_id: string;
          p_worker_id: string;
          p_type: string;
          p_latitude: number;
          p_longitude: number;
          p_photo_url: string;
          p_address: string | null;
          p_notes: string | null;
          p_rule_violations: string[];
        };
        Returns: {
          log_id: string;
          new_count: number;
          new_earnings: number;
          is_complete: boolean;
          status: string;
        };
      };
    };
    Enums: {
      election_type: 'kommunal' | 'regional' | 'folketings' | 'europa';
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
      task_type: 'hang' | 'remove';
      task_status: 'claimed' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
      user_role: 'party_admin' | 'worker' | 'platform_admin';
      notification_type: 'task_available' | 'task_expiring' | 'payment_sent' | 'campaign_update' | 'system';
    };
  };
}
