import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { titani, spacing, fontSizes } from '@/config/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, size = 'large', fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={titani.navy} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: spacing[3],
    fontSize: fontSizes.sm,
    color: titani.textSecondary,
  },
});
