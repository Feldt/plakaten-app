import { CampaignRow, CampaignZoneRow, OrganizationRow, CampaignId, ZoneId } from './database';

export interface Campaign extends CampaignRow {
  organization?: OrganizationRow;
  zones?: CampaignZone[];
  pickupLocations?: PickupLocation[];
  posterContact?: PosterContact;
  progress: number; // 0-100
}

export interface CampaignZone extends CampaignZoneRow {
  assignedWorkerCount: number;
  completionPercentage: number;
}

export interface PickupLocation {
  id: string;
  campaignId: CampaignId;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  availablePosters: number;
  openHours: string;
  contactPhone?: string;
  notes?: string;
}

export interface PosterContact {
  name: string;
  phone: string;
  email: string;
}

export type CampaignFormStep = 'basic' | 'budget' | 'zones' | 'pickup' | 'contact' | 'review';

export interface CampaignFilters {
  status?: CampaignRow['status'];
  electionType?: CampaignRow['election_type'];
  search?: string;
  zoneId?: ZoneId;
  nearLocation?: { latitude: number; longitude: number; radiusKm: number };
}

export interface CampaignStats {
  totalPosters: number;
  postersHung: number;
  postersRemoved: number;
  activeWorkers: number;
  totalSpent: number;
  completionPercentage: number;
}
