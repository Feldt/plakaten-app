import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { titani } from '@/config/theme';
import type { Coordinates } from '@/types/geo';

interface WorkerPositionMarkerProps {
  coordinate: Coordinates;
}

function WorkerPositionMarkerInner({ coordinate }: WorkerPositionMarkerProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.8, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.container}>
        <Animated.View style={[styles.pulse, pulseStyle]} />
        <View style={styles.dot} />
      </View>
    </Marker>
  );
}

export const WorkerPositionMarker = memo(WorkerPositionMarkerInner);

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A6FA5',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: titani.navy,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
});
