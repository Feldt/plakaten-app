import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { titani, spacing, fontSizes } from '@/config/theme';

interface WorkerStatsCardProps {
  postersHung: number;
  postersRemoved: number;
  campaigns: number;
}

export function WorkerStatsCard({ postersHung, postersRemoved, campaigns }: WorkerStatsCardProps) {
  const { t } = useTranslation('worker');

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Ionicons name="arrow-up-circle-outline" size={24} color={titani.navy} />
          <Text style={styles.value}>{postersHung}</Text>
          <Text style={styles.label}>{t('earnings.postersHung')}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="arrow-down-circle-outline" size={24} color="#ECC94B" />
          <Text style={styles.value}>{postersRemoved}</Text>
          <Text style={styles.label}>{t('earnings.postersRemoved')}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="flag-outline" size={24} color={titani.success} />
          <Text style={styles.value}>{campaigns}</Text>
          <Text style={styles.label}>{t('earnings.campaigns')}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  value: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: titani.text,
  },
  label: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    textAlign: 'center',
  },
});
