import React from 'react';
import { Text, StyleSheet, type TextStyle } from 'react-native';
import { formatDKK } from '@/lib/formatters/currency';
import { titani } from '@/config/theme';

interface MoneyDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  style?: TextStyle;
}

export function MoneyDisplay({ amount, size = 'md', style }: MoneyDisplayProps) {
  return (
    <Text style={[styles.base, styles[size], style]}>
      {formatDKK(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: titani.text,
  },
  sm: {
    fontSize: 14,
    fontWeight: '500',
  },
  md: {
    fontSize: 18,
    fontWeight: '600',
  },
  lg: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
});
