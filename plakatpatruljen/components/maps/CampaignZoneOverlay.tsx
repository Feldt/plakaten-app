import React, { memo } from 'react';
import { Polygon } from 'react-native-maps';
import type { GeoJSONPolygon } from '@/types/geo';

interface CampaignZoneOverlayProps {
  zone: GeoJSONPolygon;
  color: string;
  selected?: boolean;
  onPress?: () => void;
}

function CampaignZoneOverlayInner({ zone, color, selected, onPress }: CampaignZoneOverlayProps) {
  const coordinates = zone.coordinates[0].map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return (
    <Polygon
      coordinates={coordinates}
      fillColor={selected ? `${color}40` : `${color}20`}
      strokeColor={color}
      strokeWidth={selected ? 3 : 1.5}
      tappable={!!onPress}
      onPress={onPress}
    />
  );
}

export const CampaignZoneOverlay = memo(CampaignZoneOverlayInner);
