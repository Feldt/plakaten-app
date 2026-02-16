import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  ViewToken,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { useLocation } from '@/hooks/useLocation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/lib/auth/useAuth';
import { distanceBetween } from '@/lib/geo/distance';
import { formatDKK } from '@/lib/formatters/currency';
import { createTaskClaim } from '@/lib/supabase/queries/tasks';

import { CampaignZoneOverlay } from '@/components/maps/CampaignZoneOverlay';
import { WorkerPositionMarker } from '@/components/maps/WorkerPositionMarker';
import { CampaignMapCard } from '@/components/maps/CampaignMapCard';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

import { MAP_DEFAULTS } from '@/config/constants';
import { titani, spacing, fontSizes, borderRadius, shadows } from '@/config/theme';
import type { Campaign } from '@/types/campaign';
import type { CampaignId, ZoneId, WorkerId } from '@/types/database';

const ZONE_COLORS = ['#2563eb', '#16a34a', '#7c3aed', '#ea580c', '#0d9488', '#db2777'];

export default function WorkerHomeScreen() {
  const { t } = useTranslation('worker');
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const carouselRef = useRef<FlatList>(null);

  const {
    currentLocation,
    permissionGranted,
    requestPermission,
    getCurrentLocation,
    watchPosition,
    stopWatching,
  } = useLocation();
  const { campaigns, isLoading } = useCampaigns();

  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState<number | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [claimCount, setClaimCount] = useState(10);
  const [isClaiming, setIsClaiming] = useState(false);

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === 'active'),
    [campaigns],
  );

  // Init location
  useEffect(() => {
    (async () => {
      const granted = await requestPermission();
      if (granted) {
        const loc = await getCurrentLocation();
        if (loc && mapRef.current) {
          mapRef.current.animateToRegion({
            ...loc,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
        watchPosition({ distanceInterval: 50 });
      }
    })();
    return () => stopWatching();
  }, []);

  const campaignDistances = useMemo(() => {
    if (!currentLocation) return new Map<string, number>();
    const map = new Map<string, number>();
    activeCampaigns.forEach((c) => {
      const zones = c.zones ?? [];
      if (zones.length > 0 && zones[0]?.geojson?.coordinates?.[0]?.[0]) {
        const center = zones[0].geojson.coordinates[0][0];
        const dist = distanceBetween(currentLocation, {
          latitude: center[1],
          longitude: center[0],
        });
        map.set(c.id, dist);
      }
    });
    return map;
  }, [currentLocation, activeCampaigns]);

  const handleMyLocation = useCallback(async () => {
    const loc = await getCurrentLocation();
    if (loc && mapRef.current) {
      mapRef.current.animateToRegion({
        ...loc,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [getCurrentLocation]);

  const handleCardPress = useCallback(
    (campaign: Campaign) => {
      setSelectedCampaign(campaign);
      bottomSheetRef.current?.snapToIndex(0);
    },
    [],
  );

  const handleZonePress = useCallback(
    (index: number) => {
      setSelectedCampaignIndex(index);
      carouselRef.current?.scrollToIndex({ index, animated: true });
    },
    [],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const index = viewableItems[0].index ?? 0;
        setSelectedCampaignIndex(index);
        const campaign = activeCampaigns[index];
        if (!campaign) return;
        const zones = campaign.zones ?? [];
        if (zones.length > 0 && zones[0]?.geojson?.coordinates?.[0]?.[0] && mapRef.current) {
          const center = zones[0].geojson.coordinates[0][0];
          mapRef.current.animateToRegion({
            latitude: center[1],
            longitude: center[0],
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }, 500);
        }
      }
    },
    [activeCampaigns],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const handleClaim = useCallback(async () => {
    if (!selectedCampaign || !user?.workerId) return;
    setIsClaiming(true);

    const zones = selectedCampaign.zones ?? [];
    const zone = zones[0];

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const result = await createTaskClaim({
      campaign_id: selectedCampaign.id,
      zone_id: zone?.id ?? ('' as ZoneId),
      worker_id: user.workerId,
      type: 'hang',
      poster_count: claimCount,
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

    setIsClaiming(false);

    if (result.success) {
      Alert.alert(
        t('campaign.claimSuccess', { count: claimCount }),
        '',
        [
          { text: tCommon('actions.close'), style: 'cancel' },
          {
            text: t('campaign.goToTasks'),
            onPress: () => router.push('/(worker)/tasks'),
          },
        ],
      );
      bottomSheetRef.current?.close();
    }
  }, [selectedCampaign, user, claimCount, t, tCommon, router]);

  const snapPoints = useMemo(() => ['32%', '85%'], []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={MAP_DEFAULTS}
        showsUserLocation={false}
        showsCompass={false}
        mapPadding={{ top: 0, right: 0, bottom: 180, left: 0 }}
      >
        {currentLocation && <WorkerPositionMarker coordinate={currentLocation} />}

        {activeCampaigns.map((campaign, idx) => {
          const zones = campaign.zones ?? [];
          return zones.map((zone) => (
            <CampaignZoneOverlay
              key={zone.id}
              zone={zone.geojson}
              color={ZONE_COLORS[idx % ZONE_COLORS.length]}
              selected={selectedCampaignIndex === idx}
              onPress={() => handleZonePress(idx)}
            />
          ));
        })}
      </MapView>

      {/* Permission denied overlay */}
      {!permissionGranted && (
        <View style={styles.permissionOverlay}>
          <Text style={styles.permissionText}>{t('map.locationPermissionNeeded')}</Text>
          <Button
            title={t('map.openSettings')}
            onPress={() => Linking.openSettings()}
            size="sm"
          />
        </View>
      )}

      {/* Profile button */}
      <IconButton
        name="person-circle-outline"
        onPress={() => router.push('/(worker)/profile')}
        size={26}
        color={titani.navy}
        backgroundColor="#FFFFFF"
        style={styles.profileButton}
      />

      {/* My location button */}
      <IconButton
        name="locate"
        onPress={handleMyLocation}
        size={22}
        color={titani.navy}
        backgroundColor="#FFFFFF"
        style={styles.myLocationButton}
      />

      {/* Campaign carousel */}
      {activeCampaigns.length > 0 ? (
        <FlatList
          ref={carouselRef}
          data={activeCampaigns}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToAlignment="center"
          decelerationRate="fast"
          snapToInterval={296}
          contentContainerStyle={styles.carousel}
          style={styles.carouselContainer}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <CampaignMapCard
              campaign={item}
              distance={campaignDistances.get(item.id) ?? null}
              color={ZONE_COLORS[index % ZONE_COLORS.length]}
              onPress={() => handleCardPress(item)}
              isActive={selectedCampaignIndex === index}
            />
          )}
        />
      ) : !isLoading ? (
        <View style={styles.emptyCarousel}>
          <EmptyState title={t('map.noActiveCampaigns')} />
        </View>
      ) : null}

      {/* Campaign detail bottom sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {selectedCampaign && (
            <>
              <Text style={styles.sheetParty}>
                {selectedCampaign.organization?.party_name ?? ''}
              </Text>
              <Text style={styles.sheetTitle}>{selectedCampaign.title}</Text>

              <View style={styles.sheetRow}>
                <Badge
                  label={tCommon('status.active')}
                  variant="success"
                />
                <Text style={styles.sheetRate}>
                  {formatDKK(selectedCampaign.price_per_poster_hang)}/plakat
                </Text>
              </View>

              <Text style={styles.sheetAvailable}>
                {t('campaign.available', {
                  count: selectedCampaign.poster_count - selectedCampaign.posters_hung,
                })}
              </Text>

              {selectedCampaign.description && (
                <Text style={styles.sheetDescription}>
                  {selectedCampaign.description}
                </Text>
              )}

              {/* Earnings preview */}
              <View style={styles.earningsPreview}>
                <Text style={styles.earningsLabel}>{t('campaign.earningsPreview')}</Text>
                <View style={styles.earningsRow}>
                  <View style={styles.stepper}>
                    <Button
                      title="-"
                      onPress={() => setClaimCount(Math.max(5, claimCount - 5))}
                      variant="outline"
                      size="sm"
                      style={styles.stepperBtn}
                    />
                    <Text style={styles.stepperValue}>{claimCount}</Text>
                    <Button
                      title="+"
                      onPress={() =>
                        setClaimCount(
                          Math.min(
                            50,
                            selectedCampaign.poster_count - selectedCampaign.posters_hung,
                            claimCount + 5,
                          ),
                        )
                      }
                      variant="outline"
                      size="sm"
                      style={styles.stepperBtn}
                    />
                  </View>
                  <Text style={styles.earningsTotal}>
                    = {formatDKK(claimCount * selectedCampaign.price_per_poster_hang)}
                  </Text>
                </View>
              </View>

              <Button
                title={t('campaign.confirmClaim', { count: claimCount })}
                onPress={handleClaim}
                loading={isClaiming}
                fullWidth
                size="lg"
                style={styles.claimButton}
              />
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  permissionOverlay: {
    position: 'absolute',
    top: 60,
    left: spacing[4],
    right: spacing[4],
    backgroundColor: titani.badge.pending.bg,
    borderRadius: titani.card.radius,
    borderWidth: 1,
    borderColor: titani.badge.pending.border,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[3],
    ...shadows.titanium,
  },
  permissionText: {
    fontSize: fontSizes.sm,
    color: titani.text,
    textAlign: 'center',
  },
  profileButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: spacing[4],
    ...shadows.titanium,
  },
  myLocationButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: spacing[4],
    ...shadows.titanium,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
  },
  carousel: {
    paddingHorizontal: spacing[4],
  },
  emptyCarousel: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 90,
    left: spacing[4],
    right: spacing[4],
    backgroundColor: '#FFFFFF',
    borderRadius: titani.card.radius,
    borderWidth: 1,
    borderColor: titani.card.border,
    ...shadows.titanium,
  },
  sheetBg: {
    backgroundColor: titani.sheet.bg,
    borderRadius: titani.sheet.radius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  sheetHandle: {
    backgroundColor: titani.sheet.dragIndicator,
    width: 36,
    height: 4,
  },
  sheetContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[10],
  },
  sheetParty: {
    fontSize: 13,
    fontWeight: '600',
    color: titani.textSecondary,
    marginBottom: spacing[1],
  },
  sheetTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: titani.text,
    letterSpacing: -0.8,
    marginBottom: spacing[3],
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  sheetRate: {
    fontSize: fontSizes.base,
    fontWeight: '600',
    color: titani.success,
  },
  sheetAvailable: {
    fontSize: fontSizes.sm,
    color: titani.textSecondary,
    marginBottom: spacing[4],
  },
  sheetDescription: {
    fontSize: fontSizes.sm,
    color: titani.slate,
    lineHeight: 20,
    marginBottom: spacing[4],
  },
  earningsPreview: {
    backgroundColor: '#F8F9FB',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: titani.input.border,
  },
  earningsLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: titani.text,
    marginBottom: spacing[3],
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  stepperBtn: {
    width: 36,
    height: 36,
    paddingHorizontal: 0,
  },
  stepperValue: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: titani.text,
    minWidth: 32,
    textAlign: 'center',
  },
  earningsTotal: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: titani.success,
  },
  claimButton: {
    marginTop: spacing[2],
  },
});
