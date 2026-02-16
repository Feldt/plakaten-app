import { supabase } from '../client';
import { createLogger } from '@/lib/logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

const log = createLogger('subscriptions:tasks');

export function subscribeToWorkerTasks(
  workerId: string,
  onUpdate: (payload: Record<string, unknown>) => void,
): RealtimeChannel {
  log.info(`Subscribing to worker tasks ${workerId}`);

  return supabase
    .channel(`worker_tasks:${workerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'task_claims',
        filter: `worker_id=eq.${workerId}`,
      },
      (payload) => {
        log.debug('Task update received', payload);
        onUpdate(payload.new as Record<string, unknown>);
      },
    )
    .subscribe();
}

export function subscribeToCampaignTasks(
  campaignId: string,
  onUpdate: (payload: Record<string, unknown>) => void,
): RealtimeChannel {
  return supabase
    .channel(`campaign_tasks:${campaignId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'task_claims',
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        onUpdate(payload.new as Record<string, unknown>);
      },
    )
    .subscribe();
}
