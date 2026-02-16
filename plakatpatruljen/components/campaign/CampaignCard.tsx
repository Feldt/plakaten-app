import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTranslation } from 'react-i18next';
import { formatDKKCompact } from '@/lib/formatters/currency';
import { formatDate } from '@/lib/formatters/date';
import { spacing } from '@/config/theme';
import type { CampaignRow } from '@/types/database';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const NAVY = '#1A365D';

// Election type badge colors
const ELECTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  kommunal: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  folketings: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
  regional: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  europa: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  folkeafstemning: { bg: '#FAF5FF', text: '#9333EA', border: '#E9D5FF' },
};

interface CampaignCardProps {
  campaign: CampaignRow;
  onPress: () => void;
}

export function CampaignCard({ campaign, onPress }: CampaignCardProps) {
  const { t } = useTranslation('campaign');
  const progress = campaign.poster_count > 0
    ? Math.round((campaign.posters_hung / campaign.poster_count) * 100)
    : 0;

  const electionType = campaign.election_type as string;
  const electionColor = ELECTION_COLORS[electionType] ?? ELECTION_COLORS.kommunal;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        {/* Top row: election type badge + status badge */}
        <View style={styles.badgeRow}>
          <View style={[styles.electionBadge, { backgroundColor: electionColor.bg, borderColor: electionColor.border }]}>
            <Text style={[styles.electionBadgeText, { color: electionColor.text }]}>
              {t(`electionTypes.${electionType}`).toUpperCase()}
            </Text>
          </View>
          <StatusBadge status={campaign.status} />
        </View>

        {/* Campaign name + rate */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{campaign.title}</Text>
          <Text style={styles.rate}>{campaign.price_per_poster_hang} kr./plakat</Text>
        </View>

        {/* Progress section */}
        <View style={styles.progressSection}>
          <Text style={styles.progressCaption}>FREMSKRIDT</Text>
          <ProgressBar progress={progress} />
          <Text style={styles.progressText}>
            {campaign.posters_hung} / {campaign.poster_count} PLAKATER
          </Text>
        </View>

        {/* Date range */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={TEXT_SECONDARY} />
          <Text style={styles.dateText}>{formatDate(campaign.election_date)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[3],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  electionBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 20,
    borderWidth: 1,
  },
  electionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    flex: 1,
    marginRight: spacing[2],
    letterSpacing: -0.2,
  },
  rate: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  progressSection: {
    gap: spacing[1],
    marginBottom: spacing[3],
  },
  progressCaption: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: 0.3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  dateText: {
    fontSize: 13,
    fontWeight: '400',
    color: TEXT_SECONDARY,
  },
});
