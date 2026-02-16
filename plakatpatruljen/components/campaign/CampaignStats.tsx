import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '@/config/theme';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const NAVY = '#1A365D';
const SUCCESS = '#38A169';
const INFO = '#3B82F6';
const AMBER = '#ECC94B';

interface CampaignStatsProps {
  totalPosters: number;
  postersHung: number;
  activeWorkers: number;
  totalSpent: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isMoney?: boolean;
  moneyAmount?: number;
}

function StatCard({ label, value, icon, color, isMoney, moneyAmount }: StatCardProps) {
  return (
    <Card style={styles.statCard} padding={3}>
      {/* Titanium icon container */}
      <LinearGradient
        colors={['#F1F3F6', '#E8ECF0']}
        style={styles.iconContainer}
      >
        <Ionicons name={icon} size={20} color={color} />
      </LinearGradient>
      {isMoney && moneyAmount !== undefined ? (
        <MoneyDisplay amount={moneyAmount} size="sm" style={styles.statValue} />
      ) : (
        <Text style={styles.statValue}>{value}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

export function CampaignStats({ totalPosters, postersHung, activeWorkers, totalSpent }: CampaignStatsProps) {
  const { t } = useTranslation('campaign');
  return (
    <View style={styles.grid}>
      <StatCard label={t('dashboard.statPosters')} value={totalPosters} icon="images-outline" color={NAVY} />
      <StatCard label={t('dashboard.statHung')} value={postersHung} icon="checkmark-circle-outline" color={SUCCESS} />
      <StatCard label={t('dashboard.statWorkers')} value={activeWorkers} icon="people-outline" color={INFO} />
      <StatCard label={t('dashboard.statSpent')} value="" icon="cash-outline" color={AMBER} isMoney moneyAmount={totalSpent} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
    // Inset highlight + subtle outer shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: spacing[0.5],
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
