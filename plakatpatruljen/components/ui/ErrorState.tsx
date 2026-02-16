import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { titani, spacing, fontSizes } from '@/config/theme';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ message, onRetry, retryLabel = 'Prøv igen' }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button title={retryLabel} onPress={onRetry} variant="outline" size="sm" />
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
  icon: {
    fontSize: 40,
    color: titani.error,
    marginBottom: spacing[3],
    fontWeight: '700',
  },
  message: {
    fontSize: fontSizes.base,
    color: titani.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
});
