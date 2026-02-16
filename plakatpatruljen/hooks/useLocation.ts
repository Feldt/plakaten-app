import { useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '@/stores/locationStore';
import type { Coordinates } from '@/types/geo';

interface WatchOptions {
  accuracy?: Location.Accuracy;
  distanceInterval?: number;
  timeInterval?: number;
}

export function useLocation() {
  const {
    currentLocation,
    permissionGranted,
    isTracking,
    error,
    setCurrentLocation,
    setPermissionGranted,
    setTracking,
    setError,
  } = useLocationStore();

  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      if (!granted) {
        setError('Placeringstilladelse er påkrævet');
      }
      return granted;
    } catch (e) {
      setError('Kunne ikke anmode om placeringstilladelse');
      return false;
    }
  }, [setPermissionGranted, setError]);

  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return null;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);
      return coords;
    } catch (e) {
      setError('Kunne ikke hente placering');
      return null;
    }
  }, [permissionGranted, requestPermission, setCurrentLocation, setError]);

  const watchPosition = useCallback(
    async (options: WatchOptions = {}) => {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      // Remove existing subscription
      if (watchRef.current) {
        watchRef.current.remove();
      }

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy ?? Location.Accuracy.Balanced,
          distanceInterval: options.distanceInterval ?? 50,
          timeInterval: options.timeInterval ?? 5000,
        },
        (location) => {
          const coords: Coordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(coords);
        },
      );
      setTracking(true);
    },
    [permissionGranted, requestPermission, setCurrentLocation, setTracking],
  );

  const stopWatching = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
    setTracking(false);
  }, [setTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, []);

  return {
    currentLocation,
    permissionGranted,
    isTracking,
    error,
    requestPermission,
    getCurrentLocation,
    watchPosition,
    stopWatching,
  };
}
