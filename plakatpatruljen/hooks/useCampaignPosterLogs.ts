import { useState, useEffect, useCallback } from 'react';
import { getCampaignPosterLogsPaginated } from '@/lib/supabase/queries/posterLogs';

export function useCampaignPosterLogs(
  campaignId: string,
  filters?: { verified?: boolean; type?: 'hang' | 'remove' },
) {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getCampaignPosterLogsPaginated(campaignId, {
      page,
      pageSize: 20,
      verified: filters?.verified,
      type: filters?.type,
    });
    if (result.success) {
      if (page === 1) {
        setLogs(result.data.data);
      } else {
        setLogs((prev) => [...prev, ...result.data.data]);
      }
      setCount(result.data.count);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, [campaignId, page, filters?.verified, filters?.type]);

  useEffect(() => {
    setPage(1);
  }, [filters?.verified, filters?.type]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const loadMore = useCallback(() => {
    if (logs.length < count) {
      setPage((p) => p + 1);
    }
  }, [logs.length, count]);

  return { logs, count, isLoading, error, loadMore, hasMore: logs.length < count, refetch: () => { setPage(1); fetchLogs(); } };
}
