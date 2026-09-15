import { useEffect, useMemo, useRef, useState } from 'react';
import { createTranslator, type Language } from '../../locales';
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
  onCenterChange,
  fitStores = true,
  className = 'h-56 w-full overflow-hidden rounded-2xl',
}: {
  language: Language;
  stores: MapStore[];
  /** 보통 사용자의 현재 위치. 없으면 첫 후보에 맞춘다. */
  center?: { lat: number; lng: number };
  selectedId?: string | null;
  onSelect?: (store: MapStore) => void;
  /** 사용자가 지도를 옮긴 뒤의 중심 좌표. 프로그램에 의한 이동에는 호출하지 않는다. */
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  /** false이면 후보가 바뀌어도 사용자가 보고 있는 지도 영역을 유지한다. */
  fitStores?: boolean;
  className?: string;
}) {
  const t = createTranslator(language);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const listenersRef = useRef<unknown[]>([]);
  const mapListenersRef = useRef<unknown[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // 지도 라벨 언어는 앱 언어가 아니라 사용자 설정(기본 한국어)을 따른다.
  // 설정이 바뀌면 SDK 를 다시 받아야 하므로 지도도 새로 만든다.
  const mapLanguage = useMapLanguage();

  // 콜백은 ref 로 넘겨 마커 재생성 없이 최신 값을 쓴다.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onCenterChangeRef = useRef(onCenterChange);
  onCenterChangeRef.current = onCenterChange;

  const clearMarkers = () => {
    // 인증 실패 시 SDK가 내부 객체를 먼저 폐기할 수 있다. 각 객체는 한 번만 정리한다.
    const listeners = listenersRef.current.splice(0);
    const markers = markersRef.current.splice(0);
    listeners.forEach((listener) => {
      try { window.naver?.maps?.Event?.removeListener(listener); } catch { /* SDK already disposed */ }
    });
    markers.forEach((marker) => {
      try { marker.setMap(null); } catch { /* SDK already disposed */ }
    });
  };

  const disposeMap = () => {
    clearMarkers();
    mapListenersRef.current.splice(0).forEach((listener) => {
      try { window.naver?.maps?.Event?.removeListener(listener); } catch { /* SDK already disposed */ }
    });
    const map = mapRef.current;
    mapRef.current = null;
    try { map?.destroy(); } catch { /* Authentication failure can invalidate the map. */ }
  };

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    // 키/도메인 문제는 스크립트 로드 성공 후에 드러난다. 별도 훅으로 받아 폴백으로 전환한다.
    const offAuthFailure = onNaverMapsAuthFailure(() => {
      if (!cancelled) {
        disposeMap();
        setStatus('error');
      }
    });

    loadNaverMaps(mapLanguage)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const map = new naver.maps.Map(containerRef.current, {
          center: new naver.maps.LatLng(center?.lat ?? 37.5665, center?.lng ?? 126.978),
          zoom: 17,
          logoControl: true,
          mapDataControl: false,
          scaleControl: false,
          zoomControl: false,
        });
        mapRef.current = map;
        mapListenersRef.current.push(
          naver.maps.Event.addListener(map, 'dragend', () => {
            const nextCenter = map.getCenter();
            onCenterChangeRef.current?.({ lat: nextCenter.lat(), lng: nextCenter.lng() });
          }),
        );
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      offAuthFailure();
      disposeMap();
    };
    // 지도 생성 시 중심 좌표만 사용한다. 이후 변경은 아래 effect에서 필요한 경우에만 반영한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLanguage]);

  // 현재 위치로 돌아가기처럼 호출부가 명시적으로 중심을 바꿀 때만 지도를 이동한다.
  // 사용자의 dragend가 전달한 좌표는 이미 지도 중심과 같으므로 재이동하지 않는다.
  useEffect(() => {
    const map = mapRef.current;
    if (status !== 'ready' || !map || !center) return;
    const current = map.getCenter();
    if (
      Math.abs(current.lat() - center.lat) > 0.000001 ||
      Math.abs(current.lng() - center.lng) > 0.000001
    ) {
      map.setCenter(new naver.maps.LatLng(center.lat, center.lng));
    }
  }, [center?.lat, center?.lng, status]);

  // 후보가 바뀌면 마커를 다시 그린다.
  const storeKey = useMemo(() => stores.map((s) => s.id).join('|'), [stores]);

  useEffect(() => {
    const map = mapRef.current;
    if (status !== 'ready' || !map) return;

    clearMarkers();
    try {
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

      if (fitStores) {
        if (center) bounds.extend(new naver.maps.LatLng(center.lat, center.lng));
        if (stores.length > 0) map.fitBounds(bounds, 48);
        else if (center) { map.setCenter(new naver.maps.LatLng(center.lat, center.lng)); map.setZoom(15); }
      }
    } catch {
      disposeMap();
      setStatus('error');
    }
  }, [fitStores, storeKey, selectedId, status, center, stores]);

  // key 를 달아 에러/지도 전환 시 DOM 을 새로 만든다.
  // 같은 div 를 재사용하면 네이버가 컨테이너에 직접 주입한 노드(에러 화면·타일)가 남아 겹친다.
  if (status === 'error') {
    return (
      <div
        key="store-map-error"
        role="status"
        className={`${className} flex items-center justify-center bg-surface-subtle px-4 text-center text-xs text-text-secondary`}
      >
        {t(
          '지도를 불러오지 못했어요. 아래 목록에서 찾아주세요.',
          'Map unavailable — pick from the list below.',
          'تعذر تحميل الخريطة. اختر من القائمة أدناه.',
        )}
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
