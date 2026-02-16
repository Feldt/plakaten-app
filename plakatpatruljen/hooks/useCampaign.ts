import { useState, useEffect, useCallback } from 'react';
import { getCampaignById } from '@/lib/supabase/queries/campaigns';

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getCampaignById(id);
    if (result.success) {
      setCampaign(result.data);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  return { campaign, isLoading, error, refetch: fetchCampaign };
}
