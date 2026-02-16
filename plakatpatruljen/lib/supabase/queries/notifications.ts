import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

const log = createLogger('queries:notifications');

export async function getNotifications(
  userId: string,
): Promise<Result<Record<string, unknown>[]>> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data ?? []);
  } catch (e) {
    log.error('Failed to get notifications', e);
    return err(AppError.unknown(e));
  }
}

export async function markNotificationRead(id: string): Promise<Result<void>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('Failed to mark notification read', e);
    return err(AppError.unknown(e));
  }
}

export async function markAllNotificationsRead(userId: string): Promise<Result<void>> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('Failed to mark all notifications read', e);
    return err(AppError.unknown(e));
  }
}
