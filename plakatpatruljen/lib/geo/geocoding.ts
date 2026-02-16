import type { Coordinates, ReverseGeocodingResult } from '@/types/geo';

export async function reverseGeocode(
  coords: Coordinates,
): Promise<ReverseGeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1&accept-language=da`,
    );
    const data = await response.json();
    if (!data?.address) return null;
    return {
      address: data.display_name ?? '',
      street: data.address.road ?? null,
      city: data.address.city ?? data.address.town ?? data.address.village ?? null,
      postalCode: data.address.postcode ?? null,
      municipality: data.address.municipality ?? data.address.county ?? null,
    };
  } catch {
    return null;
  }
}
