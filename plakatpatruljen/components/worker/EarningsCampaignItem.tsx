import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { titani, spacing, fontSizes, shadows } from '@/config/theme';

interface EarningsCampaignItemProps {
  campaignTitle: string;
  postersCompleted: number;
  totalPosters: number;
  earnings: number;
}

export function EarningsCampaignItem({
  campaignTitle,
  postersCompleted,
  totalPosters,
  earnings,
}: EarningsCampaignItemProps) {
  const progress = totalPosters > 0 ? (postersCompleted / totalPosters) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{campaignTitle}</Text>
        <MoneyDisplay amount={earnings} size="sm" />
      </View>
      <ProgressBar progress={progress} height={4} color={titani.success} />
      <Text style={styles.count}>
        {postersCompleted}/{totalPosters} plakater
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: titani.card.radius,
    borderWidth: 1,
    borderColor: titani.card.border,
    padding: spacing[4],
    marginBottom: spacing[2],
    ...shadows.titanium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  title: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: titani.text,
    marginRight: spacing[2],
  },
  count: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginTop: spacing[1],
  },
});
