import { authFetch } from './authFetch';
import { ApiError } from './user';

export type StoreMatchMethod = 'gps_candidate' | 'name_search' | 'kakao_fallback';

export interface StoreCandidate {
  storeId: number;
  name: string;
  branchName?: string | null;
  roadAddress?: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  categoryCode?: string | null;
  categoryName?: string | null;
  verified: boolean;
  matchMethod: StoreMatchMethod;
}

export interface StoreSummary {
  storeId: number;
  name: string;
}

export interface StoreCandidateRequest {
  latitude: number;
  longitude: number;
  query?: string;
  radiusMeters?: number;
  limit?: number;
}

interface StoreCandidateResponse {
  items: StoreCandidate[];
}

export async function findStoreCandidates(
  payload: StoreCandidateRequest,
  signal?: AbortSignal,
): Promise<StoreCandidate[]> {
  const response = await authFetch('/api/v1/stores/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  const text = await response.text();

  if (!response.ok) {
    console.error('Store candidate request failed:', response.status, text);
    throw new ApiError(response.status, text);
  }

  const json = text ? JSON.parse(text) : {};
  const data = (json.data ?? json) as Partial<StoreCandidateResponse>;
  if (!Array.isArray(data.items)) {
    throw new Error('Invalid store candidate response.');
  }
  return data.items;
}
