import { authFetch } from './authFetch';

export interface ScanCreatePayload {
  storageKey: string;
  source?: 'camera' | 'upload';
  mimeType?: string;
  fileSize?: number;
}

export interface ScanQuality {
  status: 'usable' | string;
}

export interface ScanMenuItem {
  id: string;
  image?: string | null;
  menuNameKo: string;
  menuName: string;
  menuNameEn?: string;
  menuNameAr?: string;
  description: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price?: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  riskReasons: string[];
  riskReasonsEn?: string[];
  riskReasonsAr?: string[];
  isSpicy: boolean;
  isAlcohol?: boolean;
}

export interface ScanResponseData {
  scanId: string;
  scanStatus: 'pending' | 'analyzing' | 'completed' | 'failed';
  scanQuality: ScanQuality;
  menuCount: number;
  dangerCount: number;
  menus: ScanMenuItem[];
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error('Scan API request failed:', response.status, text);
    throw new Error(`Scan request failed: ${response.status}`);
  }

  return (json.data ?? json) as T;
}

export async function createScan(payload: ScanCreatePayload): Promise<ScanResponseData> {
  const response = await authFetch('/api/v1/scans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<ScanResponseData>(response);
  return {
    scanId: data.scanId,
    scanStatus: data.scanStatus,
    scanQuality: data.scanQuality,
    menuCount: data.menuCount,
    dangerCount: data.dangerCount,
    menus: data.menus ?? [],
  };
}
