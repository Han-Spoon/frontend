export type LanguageCode = 'ko' | 'en' | 'ar';

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  languageCode: LanguageCode;
}

export interface AuthData {
  accessToken: string;
  refreshToken?: string;
  hasProfile?: boolean;
  user?: AuthUser;
}

export function saveAuthData(data: AuthData) {
  localStorage.setItem('accessToken', data.accessToken);

  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
}

export function clearAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export async function googleLogin(idToken: string): Promise<AuthData> {
  const response = await fetch('/api/v1/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('Google login failed:', response.status, responseText);
    throw new Error(`Google 로그인 실패: ${response.status}`);
  }

  const json = responseText ? JSON.parse(responseText) : {};
  const data = json.data ?? json;

  saveAuthData(data);

  return data;
}

// 백엔드가 refresh 토큰을 회전(rotate)시키므로, 동시에 여러 요청이 401을 만나
// 각각 refresh를 호출하면 두 번째부터 무효 토큰으로 실패해 세션이 깨진다.
// 진행 중인 refresh가 있으면 그 Promise를 공유한다(single-flight).
let inFlightRefresh: Promise<AuthData> | null = null;

async function doRefresh(): Promise<AuthData> {
  const refreshToken = getRefreshToken();

  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',

    // refreshToken을 HttpOnly Cookie로 쓰는 경우에는 body 없이도 동작 가능
    // localStorage 방식이면 body로 전달
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('Token refresh failed:', response.status, responseText);
    clearAuthData();
    throw new Error(`토큰 재발급 실패: ${response.status}`);
  }

  const json = responseText ? JSON.parse(responseText) : {};
  const data = json.data ?? json;

  saveAuthData(data);

  return data;
}

export function refreshAccessToken(): Promise<AuthData> {
  if (!inFlightRefresh) {
    inFlightRefresh = doRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

export async function logout() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: 'include',
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
  });

  const responseText = await response.text();

  // 로그아웃은 서버 요청 실패 여부와 무관하게 프론트 토큰은 제거하는 게 안전함
  clearAuthData();

  if (!response.ok) {
    console.error('Logout failed:', response.status, responseText);
    throw new Error(`로그아웃 요청 실패: ${response.status}`);
  }
}