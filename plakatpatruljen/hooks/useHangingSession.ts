import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '@/stores/locationStore';
import { isPointInZone } from '@/lib/geo/zoneCheck';
import { isWithinHangingPeriod } from '@/lib/time/electionDates';
import type { Coordinates, GeoJSONPolygon } from '@/types/geo';
import type { ElectionType } from '@/types/rules';

interface HangingSessionConfig {
  zoneGeojson: GeoJSONPolygon | null;
  electionType: ElectionType;
  electionDate: Date;
}

interface HangingSessionState {
  isInZone: boolean;
  isWithinTime: boolean;
  currentLocation: Coordinates | null;
  isTracking: boolean;
}

export function useHangingSession(config: HangingSessionConfig) {
  const { zoneGeojson, electionType, electionDate } = config;
  const { setCurrentLocation } = useLocationStore();
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const [state, setState] = useState<HangingSessionState>({
    isInZone: true,
    isWithinTime: true,
    currentLocation: null,
    isTracking: false,
  });

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 5,
        timeInterval: 3000,
      },
      (location) => {
        const coords: Coordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(coords);

        const inZone = zoneGeojson ? isPointInZone(coords, zoneGeojson) : true;

        setState((prev) => ({
          ...prev,
          currentLocation: coords,
          isInZone: inZone,
          isTracking: true,
        }));
      },
    );

    setState((prev) => ({ ...prev, isTracking: true }));
  }, [zoneGeojson, setCurrentLocation]);

  const stopTracking = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  // Time check on mount + every 60s
  useEffect(() => {
    const check = () => {
      const withinTime = isWithinHangingPeriod(electionType, electionDate);
      setState((prev) => ({ ...prev, isWithinTime: withinTime }));
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [electionType, electionDate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
}
