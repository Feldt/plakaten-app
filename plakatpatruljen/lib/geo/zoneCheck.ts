import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/turf';
import type { Coordinates, GeoJSONPolygon } from '@/types/geo';

export function isPointInZone(coords: Coordinates, zone: GeoJSONPolygon): boolean {
  const pt = point([coords.longitude, coords.latitude]);
  const poly = polygon(zone.coordinates);
  return booleanPointInPolygon(pt, poly);
}

export function findContainingZone<T extends { geojson: GeoJSONPolygon }>(
  coords: Coordinates,
  zones: T[],
): T | null {
  return zones.find((zone) => isPointInZone(coords, zone.geojson)) ?? null;
}
