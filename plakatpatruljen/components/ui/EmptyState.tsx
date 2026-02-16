import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { titani, spacing, fontSizes } from '@/config/theme';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="outline" size="sm" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: titani.text,
    marginBottom: spacing[2],
    letterSpacing: -0.2,
  },
  message: {
    fontSize: fontSizes.sm,
    color: titani.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
});
