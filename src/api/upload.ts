import { authFetch } from './authFetch';
import { ApiError } from './user';

export interface UploadTicket {
  storageKey: string;
  uploadUrl: string;
  expiresAt: string;
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error('Upload ticket request failed:', response.status, text);
    throw new ApiError(response.status, text);
  }

  return (json.data ?? json) as T;
}

/** 백엔드에서 S3 presigned PUT 티켓을 발급받는다. (엔드포인트 경로는 /sas 로 유지) */
export async function getUploadTicket(contentType: string): Promise<UploadTicket> {
  const response = await authFetch('/api/v1/uploads/sas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType }),
  });
  return parse<UploadTicket>(response);
}

/**
 * 티켓 발급 → S3 presigned PUT 업로드 수행 후 storageKey 를 반환한다.
 */
export async function uploadImage(file: File): Promise<{ key: string }> {
  const ticket = await getUploadTicket(file.type);

  const putResponse = await fetch(ticket.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      'If-None-Match': '*',
    },
    body: file,
  });

  if (!putResponse.ok) {
    throw new Error(`S3 upload failed: ${putResponse.status}`);
  }

  return { key: ticket.storageKey };
}
