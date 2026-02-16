import { useEffect, useCallback } from 'react';
import * as Network from 'expo-network';
import { supabase } from '@/lib/supabase/client';
import { useOfflineQueueStore } from '@/stores/offlineQueueStore';
import { uploadFile } from '@/lib/supabase/storage';
import { createLogger } from '@/lib/logger';

const log = createLogger('useOfflineQueue');

export function useOfflineQueue() {
  const { pendingLogs, removePending, incrementRetry, isRetrying, setRetrying } =
    useOfflineQueueStore();

  const retryAll = useCallback(async () => {
    if (isRetrying || pendingLogs.length === 0) return;

    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected || !networkState.isInternetReachable) return;

    setRetrying(true);

    for (const pending of pendingLogs) {
      if (pending.retryCount >= 5) continue;

      try {
        const storagePath = `${pending.rpcParams.p_campaign_id}/${pending.rpcParams.p_worker_id}/${Date.now()}.jpg`;
        const uploadResult = await uploadFile('poster-photos', storagePath, {
          uri: pending.photoUri,
        });

        if (!uploadResult.success) {
          incrementRetry(pending.id);
          continue;
        }

        const { error } = await supabase.rpc('record_poster_log', {
          ...pending.rpcParams,
          p_photo_url: uploadResult.data,
        });

        if (error) throw error;

        removePending(pending.id);
        log.info(`Retried pending log ${pending.id} successfully`);
      } catch {
        incrementRetry(pending.id);
      }
    }

    setRetrying(false);
  }, [isRetrying, pendingLogs, removePending, incrementRetry, setRetrying]);

  // Check network periodically and retry
  useEffect(() => {
    if (pendingLogs.length === 0) return;

    const interval = setInterval(retryAll, 30000);
    // Also try immediately on mount
    retryAll();

    return () => clearInterval(interval);
  }, [pendingLogs.length, retryAll]);

  return {
    pendingCount: pendingLogs.length,
    isRetrying,
    retryAll,
  };
}
