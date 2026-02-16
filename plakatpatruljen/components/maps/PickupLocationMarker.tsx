import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { titani } from '@/config/theme';
import type { PickupLocation } from '@/types/campaign';

interface PickupLocationMarkerProps {
  location: PickupLocation;
  onPress?: () => void;
}

function PickupLocationMarkerInner({ location, onPress }: PickupLocationMarkerProps) {
  return (
    <Marker
      coordinate={{ latitude: location.latitude, longitude: location.longitude }}
      title={location.name}
      description={location.address}
      onPress={onPress}
    >
      <View style={styles.marker}>
        <Ionicons name="flag" size={20} color={titani.navy} />
      </View>
    </Marker>
  );
}

export const PickupLocationMarker = memo(PickupLocationMarkerInner);

const styles = StyleSheet.create({
  marker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: titani.navy,
  },
});
