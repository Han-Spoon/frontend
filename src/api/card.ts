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
