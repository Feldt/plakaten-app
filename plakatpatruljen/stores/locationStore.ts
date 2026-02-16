import { create } from 'zustand';
import type { Coordinates, GeoRegion } from '@/types/geo';

interface LocationState {
  currentLocation: Coordinates | null;
  mapRegion: GeoRegion;
  isTracking: boolean;
  permissionGranted: boolean;
  error: string | null;
  setCurrentLocation: (location: Coordinates | null) => void;
  setMapRegion: (region: GeoRegion) => void;
  setTracking: (isTracking: boolean) => void;
  setPermissionGranted: (granted: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  mapRegion: {
    latitude: 55.6761,
    longitude: 12.5683,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  isTracking: false,
  permissionGranted: false,
  error: null,
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setMapRegion: (mapRegion) => set({ mapRegion }),
  setTracking: (isTracking) => set({ isTracking }),
  setPermissionGranted: (permissionGranted) => set({ permissionGranted }),
  setError: (error) => set({ error }),
}));
