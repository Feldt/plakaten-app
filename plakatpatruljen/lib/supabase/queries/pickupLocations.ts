import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import type { PickupLocationRow, PickupLocationInsert } from '@/types/database';

const log = createLogger('queries:pickupLocations');

export async function getPickupLocations(campaignId: string): Promise<Result<PickupLocationRow[]>> {
  try {
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data ?? []);
  } catch (e) {
    log.error('Failed to get pickup locations', e);
    return err(AppError.unknown(e));
  }
}

export async function createPickupLocation(data: PickupLocationInsert): Promise<Result<PickupLocationRow>> {
  try {
    const { data: result, error } = await supabase
      .from('pickup_locations')
      .insert(data)
      .select()
      .single();
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(result);
  } catch (e) {
    log.error('Failed to create pickup location', e);
    return err(AppError.unknown(e));
  }
}

export async function deletePickupLocation(id: string): Promise<Result<void>> {
  try {
    const { error } = await supabase
      .from('pickup_locations')
      .delete()
      .eq('id', id);
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('Failed to delete pickup location', e);
    return err(AppError.unknown(e));
  }
}
