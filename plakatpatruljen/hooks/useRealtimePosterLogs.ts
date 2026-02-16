import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useRealtimePosterLogs(
  campaignId: string,
  onInsert: (log: Record<string, unknown>) => void,
) {
  useEffect(() => {
    const channel = supabase
      .channel(`poster_logs:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poster_logs',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          onInsert(payload.new as Record<string, unknown>);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, onInsert]);
}
