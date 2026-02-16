import { WorkerProfileRow, WorkerId } from './database';

export interface WorkerProfile extends WorkerProfileRow {
  activeTaskCount: number;
  completedTaskCount: number;
}

export interface WorkerEarnings {
  workerId: WorkerId;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  earningsByMonth: { month: string; amount: number }[];
  recentPayments: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  campaignTitle: string;
  posterCount: number;
  type: 'hang' | 'remove';
  createdAt: string;
  paidAt: string | null;
}
