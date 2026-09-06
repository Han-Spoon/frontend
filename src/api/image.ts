// 메뉴명으로 참고 이미지를 찾는 선택 기능.
// 기본값 없음 — VITE_MENU_IMAGE_BASE_URL 이 없으면 조회 자체를 하지 않는다.
const MENU_IMAGE_BASE_URL = import.meta.env.VITE_MENU_IMAGE_BASE_URL ?? '';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

function joinImageUrl(fileName: string, ext: string) {
  const baseUrl = MENU_IMAGE_BASE_URL.replace(/\/$/, '');

  return `${baseUrl}/${encodeURIComponent(fileName)}.${ext}`;
}

function normalizeFileName(fileName: string) {
  return fileName.trim().normalize('NFD');
}

function isHangulSyllable(char: string) {
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

function getHangulSubstrings(value: string) {
  if (!Array.from(value).every(isHangulSyllable)) return [];

  const candidates: string[] = [];
  const chars = Array.from(value);

  // 긴 부분문자열부터(정확도 높은 순)
  for (let length = chars.length - 1; length >= 2; length -= 1) {
    for (let start = 0; start <= chars.length - length; start += 1) {
      candidates.push(chars.slice(start, start + length).join(''));
    }
  }

  return candidates;
}

/**
 * 후보를 정확도 순 2단계(tier)로 나눈다.
 * tier1: 정확한 이름/괄호 제거/공백 제거/토큰  (가장 가능성 높음)
 * tier2: 한글 부분문자열 fuzzy (tier1 실패 시에만 병렬 시도, 매칭 범위는 원본과 동일하게 전부)
 */
function getCandidateTiers(fileName: string): string[][] {
  const withoutParentheses = fileName.replace(/\s*[([].*?[)\]]\s*/g, ' ').trim();
  const withoutSpaces = withoutParentheses.replace(/\s+/g, '');
  const tokens = withoutParentheses.split(/\s+/).filter(Boolean);

  const dedupe = (arr: string[]) =>
    Array.from(new Set(arr.map(normalizeFileName))).filter((c) => c.length > 0);

  const tier1 = dedupe([fileName, withoutParentheses, withoutSpaces, ...tokens]);
  const tier1Set = new Set(tier1);
  // 한글 부분문자열 전부 유지(자르지 않음). tier1이 실패한 경우에만 병렬로 시도되므로 느려지지 않는다.
  const tier2 = dedupe(getHangulSubstrings(withoutSpaces)).filter((c) => !tier1Set.has(c));

  return [tier1, tier2];
}

/** 여러 URL을 동시에 로드 시도하고, 가장 먼저 성공하는 URL을 반환(전부 실패 시 null). */
function firstLoadableUrl(urls: string[]): Promise<string | null> {
  if (urls.length === 0) return Promise.resolve(null);

  return new Promise((resolve) => {
    let remaining = urls.length;
    let settled = false;

    urls.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        if (!settled) {
          settled = true;
          resolve(url);
        }
      };
      img.onerror = () => {
        remaining -= 1;
        if (remaining === 0 && !settled) resolve(null);
      };
      img.src = url;
    });
  });
}

// 같은 메뉴명 재조회를 막는 캐시(진행 중 Promise 공유 + 결과 캐시).
const lookupCache = new Map<string, Promise<string | null>>();

async function resolveMenuImage(key: string): Promise<string | null> {
  for (const tier of getCandidateTiers(key)) {
    const urls = tier.flatMap((name) => IMAGE_EXTENSIONS.map((ext) => joinImageUrl(name, ext)));
    const found = await firstLoadableUrl(urls);
    if (found) return found;
  }
  return null;
}

/**
 * 메뉴명으로 참고 메뉴 이미지를 찾는다. 미설정 시 항상 null.
 * - 후보 × 확장자를 tier별로 "병렬" 시도해 가장 먼저 로드되는 URL 채택(순차 대비 대폭 단축)
 * - 동일 메뉴명은 캐시로 1회만 조회
 */
export function findMenuImageByName(fileNameWithoutExt: string): Promise<string | null> {
  const key = fileNameWithoutExt.trim();
  if (!MENU_IMAGE_BASE_URL || !key) return Promise.resolve(null);

  const cached = lookupCache.get(key);
  if (cached) return cached;

  const promise = resolveMenuImage(key);
  lookupCache.set(key, promise);
  return promise;
}
