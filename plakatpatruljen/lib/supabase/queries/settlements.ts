import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import type { WorkerCampaignSummary, SettlementStatus } from '@/types/settlement';

const log = createLogger('queries:settlements');

export async function getCampaignWorkerSummaries(campaignId: string): Promise<Result<WorkerCampaignSummary[]>> {
  try {
    const { data, error } = await supabase
      .from('task_claims')
      .select('*, worker_profiles(id, full_name, avatar_url)')
      .eq('campaign_id', campaignId);

    if (error) return err(AppError.fromSupabaseError(error));

    const workerMap = new Map<string, WorkerCampaignSummary>();
    for (const claim of data ?? []) {
      const worker = claim.worker_profiles as any;
      const workerId = claim.worker_id as string;
      const existing = workerMap.get(workerId);
      if (existing) {
        if (claim.type === 'hang') existing.postersHung += claim.posters_completed ?? 0;
        else existing.postersRemoved += claim.posters_completed ?? 0;
        existing.totalEarnings += claim.earnings ?? 0;
        if (claim.settlement_status === 'unsettled') existing.settlementStatus = 'unsettled';
      } else {
        workerMap.set(workerId, {
          workerId,
          workerName: worker?.full_name ?? 'Ukendt',
          avatarUrl: worker?.avatar_url ?? null,
          postersHung: claim.type === 'hang' ? (claim.posters_completed ?? 0) : 0,
          postersRemoved: claim.type === 'remove' ? (claim.posters_completed ?? 0) : 0,
          totalEarnings: claim.earnings ?? 0,
          settlementStatus: claim.settlement_status ?? 'unsettled',
        });
      }
    }
    return ok(Array.from(workerMap.values()));
  } catch (e) {
    log.error('Failed to get campaign worker summaries', e);
    return err(AppError.unknown(e));
  }
}

export async function markWorkerSettled(campaignId: string, workerId: string): Promise<Result<void>> {
  try {
    const { error } = await supabase
      .from('task_claims')
      .update({ settlement_status: 'marked_settled' })
      .eq('campaign_id', campaignId)
      .eq('worker_id', workerId)
      .eq('settlement_status', 'unsettled');
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('Failed to mark worker settled', e);
    return err(AppError.unknown(e));
  }
}

export async function getSettlementSummary(campaignId: string): Promise<Result<{
  totalEarnings: number;
  settledAmount: number;
  unsettledAmount: number;
  workerCount: number;
}>> {
  try {
    const { data, error } = await supabase
      .from('task_claims')
      .select('earnings, settlement_status, worker_id')
      .eq('campaign_id', campaignId);

    if (error) return err(AppError.fromSupabaseError(error));

    const workers = new Set<string>();
    let totalEarnings = 0;
    let settledAmount = 0;
    let unsettledAmount = 0;

    for (const claim of data ?? []) {
      workers.add(claim.worker_id);
      const earnings = claim.earnings ?? 0;
      totalEarnings += earnings;
      if (claim.settlement_status === 'unsettled') {
        unsettledAmount += earnings;
      } else {
        settledAmount += earnings;
      }
    }

    return ok({ totalEarnings, settledAmount, unsettledAmount, workerCount: workers.size });
  } catch (e) {
    log.error('Failed to get settlement summary', e);
    return err(AppError.unknown(e));
  }
}
