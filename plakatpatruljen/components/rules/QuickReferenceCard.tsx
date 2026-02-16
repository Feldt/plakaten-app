import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { titani, spacing, fontSizes } from '@/config/theme';

const QUICK_RULES = [
  { icon: 'resize-outline' as const, key: 'height', value: '≥ 2,3m' },
  { icon: 'git-branch-outline' as const, key: 'intersection', value: '≥ 10m' },
  { icon: 'swap-horizontal-outline' as const, key: 'spacing', value: '≥ 50m' },
  { icon: 'car-outline' as const, key: 'motorway', value: '✗' },
  { icon: 'square-outline' as const, key: 'maxSize', value: '≤ 0,8m²' },
];

export function QuickReferenceCard() {
  const { t } = useTranslation('rules');

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{t('title')}</Text>
      {QUICK_RULES.map((rule) => (
        <View key={rule.key} style={styles.row}>
          <Ionicons name={rule.icon} size={18} color={titani.navy} />
          <Text style={styles.label}>{t(`rules.${camelCase(rule.key)}.title`)}</Text>
          <Text style={styles.value}>{rule.value}</Text>
        </View>
      ))}
    </Card>
  );
}

function camelCase(str: string): string {
  // Simplified mapping for rule keys
  const mapping: Record<string, string> = {
    height: 'heightMinimum',
    intersection: 'intersectionDistance',
    spacing: 'posterSpacing',
    motorway: 'motorwayProhibition',
    maxSize: 'maxSize',
  };
  return mapping[str] ?? str;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing[4],
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: titani.text,
    marginBottom: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: spacing[2],
  },
  label: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: titani.slate,
  },
  value: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: titani.text,
  },
});
