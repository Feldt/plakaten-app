import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { titani } from '@/config/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: titani.badge.draft,
  success: titani.badge.active,
  warning: titani.badge.pending,
  error: titani.badge.error,
  info: titani.badge.inProgress,
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const colorSet = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colorSet.bg, borderColor: colorSet.border }]}>
      <Text style={[styles.text, { color: colorSet.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
