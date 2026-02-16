import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { titani, spacing, fontSizes, shadows } from '@/config/theme';

interface EarningsCardProps {
  total: number;
  pending: number;
  paid: number;
}

export function EarningsCard({ total, pending, paid }: EarningsCardProps) {
  const { t } = useTranslation('worker');

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{t('earnings.total')}</Text>
      <MoneyDisplay amount={total} size="lg" style={styles.totalAmount} />
      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <View style={[styles.dot, { backgroundColor: titani.success }]} />
          <Text style={styles.breakdownLabel}>{t('earnings.paid')}</Text>
          <MoneyDisplay amount={paid} size="sm" style={styles.breakdownAmount} />
        </View>
        <View style={styles.breakdownItem}>
          <View style={[styles.dot, { backgroundColor: titani.warning }]} />
          <Text style={styles.breakdownLabel}>{t('earnings.pendingPayment')}</Text>
          <MoneyDisplay amount={pending} size="sm" style={styles.breakdownAmount} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    backgroundColor: titani.navy,
  },
  label: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing[1],
  },
  totalAmount: {
    color: '#FFFFFF',
  },
  breakdown: {
    marginTop: spacing[4],
    width: '100%',
    gap: spacing[2],
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  breakdownAmount: {
    color: 'rgba(255,255,255,0.85)',
  },
});
