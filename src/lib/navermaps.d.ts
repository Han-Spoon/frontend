/**
 * 네이버 지도 v3 최소 타입 선언.
 * 전체 타입이 필요해지면 `pnpm add -D @types/navermaps` 로 교체할 것.
 */
declare namespace naver.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }
  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
  }
  class Point {
    constructor(x: number, y: number);
  }
  class Size {
    constructor(width: number, height: number);
  }
  interface MapOptions {
    center?: LatLng;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    scaleControl?: boolean;
    logoControl?: boolean;
    mapDataControl?: boolean;
    zoomControl?: boolean;
    draggable?: boolean;
  }
  class Map {
    constructor(element: string | HTMLElement, options?: MapOptions);
    setCenter(latlng: LatLng): void;
    setZoom(zoom: number): void;
    fitBounds(bounds: LatLngBounds, padding?: number | object): void;
    destroy(): void;
  }
  interface MarkerOptions {
    position: LatLng;
    map?: Map | null;
    title?: string;
    zIndex?: number;
    icon?: { content: string; anchor?: Point };
  }
  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setIcon(icon: { content: string; anchor?: Point }): void;
  }
  namespace Event {
    function addListener(target: object, type: string, handler: (...args: unknown[]) => void): unknown;
    function removeListener(listener: unknown): void;
  }
}
