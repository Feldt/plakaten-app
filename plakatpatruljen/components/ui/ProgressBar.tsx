import React from 'react';
import { View, StyleSheet } from 'react-native';
import { titani } from '@/config/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  color,
  height = 6,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const fillColor = color ?? titani.success;

  return (
    <View style={[styles.track, { height }]}>
      <View
        style={[
          styles.fill,
          { width: `${clampedProgress}%`, backgroundColor: fillColor, height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 3,
  },
});
