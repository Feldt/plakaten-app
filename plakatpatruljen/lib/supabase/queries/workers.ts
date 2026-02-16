import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

const log = createLogger('queries:workers');

export async function getWorkerProfile(userId: string): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to get worker profile', e);
    return err(AppError.unknown(e));
  }
}

export async function createWorkerProfile(
  profile: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('worker_profiles')
      .insert(profile)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to create worker profile', e);
    return err(AppError.unknown(e));
  }
}

export async function updateWorkerProfile(
  id: string,
  updates: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('worker_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to update worker profile', e);
    return err(AppError.unknown(e));
  }
}
