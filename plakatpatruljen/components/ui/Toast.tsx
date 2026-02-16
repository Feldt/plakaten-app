import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { titani, spacing, fontSizes, shadows } from '@/config/theme';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const toastColors = {
  success: { bg: titani.success, text: '#FFFFFF' },
  error: { bg: titani.error, text: '#FFFFFF' },
  info: { bg: titani.navy, text: '#FFFFFF' },
};

export function Toast({ message, type, visible, onHide, duration = 3000 }: ToastProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(duration),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => onHide());
    }
  }, [visible, duration, onHide, opacity]);

  if (!visible) return null;

  const colorSet = toastColors[type];
  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: colorSet.bg }]}>
      <Text style={[styles.text, { color: colorSet.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing[4],
    right: spacing[4],
    padding: spacing[4],
    borderRadius: 12,
    ...shadows.lg,
    zIndex: 1000,
  },
  text: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
});
