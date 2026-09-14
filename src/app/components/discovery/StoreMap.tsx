import { useEffect, useMemo, useRef, useState } from 'react';
import type { Language } from '../../locales';
import { loadNaverMaps, onNaverMapsAuthFailure } from '../../../lib/naverMap';
import { useMapLanguage } from '../../../lib/mapLanguage';

export interface MapStore {
  id: string;
  /** 호출부에서 이미 현지화한 표시용 이름 */
  name: string;
  lat: number;
  lng: number;
}

export function StoreMap({
  language,
  stores,
  center,
  selectedId,
  onSelect,
  className = 'h-56 w-full overflow-hidden rounded-2xl',
}: {
  language: Language;
  stores: MapStore[];
  /** 보통 사용자의 현재 위치. 없으면 첫 후보에 맞춘다. */
  center?: { lat: number; lng: number };
  selectedId?: string | null;
  onSelect?: (store: MapStore) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const listenersRef = useRef<unknown[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // 지도 라벨 언어는 앱 언어가 아니라 사용자 설정(기본 한국어)을 따른다.
  // 설정이 바뀌면 SDK 를 다시 받아야 하므로 지도도 새로 만든다.
  const mapLanguage = useMapLanguage();

  // 콜백은 ref 로 넘겨 마커 재생성 없이 최신 값을 쓴다.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    // 키/도메인 문제는 스크립트 로드 성공 후에 드러난다. 별도 훅으로 받아 폴백으로 전환한다.
    const offAuthFailure = onNaverMapsAuthFailure(() => {
      if (!cancelled) setStatus('error');
    });

    loadNaverMaps(mapLanguage)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new naver.maps.Map(containerRef.current, {
          center: new naver.maps.LatLng(center?.lat ?? 37.5665, center?.lng ?? 126.978),
          zoom: 17,
          logoControl: true,
          mapDataControl: false,
          scaleControl: false,
          zoomControl: false,
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      offAuthFailure();
      listenersRef.current.forEach((l) => naver?.maps?.Event?.removeListener(l));
      listenersRef.current = [];
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // center 는 최초 1회만 반영한다(사용자가 지도를 움직인 뒤 되돌아가지 않게).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLanguage]);

  // 후보가 바뀌면 마커를 다시 그린다.
  const storeKey = useMemo(() => stores.map((s) => s.id).join('|'), [stores]);

  useEffect(() => {
    const map = mapRef.current;
    if (status !== 'ready' || !map) return;

    listenersRef.current.forEach((l) => naver.maps.Event.removeListener(l));
    listenersRef.current = [];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new naver.maps.LatLngBounds();
    stores.forEach((store) => {
      const position = new naver.maps.LatLng(store.lat, store.lng);
      bounds.extend(position);
      const marker = new naver.maps.Marker({
        position,
        map,
        title: store.name,
        icon: { content: markerHtml(store.name, store.id === selectedId) },
      });
      listenersRef.current.push(
        naver.maps.Event.addListener(marker, 'click', () => onSelectRef.current?.(store)),
      );
      markersRef.current.push(marker);
    });

    if (center) bounds.extend(new naver.maps.LatLng(center.lat, center.lng));
    if (stores.length > 0) map.fitBounds(bounds, 48);
  }, [storeKey, selectedId, status, center, stores]);

  // key 를 달아 에러/지도 전환 시 DOM 을 새로 만든다.
  // 같은 div 를 재사용하면 네이버가 컨테이너에 직접 주입한 노드(에러 화면·타일)가 남아 겹친다.
  if (status === 'error') {
    return (
      <div
        key="store-map-error"
        role="status"
        className={`${className} flex items-center justify-center bg-surface-subtle px-4 text-center text-xs text-text-secondary`}
      >
        {language === 'ko' ? '지도를 불러오지 못했어요. 아래 목록에서 찾아주세요.' : 'Map unavailable — pick from the list below.'}
      </div>
    );
  }

  return <div key="store-map" ref={containerRef} className={className} aria-busy={status === 'loading'} />;
}

/** 마커 라벨은 우리 데이터라 사용자 언어로 그대로 렌더링한다(지도 라벨과 별개). */
function markerHtml(name: string, selected: boolean) {
  const safe = name.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const tone = selected ? 'background:#B45309;color:#fff' : 'background:#fff;color:#1F2937';
  return (
    `<div style="${tone};border:1px solid rgba(0,0,0,.12);border-radius:999px;` +
    `padding:4px 10px;font-size:12px;font-weight:600;white-space:nowrap;` +
    `box-shadow:0 1px 4px rgba(0,0,0,.18);transform:translate(-50%,-130%)">${safe}</div>`
  );
}
