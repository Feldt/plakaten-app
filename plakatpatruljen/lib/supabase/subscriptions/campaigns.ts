import { supabase } from '../client';
import { createLogger } from '@/lib/logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

const log = createLogger('subscriptions:campaigns');

export function subscribeToCampaign(
  campaignId: string,
  onUpdate: (payload: Record<string, unknown>) => void,
): RealtimeChannel {
  log.info(`Subscribing to campaign ${campaignId}`);

  return supabase
    .channel(`campaign:${campaignId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'campaigns',
        filter: `id=eq.${campaignId}`,
      },
      (payload) => {
        log.debug('Campaign update received', payload);
        onUpdate(payload.new as Record<string, unknown>);
      },
    )
    .subscribe();
}

export function subscribeToCampaignZones(
  campaignId: string,
  onUpdate: (payload: Record<string, unknown>) => void,
): RealtimeChannel {
  return supabase
    .channel(`campaign_zones:${campaignId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'campaign_zones',
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        onUpdate(payload.new as Record<string, unknown>);
      },
    )
    .subscribe();
}
