import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import type { QueryOptions } from '@/types/api';

const log = createLogger('queries:tasks');

export async function getTaskClaims(
  options: QueryOptions & { workerId?: string; campaignId?: string; status?: string } = {},
): Promise<Result<{ data: Record<string, unknown>[]; count: number }>> {
  try {
    const { page = 1, pageSize = 20, workerId, campaignId, status } = options;
    let query = supabase
      .from('task_claims')
      .select('*, campaign:campaigns(*), zone:campaign_zones(*)', { count: 'exact' })
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('created_at', { ascending: false });

    if (workerId) query = query.eq('worker_id', workerId);
    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return err(AppError.fromSupabaseError(error));
    return ok({ data: data ?? [], count: count ?? 0 });
  } catch (e) {
    log.error('Failed to get task claims', e);
    return err(AppError.unknown(e));
  }
}

export async function createTaskClaim(
  claim: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('task_claims')
      .insert(claim)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to create task claim', e);
    return err(AppError.unknown(e));
  }
}

export async function updateTaskClaim(
  id: string,
  updates: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('task_claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to update task claim', e);
    return err(AppError.unknown(e));
  }
}

export async function getCampaignTaskClaimsWithWorkers(
  campaignId: string,
): Promise<Result<Record<string, unknown>[]>> {
  try {
    const { data, error } = await supabase
      .from('task_claims')
      .select('*, worker_profiles(id, full_name, avatar_url, rating, phone, email)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data ?? []);
  } catch (e) {
    log.error('Failed to get campaign task claims with workers', e);
    return err(AppError.unknown(e));
  }
}

export async function updateTaskClaimSettlement(
  id: string,
  settlementStatus: 'unsettled' | 'marked_settled' | 'paid',
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('task_claims')
      .update({ settlement_status: settlementStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to update task claim settlement', e);
    return err(AppError.unknown(e));
  }
}
