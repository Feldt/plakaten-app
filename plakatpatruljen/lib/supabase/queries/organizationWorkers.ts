import { supabase } from '../client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

const log = createLogger('queries:organizationWorkers');

export async function getOrganizationWorkers(organizationId: string): Promise<Result<Record<string, unknown>[]>> {
  try {
    // Get workers who have task_claims on campaigns belonging to this org
    const { data: campaigns, error: campError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('organization_id', organizationId);

    if (campError) return err(AppError.fromSupabaseError(campError));
    if (!campaigns?.length) return ok([]);

    const campaignIds = campaigns.map((c) => c.id);

    const { data, error } = await supabase
      .from('task_claims')
      .select('worker_id, worker_profiles(*), campaign_id, type, posters_completed, earnings, status')
      .in('campaign_id', campaignIds);

    if (error) return err(AppError.fromSupabaseError(error));

    // Group by worker
    const workerMap = new Map<string, Record<string, unknown>>();
    for (const claim of data ?? []) {
      const worker = claim.worker_profiles as any;
      const workerId = claim.worker_id as string;
      const existing = workerMap.get(workerId);
      if (existing) {
        (existing.totalPosters as number) += claim.posters_completed ?? 0;
        (existing.totalEarnings as number) += claim.earnings ?? 0;
        if (claim.status === 'in_progress' || claim.status === 'claimed') {
          (existing.activeTasks as number) += 1;
        }
      } else {
        workerMap.set(workerId, {
          id: workerId,
          fullName: worker?.full_name ?? 'Ukendt',
          email: worker?.email ?? '',
          phone: worker?.phone ?? '',
          avatarUrl: worker?.avatar_url ?? null,
          rating: worker?.rating ?? 0,
          isVerified: worker?.is_verified ?? false,
          totalPosters: claim.posters_completed ?? 0,
          totalEarnings: claim.earnings ?? 0,
          activeTasks: (claim.status === 'in_progress' || claim.status === 'claimed') ? 1 : 0,
        });
      }
    }

    return ok(Array.from(workerMap.values()));
  } catch (e) {
    log.error('Failed to get organization workers', e);
    return err(AppError.unknown(e));
  }
}
