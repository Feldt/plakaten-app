import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { titani, spacing, shadows } from '@/config/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export function Card({ children, style, padding = 4 }: CardProps) {
  return (
    <View style={[styles.card, { padding: spacing[padding] }, style]}>
      <View style={styles.insetHighlight} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: titani.card.bgStart,
    borderRadius: titani.card.radius,
    borderWidth: 1,
    borderColor: titani.card.border,
    ...shadows.titanium,
  },
  insetHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: titani.card.insetHighlight,
    borderTopLeftRadius: titani.card.radius,
    borderTopRightRadius: titani.card.radius,
  },
});
