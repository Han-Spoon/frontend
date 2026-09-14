import type { MapLanguage } from './mapLanguage';

/**
 * 네이버 지도 v3 SDK 로더.
 *
 * v3 는 런타임 언어 변경 API 가 없다. 언어는 스크립트 URL 의 `language` 파라미터로만 정해지므로,
 * 언어가 바뀌면 스크립트를 내리고 `window.naver` 를 지운 뒤 다시 받아야 한다.
 * 어떤 언어를 쓸지는 사용자 설정(`mapLanguage`)이 정한다 — 앱 언어와 독립이다.
 */

const SCRIPT_ID = 'naver-maps-sdk';

let current: { language: MapLanguage; promise: Promise<void> } | null = null;

/**
 * 인증 실패 감지.
 *
 * 키가 틀리거나 Web 서비스 URL 이 등록되지 않으면 스크립트 자체는 200 으로 내려와 onload 가 정상 실행되고,
 * 네이버가 지도 컨테이너 안에 자기 에러 화면을 그린다. 즉 script.onerror 로는 잡히지 않는다.
 * v3 가 제공하는 전역 훅으로 받아서 호출부가 폴백 UI 를 띄울 수 있게 한다.
 */
const authFailureHandlers = new Set<() => void>();

export function onNaverMapsAuthFailure(handler: () => void): () => void {
  authFailureHandlers.add(handler);
  return () => {
    authFailureHandlers.delete(handler);
  };
}

(window as { navermap_authFailure?: () => void }).navermap_authFailure = () => {
  authFailureHandlers.forEach((handler) => handler());
};

function unload() {
  document.getElementById(SCRIPT_ID)?.remove();
  delete (window as { naver?: unknown }).naver;
  current = null;
}

export function loadNaverMaps(language: MapLanguage): Promise<void> {
  // 같은 언어로 이미 로드(또는 로드 중)면 그 Promise 를 재사용한다.
  // StrictMode 이중 마운트에서 스크립트가 두 번 붙지 않게 하는 역할도 겸한다.
  if (current?.language === language) return current.promise;
  if (current) unload();

  const keyId = import.meta.env.VITE_NAVER_MAP_KEY_ID;
  if (!keyId) {
    return Promise.reject(new Error('VITE_NAVER_MAP_KEY_ID 가 설정되지 않았습니다.'));
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    // 2024년 이후 형식. 구 파라미터(ncpClientId)는 더 이상 동작하지 않는다.
    script.src =
      'https://oapi.map.naver.com/openapi/v3/maps.js' +
      `?ncpKeyId=${encodeURIComponent(keyId)}&language=${language}`;
    script.onload = () => resolve();
    script.onerror = () => {
      unload();
      reject(new Error('네이버 지도 SDK 를 불러오지 못했습니다.'));
    };
    document.head.appendChild(script);
  });

  current = { language, promise };
  return promise;
}
