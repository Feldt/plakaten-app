import { useState, useEffect, useCallback } from 'react';
import { getPosterLogs } from '@/lib/supabase/queries/posterLogs';
import type { PosterLogRow } from '@/types/database';

export function usePosterLogs(taskClaimId: string) {
  const [logs, setLogs] = useState<PosterLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getPosterLogs(taskClaimId);
    if (result.success) {
      setLogs(result.data as unknown as PosterLogRow[]);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, [taskClaimId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, isLoading, error, refetch: fetchLogs };
}
