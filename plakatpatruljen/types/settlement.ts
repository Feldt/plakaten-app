export type SettlementStatus = 'unsettled' | 'marked_settled' | 'paid';

export interface WorkerCampaignSummary {
  workerId: string;
  workerName: string;
  avatarUrl: string | null;
  postersHung: number;
  postersRemoved: number;
  totalEarnings: number;
  settlementStatus: SettlementStatus;
}
