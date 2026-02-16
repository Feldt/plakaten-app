import { useState, useEffect, useCallback } from 'react';
import { getCampaignTaskClaimsWithWorkers } from '@/lib/supabase/queries/tasks';

export function useCampaignWorkers(campaignId: string) {
  const [workers, setWorkers] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getCampaignTaskClaimsWithWorkers(campaignId);
    if (result.success) {
      // Group claims by worker
      const workerMap = new Map<string, Record<string, unknown>>();
      for (const claim of result.data) {
        const worker = claim.worker_profiles as any;
        const workerId = claim.worker_id as string;
        const existing = workerMap.get(workerId);
        if (existing) {
          (existing.postersCompleted as number) += (claim.posters_completed as number) ?? 0;
          (existing.earnings as number) += (claim.earnings as number) ?? 0;
          (existing.claims as Record<string, unknown>[]).push(claim);
        } else {
          workerMap.set(workerId, {
            id: workerId,
            fullName: worker?.full_name ?? 'Ukendt',
            avatarUrl: worker?.avatar_url ?? null,
            rating: worker?.rating ?? 0,
            postersCompleted: (claim.posters_completed as number) ?? 0,
            earnings: (claim.earnings as number) ?? 0,
            settlementStatus: claim.settlement_status ?? 'unsettled',
            claims: [claim],
          });
        }
      }
      setWorkers(Array.from(workerMap.values()));
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, [campaignId]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return { workers, isLoading, error, refetch: fetchWorkers };
}
