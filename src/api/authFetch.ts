import { clearAuthData, getAccessToken, refreshAccessToken } from './auth';

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const accessToken = getAccessToken();

  const headers = new Headers(init.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  // accessToken 만료가 아니면 그대로 반환
  if (response.status !== 401) {
    return response;
  }

  try {
    const refreshed = await refreshAccessToken();

    const retryHeaders = new Headers(init.headers);
    retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);

    return await fetch(input, {
      ...init,
      headers: retryHeaders,
      credentials: 'include',
    });
  } catch (error) {
    clearAuthData();
    throw error;
  }
}