import type { Coordinates, GeoBounds, GeoRegion } from '@/types/geo';
import { DENMARK_BOUNDS } from '@/config/constants';

export function isWithinDenmark(coords: Coordinates): boolean {
  return (
    coords.latitude >= DENMARK_BOUNDS.south &&
    coords.latitude <= DENMARK_BOUNDS.north &&
    coords.longitude >= DENMARK_BOUNDS.west &&
    coords.longitude <= DENMARK_BOUNDS.east
  );
}

export function boundsToRegion(bounds: GeoBounds): GeoRegion {
  return {
    latitude: (bounds.north + bounds.south) / 2,
    longitude: (bounds.east + bounds.west) / 2,
    latitudeDelta: bounds.north - bounds.south,
    longitudeDelta: bounds.east - bounds.west,
  };
}

export function regionToBounds(region: GeoRegion): GeoBounds {
  return {
    north: region.latitude + region.latitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    west: region.longitude - region.longitudeDelta / 2,
  };
}
