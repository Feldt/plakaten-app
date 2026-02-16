import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

const log = createLogger('queries:organizations');

export async function getOrganization(id: string): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to get organization', e);
    return err(AppError.unknown(e));
  }
}

export async function createOrganization(
  org: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .insert(org)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to create organization', e);
    return err(AppError.unknown(e));
  }
}

export async function getOrganizationMembers(
  organizationId: string,
): Promise<Result<Record<string, unknown>[]>> {
  try {
    const { data, error } = await supabase
      .from('organization_members')
      .select('*, user_profiles(*)')
      .eq('organization_id', organizationId);

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data ?? []);
  } catch (e) {
    log.error('Failed to get organization members', e);
    return err(AppError.unknown(e));
  }
}

export async function updateOrganization(
  id: string,
  updates: Record<string, unknown>,
): Promise<Result<Record<string, unknown>>> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return err(AppError.fromSupabaseError(error));
    return ok(data);
  } catch (e) {
    log.error('Failed to update organization', e);
    return err(AppError.unknown(e));
  }
}
