import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { titani } from '@/config/theme';
import type { Coordinates } from '@/types/geo';

interface PosterPinProps {
  coordinate: Coordinates;
}

function PosterPinInner({ coordinate }: PosterPinProps) {
  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.pin} />
    </Marker>
  );
}

export const PosterPin = memo(PosterPinInner);

const styles = StyleSheet.create({
  pin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: titani.success,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
