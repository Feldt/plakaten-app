import { isPointInZone, findContainingZone } from '@/lib/geo/zoneCheck';
import type { GeoJSONPolygon } from '@/types/geo';

// Copenhagen city center polygon (approximate)
const copenhagenZone: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [12.55, 55.66],
      [12.60, 55.66],
      [12.60, 55.69],
      [12.55, 55.69],
      [12.55, 55.66],
    ],
  ],
};

// Aarhus zone (approximate)
const aarhusZone: GeoJSONPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [10.19, 56.14],
      [10.22, 56.14],
      [10.22, 56.17],
      [10.19, 56.17],
      [10.19, 56.14],
    ],
  ],
};

describe('isPointInZone', () => {
  it('returns true for point inside Copenhagen zone', () => {
    const result = isPointInZone(
      { latitude: 55.676, longitude: 12.568 },
      copenhagenZone,
    );
    expect(result).toBe(true);
  });

  it('returns false for point outside Copenhagen zone', () => {
    const result = isPointInZone(
      { latitude: 55.70, longitude: 12.50 },
      copenhagenZone,
    );
    expect(result).toBe(false);
  });

  it('returns false for Aarhus point in Copenhagen zone', () => {
    const result = isPointInZone(
      { latitude: 56.15, longitude: 10.21 },
      copenhagenZone,
    );
    expect(result).toBe(false);
  });

  it('returns true for Aarhus point in Aarhus zone', () => {
    const result = isPointInZone(
      { latitude: 56.15, longitude: 10.21 },
      aarhusZone,
    );
    expect(result).toBe(true);
  });

  it('handles point on boundary edge', () => {
    // Points on boundary are implementation-defined by turf.js
    const result = isPointInZone(
      { latitude: 55.66, longitude: 12.55 },
      copenhagenZone,
    );
    // Just verify it doesn't throw
    expect(typeof result).toBe('boolean');
  });
});

describe('findContainingZone', () => {
  const zones = [
    { id: 'cph', name: 'Copenhagen', geojson: copenhagenZone },
    { id: 'aar', name: 'Aarhus', geojson: aarhusZone },
  ];

  it('finds Copenhagen zone for Copenhagen coordinates', () => {
    const result = findContainingZone(
      { latitude: 55.676, longitude: 12.568 },
      zones,
    );
    expect(result).not.toBeNull();
    expect(result?.id).toBe('cph');
    expect(result?.name).toBe('Copenhagen');
  });

  it('finds Aarhus zone for Aarhus coordinates', () => {
    const result = findContainingZone(
      { latitude: 56.15, longitude: 10.21 },
      zones,
    );
    expect(result).not.toBeNull();
    expect(result?.id).toBe('aar');
  });

  it('returns null for coordinates outside all zones', () => {
    const result = findContainingZone(
      { latitude: 57.0, longitude: 10.0 }, // Aalborg area
      zones,
    );
    expect(result).toBeNull();
  });

  it('returns null for empty zones array', () => {
    const result = findContainingZone(
      { latitude: 55.676, longitude: 12.568 },
      [],
    );
    expect(result).toBeNull();
  });
});
