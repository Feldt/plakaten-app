import { useState, useEffect, useCallback } from 'react';
import { getOrganization } from '@/lib/supabase/queries/organizations';

export function useOrganization(orgId: string | undefined) {
  const [organization, setOrganization] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setError(null);
    const result = await getOrganization(orgId);
    if (result.success) {
      setOrganization(result.data);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, [orgId]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  return { organization, isLoading, error, refetch: fetchOrganization };
}
