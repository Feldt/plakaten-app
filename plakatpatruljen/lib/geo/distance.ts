import turfDistance from '@turf/distance';
import { point } from '@turf/turf';
import type { Coordinates } from '@/types/geo';

export function distanceBetween(
  from: Coordinates,
  to: Coordinates,
  unit: 'kilometers' | 'meters' = 'meters',
): number {
  const fromPt = point([from.longitude, from.latitude]);
  const toPt = point([to.longitude, to.latitude]);
  const km = turfDistance(fromPt, toPt, { units: 'kilometers' });
  return unit === 'meters' ? km * 1000 : km;
}

export function isWithinRadius(
  from: Coordinates,
  to: Coordinates,
  radiusMeters: number,
): boolean {
  return distanceBetween(from, to, 'meters') <= radiusMeters;
}
