import { useMemo } from 'react';
import { isPointInZone, findContainingZone } from '@/lib/geo/zoneCheck';
import type { Coordinates, GeoJSONPolygon } from '@/types/geo';

export function useZoneCheck(
  coordinates: Coordinates | null,
  zones: { geojson: GeoJSONPolygon }[],
) {
  const containingZone = useMemo(() => {
    if (!coordinates || zones.length === 0) return null;
    return findContainingZone(coordinates, zones);
  }, [coordinates, zones]);

  const isInAnyZone = useMemo(() => {
    return containingZone !== null;
  }, [containingZone]);

  return { containingZone, isInAnyZone };
}
