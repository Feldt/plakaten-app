import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface EarningsSummary {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
}

export function useEarnings(workerId: string) {
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('payments')
        .select('amount, status')
        .eq('worker_id', workerId);

      if (data) {
        const total = data.reduce((sum, p) => sum + Number(p.amount), 0);
        const pending = data
          .filter((p) => p.status === 'pending' || p.status === 'processing')
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const paid = data
          .filter((p) => p.status === 'paid')
          .reduce((sum, p) => sum + Number(p.amount), 0);
        setEarnings({ totalEarnings: total, pendingEarnings: pending, paidEarnings: paid });
      }
    } finally {
      setIsLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return { earnings, isLoading, refetch: fetchEarnings };
}
