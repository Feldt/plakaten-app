import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { titani, spacing, fontSizes } from '@/config/theme';

interface TimeWarningBannerProps {
  visible: boolean;
}

export function TimeWarningBanner({ visible }: TimeWarningBannerProps) {
  const { t } = useTranslation('task');
  const translateY = useSharedValue(-80);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : -80, { duration: 300 });
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.banner, animatedStyle]}>
      <Ionicons name="time" size={18} color="#B45309" />
      <Text style={styles.text}>{t('hanging.outsideTime')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: titani.badge.pending.bg,
    borderRadius: 12,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginHorizontal: spacing[4],
    gap: spacing[2],
  },
  text: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#B45309',
    flex: 1,
  },
});
