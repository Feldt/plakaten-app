import { useCallback, useEffect } from 'react';
import { useCampaignStore } from '@/stores/campaignStore';
import { getCampaigns } from '@/lib/supabase/queries/campaigns';
import type { Campaign } from '@/types/campaign';

export function useCampaigns(organizationId?: string) {
  const { campaigns, isLoading, error, filters, setCampaigns, setLoading, setError, setFilters } =
    useCampaignStore();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const result = await getCampaigns({
      organizationId,
      status: filters.status,
    });
    if (result.success) {
      setCampaigns(result.data.data as unknown as Campaign[]);
    } else {
      setError(result.error.message);
    }
  }, [organizationId, filters.status, setCampaigns, setLoading, setError]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchCampaigns,
  };
}
