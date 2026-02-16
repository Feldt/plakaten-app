import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { useTranslation } from 'react-i18next';
import { colors, spacing, fontSizes, fontWeights } from '@/config/theme';

interface BudgetCalculatorProps {
  posterCount: number;
  pricePerHang: number;
  pricePerRemove: number;
}

export function BudgetCalculator({ posterCount, pricePerHang, pricePerRemove }: BudgetCalculatorProps) {
  const { t } = useTranslation('campaign');
  const hangBudget = posterCount * pricePerHang;
  const removeBudget = posterCount * pricePerRemove;
  const totalBudget = hangBudget + removeBudget;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{t('create.totalBudget')}</Text>
      <MoneyDisplay amount={totalBudget} size="lg" />
      <View style={styles.breakdown}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('create.hangBudget')}</Text>
          <MoneyDisplay amount={hangBudget} size="sm" />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{t('create.removeBudget')}</Text>
          <MoneyDisplay amount={removeBudget} size="sm" />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: spacing[4] },
  title: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, color: colors.neutral[500], marginBottom: spacing[1] },
  breakdown: { marginTop: spacing[3], gap: spacing[2] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: fontSizes.sm, color: colors.neutral[600] },
});
