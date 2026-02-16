// Supabase row types for PlakatPatruljen

declare namespace GeoJSON {
  interface Polygon {
    type: 'Polygon';
    coordinates: number[][][];
  }
}

// Branded ID types for type safety
type Brand<T, B> = T & { __brand: B };
export type OrganizationId = Brand<string, 'OrganizationId'>;
export type CampaignId = Brand<string, 'CampaignId'>;
export type WorkerId = Brand<string, 'WorkerId'>;
export type TaskClaimId = Brand<string, 'TaskClaimId'>;
export type PosterLogId = Brand<string, 'PosterLogId'>;
export type UserId = Brand<string, 'UserId'>;
export type ZoneId = Brand<string, 'ZoneId'>;

// Row types matching Supabase tables
export interface OrganizationRow {
  id: OrganizationId;
  name: string;
  cvr_number: string;
  party_name: string;
  party_color: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string | null;
  address: string | null;
  street_address: string | null;
  zip_code: string | null;
  city: string | null;
  status: string;
  created_by: UserId;
  created_at: string;
  updated_at: string;
}

export interface CampaignRow {
  id: CampaignId;
  organization_id: OrganizationId;
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
  poster_contact_name: string | null;
  poster_contact_phone: string | null;
  poster_contact_email: string | null;
  election_called_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignZoneRow {
  id: ZoneId;
  campaign_id: CampaignId;
  name: string;
  geojson: GeoJSON.Polygon;
  poster_count: number;
  posters_assigned: number;
  priority: number;
  created_at: string;
}

export interface WorkerProfileRow {
  id: WorkerId;
  user_id: UserId;
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
  preferred_zones: ZoneId[];
  created_at: string;
  updated_at: string;
}

export interface TaskClaimRow {
  id: TaskClaimId;
  campaign_id: CampaignId;
  zone_id: ZoneId;
  worker_id: WorkerId;
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
}

export interface PickupLocationRow {
  id: string;
  campaign_id: CampaignId;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  available_posters: number;
  open_hours: string;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
}

export type PickupLocationInsert = Omit<PickupLocationRow, 'id' | 'created_at'>;

export interface PosterLogRow {
  id: PosterLogId;
  task_claim_id: TaskClaimId;
  campaign_id: CampaignId;
  worker_id: WorkerId;
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
}

export interface NotificationRow {
  id: string;
  user_id: UserId;
  title: string;
  body: string;
  type: 'task_available' | 'task_expiring' | 'payment_sent' | 'campaign_update' | 'system';
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

// Insert types (omit auto-generated fields)
export type OrganizationInsert = Omit<OrganizationRow, 'id' | 'created_at' | 'updated_at'>;
export type CampaignInsert = Omit<CampaignRow, 'id' | 'posters_hung' | 'posters_removed' | 'created_at' | 'updated_at'>;
export type WorkerProfileInsert = Omit<WorkerProfileRow, 'id' | 'rating' | 'total_posters_hung' | 'total_posters_removed' | 'total_earnings' | 'created_at' | 'updated_at'>;
export type TaskClaimInsert = Omit<TaskClaimRow, 'id' | 'posters_completed' | 'started_at' | 'completed_at' | 'earnings' | 'created_at' | 'updated_at'>;
export type PosterLogInsert = Omit<PosterLogRow, 'id' | 'thumbnail_url' | 'verified' | 'created_at'>;

// Update types (all optional except id)
export type CampaignUpdate = Partial<Omit<CampaignRow, 'id' | 'organization_id' | 'created_at'>> & { id: CampaignId };
export type TaskClaimUpdate = Partial<Omit<TaskClaimRow, 'id' | 'campaign_id' | 'worker_id' | 'created_at'>> & { id: TaskClaimId };
export type PosterLogUpdate = Partial<Pick<PosterLogRow, 'verified' | 'notes'>>;
