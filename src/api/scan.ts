import { authFetch } from './authFetch';
import { ApiError } from './user';
import type { MenuAnalysis } from '../app/App';

export type ScanStatus =
  | 'pending'
  | 'processing'
  | 'analyzing'
  | 'completed'
  | 'complete'
  | 'done'
  | 'succeeded'
  | 'failed'
  | 'needs_retake';
export type NormalizedScanStatus = 'processing' | 'completed' | 'failed' | 'needs_retake' | 'unknown';

export interface FinalMessage {
  ko: string;
  en?: string | null;
  ar?: string | null;
}

export interface OwnerCard {
  menuName?: string | null;
  /** 애매함 플래그 (예: has_unclear_jeotgal) */
  flag?: string | null;
  question?: unknown;
}

/** 백엔드 스캔 결과의 메뉴 1건 (MenuResult). */
export interface MenuResult {
  displayOrder?: number | null;
  menuNameKo: string;
  menuNameEn?: string | null;
  priceText?: string | null;
  isSpicy?: boolean | null;
  riskLevel: 'safe' | 'caution' | 'danger';
  hits?: string[] | null;
  message?: FinalMessage | null;
  ownerCard?: OwnerCard | null;
}

export interface ScanCreatedResponse {
  scanId: string;
  status: ScanStatus;
}

export interface ScanResultResponse {
  scanId: string;
  status: ScanStatus;
  title?: string | null;
  menuCount?: number | null;
  riskyMenuCount?: number | null;
  scannedAt?: string | null;
  menus?: MenuResult[] | null;
  retakeReasons?: string[] | null;
}

export interface ScanHistoryItem {
  scanId: string;
  title?: string | null;
  status: ScanStatus;
  menuCount?: number | null;
  riskyMenuCount?: number | null;
  scannedAt?: string | null;
}

export interface StartScanPayload {
  storageKey: string;
  source?: 'camera' | 'upload';
}

interface PageResponse<T> {
  items: T[];
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error('Scan API request failed:', response.status, text);
    throw new ApiError(response.status, text);
  }

  return (json.data ?? json) as T;
}

export async function startScan(payload: StartScanPayload): Promise<ScanCreatedResponse> {
  const response = await authFetch('/api/v1/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parse<ScanCreatedResponse>(response);
}

export async function getScanResult(scanId: string): Promise<ScanResultResponse> {
  const response = await authFetch(`/api/v1/scans/${scanId}`, { method: 'GET' });
  return parse<ScanResultResponse>(response);
}

export function normalizeScanStatus(status?: string | null): NormalizedScanStatus {
  const normalized = status?.trim().toLowerCase();

  if (normalized === 'completed' || normalized === 'complete' || normalized === 'done' || normalized === 'succeeded') {
    return 'completed';
  }

  if (normalized === 'needs_retake') {
    return 'needs_retake';
  }

  if (normalized === 'failed') {
    return 'failed';
  }

  if (normalized === 'pending' || normalized === 'processing' || normalized === 'analyzing') {
    return 'processing';
  }

  return 'unknown';
}

export async function getScanHistory(page = 0, size = 20): Promise<ScanHistoryItem[]> {
  const response = await authFetch(`/api/v1/scans?page=${page}&size=${size}`, { method: 'GET' });
  const data = await parse<PageResponse<ScanHistoryItem>>(response);
  return data.items ?? [];
}

export async function updateScanTitle(scanId: string, title: string): Promise<ScanHistoryItem> {
  const response = await authFetch(`/api/v1/scans/${scanId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return parse<ScanHistoryItem>(response);
}

export async function deleteScan(scanId: string): Promise<void> {
  const response = await authFetch(`/api/v1/scans/${scanId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
}

/** 백엔드 MenuResult → 프론트 MenuAnalysis 매핑. */
export function mapMenuResult(menu: MenuResult, index: number): MenuAnalysis {
  // danger 재료(hits: is_*)와 caution 의심재료(ownerCard.flag: has_unclear_*)를 합쳐
  // 위험/의심 재료 태그의 원천으로 보관(코드 그대로, 렌더 시 언어 변환).
  const flagFromOwnerCard = menu.ownerCard?.flag ? [menu.ownerCard.flag] : [];
  const tags = Array.from(new Set([...(menu.hits ?? []), ...flagFromOwnerCard]));
  const isAlcohol = tags.some((tag) => tag.toLowerCase().includes('alcohol'));

  return {
    id: String(menu.displayOrder ?? index),
    menuName: menu.menuNameKo,
    menuNameEn: menu.menuNameEn ?? menu.menuNameKo,
    menuNameAr: undefined,
    description: menu.message?.ko ?? '',
    descriptionEn: menu.message?.en ?? undefined,
    descriptionAr: menu.message?.ar ?? undefined,
    price: menu.priceText ?? undefined,
    riskLevel: menu.riskLevel,
    riskReasons: tags,
    riskReasonsEn: tags,
    riskReasonsAr: tags,
    isSpicy: Boolean(menu.isSpicy),
    is_spicy: Boolean(menu.isSpicy),
    isAlcohol,
    is_alcohol: isAlcohol,
  };
}
