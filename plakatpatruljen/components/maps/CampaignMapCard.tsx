import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { titani, spacing, fontSizes, shadows } from '@/config/theme';
import { formatDKK } from '@/lib/formatters/currency';
import { formatDistance } from '@/lib/formatters/distance';
import { Badge } from '@/components/ui/Badge';
import type { Campaign } from '@/types/campaign';

interface CampaignMapCardProps {
  campaign: Campaign;
  distance: number | null;
  color: string;
  onPress: () => void;
  isActive?: boolean;
}

function CampaignMapCardInner({
  campaign,
  distance,
  color,
  onPress,
  isActive,
}: CampaignMapCardProps) {
  const { t } = useTranslation('worker');

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, isActive && styles.cardActive, { borderLeftColor: color }]}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.partyName} numberOfLines={1}>
            {campaign.organization?.party_name ?? campaign.title}
          </Text>
          <Text style={styles.campaignName} numberOfLines={1}>
            {campaign.title}
          </Text>
        </View>
        <Badge label={t('campaign.activeNow')} variant="success" />
      </View>
      <View style={styles.row}>
        <Text style={styles.rate}>
          {formatDKK(campaign.price_per_poster_hang)}/plakat
        </Text>
        <Text style={styles.available}>
          {t('campaign.available', { count: campaign.poster_count - campaign.posters_hung })}
        </Text>
      </View>
      {distance !== null && (
        <Text style={styles.distance}>
          {t('campaign.awayDistance', { distance: formatDistance(distance) })}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export const CampaignMapCard = memo(CampaignMapCardInner);

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: titani.card.radius,
    padding: spacing[4],
    marginHorizontal: spacing[2],
    borderLeftWidth: 4,
    ...shadows.titanium,
  },
  cardActive: {
    borderWidth: 1,
    borderColor: titani.navy,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  partyName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: titani.textSecondary,
  },
  campaignName: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: titani.text,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  rate: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: titani.success,
  },
  available: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
  },
  distance: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
  },
});
