import { useCallback, useEffect, useState } from 'react';
import { findStoreCandidates, type StoreCandidate } from '../../api/store';

export type StoreLocationStatus = 'loading' | 'ready' | 'denied' | 'unsupported';

const SEARCH_DEBOUNCE_MS = 350;
const LOCATION_CACHE_MS = 5 * 60 * 1000;

export function useStoreCandidates(query: string, enabled = true) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<StoreLocationStatus>('loading');
  const [candidates, setCandidates] = useState<StoreCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [locationAttempt, setLocationAttempt] = useState(0);

  const retryLocation = useCallback(() => {
    setLocation(null);
    setLocationStatus('loading');
    setLocationAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (cancelled) return;
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus('ready');
      },
      () => {
        if (!cancelled) setLocationStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: LOCATION_CACHE_MS },
    );
    return () => { cancelled = true; };
  }, [enabled, locationAttempt]);

  useEffect(() => {
    if (!enabled || !location) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(false);
      try {
        const items = await findStoreCandidates({
          ...location,
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
  }, [enabled, location, query]);

  return { candidates, error, isLoading, location, locationStatus, retryLocation };
}
