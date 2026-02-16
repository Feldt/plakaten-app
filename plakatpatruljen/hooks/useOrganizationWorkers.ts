import { useState, useEffect, useCallback } from 'react';
import { getOrganizationWorkers } from '@/lib/supabase/queries/organizationWorkers';

export function useOrganizationWorkers(orgId: string | undefined) {
  const [workers, setWorkers] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setError(null);
    const result = await getOrganizationWorkers(orgId);
    if (result.success) {
      setWorkers(result.data);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, [orgId]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  return { workers, isLoading, error, refetch: fetchWorkers };
}
