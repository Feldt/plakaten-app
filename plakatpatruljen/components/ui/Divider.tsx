import React from 'react';
import { View, StyleSheet } from 'react-native';
import { titani, spacing } from '@/config/theme';

interface DividerProps {
  marginVertical?: number;
}

export function Divider({ marginVertical = spacing[3] }: DividerProps) {
  return <View style={[styles.divider, { marginVertical }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: titani.input.border,
  },
});
