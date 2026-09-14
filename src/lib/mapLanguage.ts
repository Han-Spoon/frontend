import { useSyncExternalStore } from 'react';

/**
 * 지도 라벨 언어. 앱 언어와 **독립된 표시 설정**이다.
 *
 * 분리한 이유:
 *  - 네이버 지도 v3 는 ko/en/zh/ja 4개만 지원한다. 앱은 7개(ar·es 포함)라 1:1 대응이 안 된다.
 *  - 지도는 한국 도로명·지명을 읽는 화면이라, 앱 언어와 무관하게 한국어가 기본이 나은 경우가 많다.
 *  - 백엔드 프로필(languageCode)에 저장하지 않는다. 기기별 표시 취향이라 localStorage 로 충분하다.
 */

export const MAP_LANGUAGES = ['ko', 'en', 'zh', 'ja'] as const;
export type MapLanguage = (typeof MAP_LANGUAGES)[number];

/** 기본값은 한국어. */
export const MAP_LANGUAGE_DEFAULT: MapLanguage = 'ko';

/** 라벨은 해당 언어 원어로 둔다 — 앱 언어를 몰라도 무엇을 고르는지 알 수 있다. */
export const MAP_LANGUAGE_OPTIONS: Array<{ value: MapLanguage; label: string }> = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
];

const STORAGE_KEY = 'han-spoon-map-language';

function isMapLanguage(value: unknown): value is MapLanguage {
  return typeof value === 'string' && (MAP_LANGUAGES as readonly string[]).includes(value);
}

const listeners = new Set<() => void>();
let snapshot: MapLanguage | null = null;

function read(): MapLanguage {
  if (snapshot !== null) return snapshot;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    snapshot = isMapLanguage(saved) ? saved : MAP_LANGUAGE_DEFAULT;
  } catch {
    // 시크릿 모드 등에서 접근이 막힐 수 있다. 기본값으로 동작시킨다.
    snapshot = MAP_LANGUAGE_DEFAULT;
  }
  return snapshot;
}

export function setMapLanguage(value: MapLanguage) {
  if (read() === value) return;
  snapshot = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* 저장 실패해도 이번 세션에는 적용된다 */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 설정 화면과 지도가 같은 값을 보도록 외부 스토어로 구독한다(prop drilling 불필요). */
export function useMapLanguage(): MapLanguage {
  return useSyncExternalStore(subscribe, read, () => MAP_LANGUAGE_DEFAULT);
}
