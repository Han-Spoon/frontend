import { useCallback, useEffect, useState } from 'react';
import { findStoreCandidates, type StoreCandidate } from '../../api/store';

export type StoreLocationStatus = 'loading' | 'ready' | 'denied' | 'unsupported';
export type StoreSearchOrigin = 'current-location' | 'map-center';

export interface StoreCoordinates {
  latitude: number;
  longitude: number;
}

interface StoreCandidateOptions {
  enabled?: boolean;
  initialSearchLocation?: StoreCoordinates;
  locateUser?: boolean;
}

const SEARCH_DEBOUNCE_MS = 350;
const LOCATION_CACHE_MS = 5 * 60 * 1000;

export function useStoreCandidates(
  query: string,
  {
    enabled = true,
    initialSearchLocation,
    locateUser = true,
  }: StoreCandidateOptions = {},
) {
  const [location, setLocation] = useState<StoreCoordinates | null>(null);
  const [searchLocation, setSearchLocation] = useState<StoreCoordinates | null>(
    initialSearchLocation ?? null,
  );
  const [searchOrigin, setSearchOrigin] = useState<StoreSearchOrigin>(
    initialSearchLocation ? 'map-center' : 'current-location',
  );
  const [locationStatus, setLocationStatus] = useState<StoreLocationStatus>(
    locateUser ? 'loading' : initialSearchLocation ? 'ready' : 'unsupported',
  );
  const [candidates, setCandidates] = useState<StoreCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [locationRequestPending, setLocationRequestPending] = useState(locateUser);

  const retryLocation = useCallback(() => {
    setLocation(null);
    setSearchLocation(null);
    setSearchOrigin('current-location');
    setLocationStatus('loading');
    setLocationRequestPending(true);
  }, []);

  const searchAt = useCallback((coordinates: StoreCoordinates) => {
    setCandidates([]);
    setError(false);
    setSearchLocation(coordinates);
    setSearchOrigin('map-center');
  }, []);

  const searchAtCurrentLocation = useCallback(() => {
    if (!location) {
      // 지역 좌표로 진입한 화면에서는 사용자가 요청할 때만 현재 위치를 조회한다.
      // 조회 실패 시 기존 지역 검색 결과는 유지한다.
      setLocationStatus('loading');
      setLocationRequestPending(true);
      return;
    }
    setCandidates([]);
    setError(false);
    setSearchLocation(location);
    setSearchOrigin('current-location');
  }, [location]);

  useEffect(() => {
    if (!enabled || !locationRequestPending) return;
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationRequestPending(false);
      return;
    }

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (cancelled) return;
        const currentLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setLocation(currentLocation);
        setSearchLocation(currentLocation);
        setSearchOrigin('current-location');
        setLocationStatus('ready');
        setLocationRequestPending(false);
      },
      () => {
        if (cancelled) return;
        setLocationStatus('denied');
        setLocationRequestPending(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: LOCATION_CACHE_MS },
    );
    return () => { cancelled = true; };
  }, [enabled, locationRequestPending]);

  useEffect(() => {
    if (!enabled || !searchLocation) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(false);
      try {
        const items = await findStoreCandidates({
          ...searchLocation,
          query: query.trim() || undefined,
          radiusMeters: 1000,
          limit: 20,
        }, controller.signal);
        setCandidates(items);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        console.error('Unable to load store candidates:', requestError);
        setCandidates([]);
        setError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, query.trim() ? SEARCH_DEBOUNCE_MS : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, query, searchLocation]);

  return {
    candidates,
    error,
    isLoading,
    location,
    locationStatus,
    retryLocation,
    searchAt,
    searchAtCurrentLocation,
    searchLocation,
    searchOrigin,
  };
}
