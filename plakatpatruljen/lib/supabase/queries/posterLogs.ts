import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

const log = createLogger('queries:posterLogs');

export async function getPosterLogs(
  taskClaimId: string,
): Promise<Result<Record<string, unknown>[]>> {
  try {
    const { data, error } = await supabase
      .from('poster_logs')
      .select('*')
      .eq('task_claim_id', taskClaimId)
      .order('created_at', { ascending: false });

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data ?? []);
  } catch (e) {
    log.error('Failed to get poster logs', e);
    return err(AppError.unknown(e));
  }
}

export async function createPosterLog(
  posterLog: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('poster_logs')
      .insert(posterLog)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to create poster log', e);
    return err(AppError.unknown(e));
  }
}

export async function getCampaignPosterLogs(
  campaignId: string,
): Promise<Result<Record<string, unknown>[]>> {
  try {
    const { data, error } = await supabase
      .from('poster_logs')
      .select('*, worker_profiles(full_name)')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data ?? []);
  } catch (e) {
    log.error('Failed to get campaign poster logs', e);
    return err(AppError.unknown(e));
  }
}

export async function getCampaignPosterLogsPaginated(
  campaignId: string,
  options: { page?: number; pageSize?: number; verified?: boolean; type?: 'hang' | 'remove' } = {},
): Promise<Result<{ data: Record<string, unknown>[]; count: number }>> {
  try {
    const { page = 1, pageSize = 20, verified, type } = options;
    let query = supabase
      .from('poster_logs')
      .select('*, worker_profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('created_at', { ascending: false });

    if (verified !== undefined) query = query.eq('verified', verified);
    if (type) query = query.eq('type', type);

    const { data, error, count } = await query;
    if (error) return err(AppError.fromSupabaseError(error));
    return ok({ data: data ?? [], count: count ?? 0 });
  } catch (e) {
    log.error('Failed to get paginated campaign poster logs', e);
    return err(AppError.unknown(e));
  }
}

export async function updatePosterLog(
  id: string,
  updates: { verified?: boolean; notes?: string },
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('poster_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to update poster log', e);
    return err(AppError.unknown(e));
  }
}
