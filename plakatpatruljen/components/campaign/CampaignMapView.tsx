import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Polygon, Marker, Callout } from 'react-native-maps';
import { MAP_DEFAULTS } from '@/config/constants';
import { colors, spacing, fontSizes, borderRadius } from '@/config/theme';

interface CampaignMapViewProps {
  zones: Record<string, unknown>[];
  posterLogs: Record<string, unknown>[];
  pickupLocations: Record<string, unknown>[];
  onPosterPress?: (log: Record<string, unknown>) => void;
  style?: object;
}

function getPinColor(log: Record<string, unknown>): string {
  if (log.verified) return colors.success[500];
  if ((log.rule_violations as string[])?.length > 0) return colors.warning[500];
  return colors.neutral[400];
}

export function CampaignMapView({ zones, posterLogs, pickupLocations, onPosterPress, style }: CampaignMapViewProps) {
  const initialRegion = useMemo(() => {
    if (posterLogs.length > 0) {
      const first = posterLogs[0];
      return {
        latitude: first.latitude as number,
        longitude: first.longitude as number,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return MAP_DEFAULTS;
  }, [posterLogs]);

  return (
    <View style={[styles.container, style]}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {zones.map((zone, i) => {
          const geojson = zone.geojson as { coordinates: number[][][] } | undefined;
          if (!geojson?.coordinates?.[0]) return null;
          const coords = geojson.coordinates[0].map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }));
          return (
            <Polygon
              key={`zone-${i}`}
              coordinates={coords}
              fillColor="rgba(59,130,246,0.15)"
              strokeColor={colors.primary[500]}
              strokeWidth={2}
            />
          );
        })}
        {posterLogs.map((log, i) => (
          <Marker
            key={`log-${i}`}
            coordinate={{
              latitude: log.latitude as number,
              longitude: log.longitude as number,
            }}
            pinColor={getPinColor(log)}
            onPress={() => onPosterPress?.(log)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutText}>{(log.type as string) === 'hang' ? 'Ophængt' : 'Nedtaget'}</Text>
                {!!log.address && <Text style={styles.calloutAddress}>{log.address as string}</Text>}
              </View>
            </Callout>
          </Marker>
        ))}
        {pickupLocations.map((loc, i) => (
          <Marker
            key={`pickup-${i}`}
            coordinate={{
              latitude: loc.latitude as number,
              longitude: loc.longitude as number,
            }}
            pinColor={colors.primary[600]}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutText}>{loc.name as string}</Text>
                <Text style={styles.calloutAddress}>{loc.address as string}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  callout: { padding: spacing[1], minWidth: 120 },
  calloutText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.neutral[900] },
  calloutAddress: { fontSize: fontSizes.xs, color: colors.neutral[500], marginTop: 2 },
});
