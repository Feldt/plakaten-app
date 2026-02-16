export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoRegion extends Coordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONPolygon;
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface ReverseGeocodingResult {
  address: string;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  municipality: string | null;
}
