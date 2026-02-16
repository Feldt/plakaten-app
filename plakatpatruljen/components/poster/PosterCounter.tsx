import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { titani, spacing, fontSizes } from '@/config/theme';

interface PosterCounterProps {
  current: number;
  total: number;
}

export function PosterCounter({ current, total }: PosterCounterProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {current} / {total}
      </Text>
      <ProgressBar progress={progress} height={4} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 60,
  },
  text: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing[1],
  },
});
