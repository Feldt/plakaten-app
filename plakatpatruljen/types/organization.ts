import { OrganizationRow, OrganizationId } from './database';

export interface OrganizationProfile extends OrganizationRow {
  activeCampaigns: number;
  totalCampaigns: number;
  totalSpent: number;
  memberCount: number;
}

export interface OrganizationMember {
  userId: string;
  organizationId: OrganizationId;
  role: 'owner' | 'admin' | 'member';
  fullName: string;
  email: string;
  joinedAt: string;
}
