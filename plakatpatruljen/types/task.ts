import { TaskClaimRow, PosterLogRow, CampaignRow, CampaignZoneRow, TaskClaimId } from './database';

export interface TaskClaim extends TaskClaimRow {
  campaign?: CampaignRow;
  zone?: CampaignZoneRow;
  posterLogs?: PosterLogRow[];
}

export interface HangingSession {
  taskClaimId: TaskClaimId;
  startedAt: string;
  postersHung: number;
  targetCount: number;
  logs: PosterLogRow[];
  isActive: boolean;
}

export interface TaskFilters {
  type?: 'hang' | 'remove';
  status?: TaskClaimRow['status'];
  campaignId?: string;
}
