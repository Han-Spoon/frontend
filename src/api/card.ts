import { authFetch } from './authFetch';
import { ApiError } from './user';

export type CardType = 'order' | 'ingredient_check' | 'exclude';

export interface CardText {
  ko: string;
  en?: string | null;
  ar?: string | null;
}

export interface SavedCard {
  cardId: string;
  type: CardType;
  menuNameKo: string;
  text: CardText;
  createdAt: string;
}

export interface SaveCardRequest {
  type: CardType;
  menuNameKo: string;
  text: CardText;
  scanId?: string | null;
}

interface PageResponse<T> {
  items: T[];
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error('Card API request failed:', response.status, text);
    throw new ApiError(response.status, text);
  }

  return (json.data ?? json) as T;
}

export async function getSavedCards(): Promise<SavedCard[]> {
  const response = await authFetch('/api/v1/cards/saved', { method: 'GET' });
  const page = await parse<PageResponse<SavedCard>>(response);
  return page.items ?? [];
}

export async function saveCard(request: SaveCardRequest): Promise<SavedCard> {
  const response = await authFetch('/api/v1/cards/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return parse<SavedCard>(response);
}

export async function deleteCard(cardId: string): Promise<void> {
  const response = await authFetch(`/api/v1/cards/saved/${cardId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
}

/**
 * 신규 가입 시 기본으로 넣어주는 카드 3종.
 * 백엔드는 기본 카드를 자동 생성하지 않으므로 프론트에서 생성한다.
 * (DevDataSeeder의 표준 문장 기준)
 */
export const DEFAULT_CARDS: SaveCardRequest[] = [
  {
    type: 'order',
    menuNameKo: '삼겹살',
    text: { ko: '삼겹살 하나 주세요.', en: 'One pork belly, please.', ar: 'صحن سامغيوبسال من فضلك.' },
  },
  {
    type: 'ingredient_check',
    menuNameKo: '된장찌개',
    text: {
      ko: '이 메뉴에 멸치육수가 들어가나요?',
      en: 'Does this dish contain anchovy broth?',
      ar: 'هل يحتوي هذا الطبق على مرق الأنشوجة؟',
    },
  },
  {
    type: 'exclude',
    menuNameKo: '비빔밥',
    text: { ko: '계란 빼주세요.', en: 'No egg, please.', ar: 'بدون بيض، من فضلك.' },
  },
];

/** 기본 카드 3종을 순차 생성. 개별 실패는 무시(비차단). */
export async function createDefaultCards(): Promise<void> {
  for (const card of DEFAULT_CARDS) {
    try {
      await saveCard(card);
    } catch (error) {
      console.warn('Default card creation failed:', error);
    }
  }
}
