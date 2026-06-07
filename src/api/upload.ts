import { authFetch } from './authFetch';
import { ApiError } from './user';

export interface UploadTicket {
  storageKey: string;
  uploadUrl: string;
  readUrl: string;
  expiresAt: string;
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error('Upload SAS request failed:', response.status, text);
    throw new ApiError(response.status, text);
  }

  return (json.data ?? json) as T;
}

/** 백엔드에서 쓰기용 SAS 업로드 티켓을 발급받는다. */
export async function getUploadSas(contentType: string): Promise<UploadTicket> {
  const response = await authFetch('/api/v1/uploads/sas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType }),
  });
  return parse<UploadTicket>(response);
}

/**
 * 이미지를 SAS 발급 → PUT 업로드까지 수행하고 storageKey/readUrl을 반환한다.
 */
export async function uploadImage(file: File): Promise<{ key: string; url: string }> {
  const ticket = await getUploadSas(file.type);

  const putResponse = await fetch(ticket.uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!putResponse.ok) {
    throw new Error(`Blob upload failed: ${putResponse.status}`);
  }

  return { key: ticket.storageKey, url: ticket.readUrl };
}
