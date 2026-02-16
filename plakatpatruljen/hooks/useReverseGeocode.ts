import { useState, useEffect, useRef } from 'react';
import { reverseGeocode } from '@/lib/geo/geocoding';
import { useDebounce } from './useDebounce';
import type { Coordinates, ReverseGeocodingResult } from '@/types/geo';

export function useReverseGeocode(coordinates: Coordinates | null, delay = 2000) {
  const [result, setResult] = useState<ReverseGeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cache = useRef<{ key: string; value: ReverseGeocodingResult } | null>(null);

  const debouncedCoords = useDebounce(coordinates, delay);

  useEffect(() => {
    if (!debouncedCoords) return;

    const key = `${debouncedCoords.latitude.toFixed(4)},${debouncedCoords.longitude.toFixed(4)}`;
    if (cache.current?.key === key) {
      setResult(cache.current.value);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    reverseGeocode(debouncedCoords).then((res) => {
      if (cancelled) return;
      if (res) {
        cache.current = { key, value: res };
        setResult(res);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedCoords]);

  return { address: result, isLoading };
}
