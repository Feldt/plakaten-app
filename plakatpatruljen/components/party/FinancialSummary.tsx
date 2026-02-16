import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { useTranslation } from 'react-i18next';
import { spacing } from '@/config/theme';

// Titanium design system
const TEXT_PRIMARY = '#1E293B';
const TEXT_SECONDARY = '#8494A7';
const NAVY = '#1A365D';
const ERROR = '#E53E3E';

interface FinancialSummaryProps {
  totalBudget: number;
  spent: number;
  budgetUsedPercentage: number;
}

export function FinancialSummary({ totalBudget, spent, budgetUsedPercentage }: FinancialSummaryProps) {
  const { t } = useTranslation('campaign');
  const remaining = totalBudget - spent;
  const progressColor = budgetUsedPercentage > 90 ? ERROR : NAVY;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{t('detail.budgetOverview')}</Text>
      <ProgressBar progress={budgetUsedPercentage} color={progressColor} height={6} />
      <Text style={styles.percentage}>{budgetUsedPercentage}%</Text>
      <View style={styles.grid}>
        <View style={styles.item}>
          <Text style={styles.label}>{t('detail.totalBudget')}</Text>
          <MoneyDisplay amount={totalBudget} size="sm" />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>{t('detail.spent')}</Text>
          <MoneyDisplay amount={spent} size="sm" />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>{t('detail.remaining')}</Text>
          <MoneyDisplay amount={remaining} size="sm" style={{ color: remaining < 0 ? ERROR : TEXT_PRIMARY }} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: spacing[3],
    letterSpacing: -0.2,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: spacing[1],
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
  },
  item: {
    alignItems: 'center',
    gap: spacing[0.5],
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
