import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import type { QueryOptions } from '@/types/api';

const log = createLogger('queries:campaigns');

export async function getCampaigns(
  options: QueryOptions & { organizationId?: string; status?: string } = {},
): Promise<Result<{ data: Record<string, unknown>[]; count: number }>> {
  try {
    const { page = 1, pageSize = 20, organizationId, status } = options;
    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('created_at', { ascending: false });

    if (organizationId) query = query.eq('organization_id', organizationId);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return err(AppError.fromSupabaseError(error));
    return ok({ data: data ?? [], count: count ?? 0 });
  } catch (e) {
    log.error('Failed to get campaigns', e);
    return err(AppError.unknown(e));
  }
}

export async function getCampaignById(id: string): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_zones(*)')
      .eq('id', id)
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to get campaign', e);
    return err(AppError.unknown(e));
  }
}

export async function createCampaign(
  campaign: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to create campaign', e);
    return err(AppError.unknown(e));
  }
}

export async function updateCampaign(
  id: string,
  updates: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to update campaign', e);
    return err(AppError.unknown(e));
  }
}
