import { useState, useEffect, useCallback } from 'react';
import { getSettlementSummary } from '@/lib/supabase/queries/settlements';

export function useCampaignFinancials(campaignId: string, campaign: Record<string, unknown> | null) {
  const [settlement, setSettlement] = useState<{
    totalEarnings: number;
    settledAmount: number;
    unsettledAmount: number;
    workerCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getSettlementSummary(campaignId);
    if (result.success) {
      setSettlement(result.data);
    } else {
      setError(result.error.message);
    }
    setIsLoading(false);
  }, [campaignId]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  const totalBudget = campaign
    ? ((campaign.poster_count as number) ?? 0) *
        (((campaign.price_per_poster_hang as number) ?? 0) + ((campaign.price_per_poster_remove as number) ?? 0))
    : 0;

  const spent = settlement?.totalEarnings ?? 0;
  const budgetUsedPercentage = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;

  return {
    settlement,
    totalBudget,
    spent,
    budgetUsedPercentage,
    isLoading,
    error,
    refetch: fetchFinancials,
  };
}
