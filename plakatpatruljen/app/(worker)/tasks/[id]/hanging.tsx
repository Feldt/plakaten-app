import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useHangingSession } from '@/hooks/useHangingSession';
import { usePosterUpload } from '@/hooks/usePosterUpload';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { usePosterLogs } from '@/hooks/usePosterLogs';
import { getTaskClaims } from '@/lib/supabase/queries/tasks';
import { formatDKK } from '@/lib/formatters/currency';

import { CampaignZoneOverlay } from '@/components/maps/CampaignZoneOverlay';
import { WorkerPositionMarker } from '@/components/maps/WorkerPositionMarker';
import { PosterPin } from '@/components/maps/PosterPin';
import { ZoneWarningBanner } from '@/components/maps/ZoneWarningBanner';
import { TimeWarningBanner } from '@/components/maps/TimeWarningBanner';
import { PosterLogFlow } from '@/components/poster/PosterLogFlow';
import { PosterCounter } from '@/components/poster/PosterCounter';
import { UploadQueue } from '@/components/poster/UploadQueue';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { RulesModal } from '@/components/rules/RulesModal';

import { MAP_DEFAULTS } from '@/config/constants';
import { titani, spacing, fontSizes, borderRadius, shadows } from '@/config/theme';
import type { TaskClaim } from '@/types/task';
import type { Coordinates, GeoJSONPolygon } from '@/types/geo';
import type { ElectionType } from '@/types/rules';

export default function HangingSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');
  const mapRef = useRef<MapView>(null);

  const [task, setTask] = useState<TaskClaim | null>(null);
  const [postersCompleted, setPostersCompleted] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [posterCoords, setPosterCoords] = useState<Coordinates[]>([]);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState('0:00');
  const [showRules, setShowRules] = useState(false);

  // Load task
  useEffect(() => {
    (async () => {
      const result = await getTaskClaims({});
      if (result.success) {
        const tasks = result.data.data as unknown as TaskClaim[];
        const found = tasks.find((t) => t.id === id);
        if (found) {
          setTask(found);
          setPostersCompleted(found.posters_completed);
          setEarnings(found.earnings);
        }
      }
    })();
  }, [id]);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Load existing poster log coords
  const { logs } = usePosterLogs(id);
  useEffect(() => {
    if (logs.length > 0) {
      const coords = logs.map((l) => ({
        latitude: l.latitude,
        longitude: l.longitude,
      }));
      setPosterCoords(coords);
    }
  }, [logs]);

  // Extract zone info
  const campaign = task?.campaign;
  const zone = task?.zone;
  const zoneGeojson: GeoJSONPolygon | null = zone?.geojson ?? null;
  const electionType: ElectionType = campaign?.election_type ?? 'kommunal';
  const electionDate = campaign?.election_date ? new Date(campaign.election_date) : new Date();
  const pricePerPoster = campaign?.price_per_poster_hang ?? 0;

  // Hanging session (GPS + zone/time checks)
  const {
    isInZone,
    isWithinTime,
    currentLocation,
    startTracking,
    stopTracking,
  } = useHangingSession({ zoneGeojson, electionType, electionDate });

  // Start tracking on mount
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  // Center map on first location
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Reverse geocode
  const { address } = useReverseGeocode(currentLocation);

  // Upload
  const { captureAndUpload, isUploading } = usePosterUpload();
  const { pendingCount, isRetrying } = useOfflineQueue();

  const handleLogPoster = useCallback(async () => {
    if (!task) return;

    const result = await captureAndUpload(
      {
        taskClaimId: task.id,
        campaignId: task.campaign_id,
        workerId: task.worker_id,
        currentCount: postersCompleted,
        targetCount: task.poster_count,
        pricePerPoster,
      },
      currentLocation,
      address?.address ?? null,
      isInZone,
      isWithinTime,
    );

    if (result.success) {
      if (!result.offline && result.coords) {
        setPosterCoords((prev) => [...prev, result.coords!]);
        setPostersCompleted(result.newCount!);
        setEarnings(result.newEarnings!);

        if (result.isComplete) {
          Alert.alert(t('hanging.congratulations'), t('hanging.totalEarned', { amount: formatDKK(result.newEarnings!) }), [
            {
              text: t('hanging.backToTasks'),
              onPress: () => router.back(),
            },
          ]);
        }
      } else if (result.offline) {
        // Still increment local count optimistically
        setPostersCompleted((p) => p + 1);
        setEarnings((e) => e + pricePerPoster);
      }
    }
  }, [task, postersCompleted, pricePerPoster, currentLocation, address, isInZone, isWithinTime, captureAndUpload, t, router]);

  const handleExit = useCallback(() => {
    Alert.alert(t('hanging.exitConfirm'), t('hanging.exitMessage'), [
      { text: tCommon('actions.cancel'), style: 'cancel' },
      {
        text: t('hanging.exit'),
        style: 'destructive',
        onPress: () => {
          stopTracking();
          router.back();
        },
      },
    ]);
  }, [t, tCommon, stopTracking, router]);

  const targetCount = task?.poster_count ?? 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={MAP_DEFAULTS}
          showsUserLocation={false}
          showsCompass={false}
        >
          {currentLocation && <WorkerPositionMarker coordinate={currentLocation} />}
          {zoneGeojson && (
            <CampaignZoneOverlay
              zone={zoneGeojson}
              color={titani.navy}
              selected
            />
          )}
          {posterCoords.map((coord, i) => (
            <PosterPin key={`pin-${i}`} coordinate={coord} />
          ))}
        </MapView>

        {/* Frosted glass top bar */}
        <View style={styles.topBar}>
          <IconButton
            name="arrow-back"
            onPress={handleExit}
            size={20}
            color={titani.text}
          />
          <Text style={styles.topTitle} numberOfLines={1}>
            {campaign?.title ?? ''}
          </Text>
          <PosterCounter current={postersCompleted} total={targetCount} />
        </View>

        {/* Warning banners */}
        <View style={styles.warnings}>
          <ZoneWarningBanner visible={!isInZone} />
          <TimeWarningBanner visible={!isWithinTime} />
        </View>

        {/* Bottom area */}
        <View style={styles.bottomArea}>
          {pendingCount > 0 && (
            <View style={styles.uploadQueue}>
              <UploadQueue pendingCount={pendingCount} isRetrying={isRetrying} />
            </View>
          )}

          <View style={styles.fabRow}>
            <IconButton
              name="help-circle-outline"
              onPress={() => setShowRules(true)}
              size={24}
              color={titani.textSecondary}
              backgroundColor="#FFFFFF"
              style={styles.rulesButton}
            />
            <PosterLogFlow onPress={handleLogPoster} isUploading={isUploading} />
            <View style={styles.fabSpacer} />
          </View>

          {address?.address && (
            <Text style={styles.addressText} numberOfLines={1}>
              {address.street ?? address.address}
            </Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDKK(earnings)}</Text>
              <Text style={styles.statLabel}>{tCommon('navigation.earnings')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{elapsed}</Text>
              <Text style={styles.statLabel}>{t('hanging.timeElapsed')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{postersCompleted} stk.</Text>
              <Text style={styles.statLabel}>{t('hanging.remaining')}</Text>
            </View>
          </View>
        </View>
      </View>

      <RulesModal
        visible={showRules}
        onComplete={() => setShowRules(false)}
        onClose={() => setShowRules(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 20,
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: 20,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topTitle: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: titani.text,
    textAlign: 'center',
    marginHorizontal: spacing[2],
  },
  warnings: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 76,
    left: 0,
    right: 0,
    gap: spacing[2],
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: spacing[4],
    alignItems: 'center',
  },
  uploadQueue: {
    marginBottom: spacing[3],
  },
  fabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
    gap: spacing[4],
  },
  rulesButton: {
    ...shadows.titanium,
  },
  fabSpacer: {
    width: 40,
  },
  addressText: {
    fontSize: fontSizes.xs,
    color: titani.textSecondary,
    marginBottom: spacing[3],
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: titani.card.radius,
    borderWidth: 1,
    borderColor: titani.card.border,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    width: '100%',
    ...shadows.titanium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: titani.input.border,
    marginVertical: spacing[0.5],
  },
  statValue: {
    fontSize: fontSizes.base,
    fontWeight: '700',
    color: titani.text,
  },
  statLabel: {
    fontSize: 11,
    color: titani.textSecondary,
    marginTop: spacing[0.5],
  },
});
