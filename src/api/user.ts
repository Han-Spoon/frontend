import { authFetch } from './authFetch';

export interface CurrentUser {
  id: string;
  email: string;
  nickname?: string;
  languageCode?: string;
  hasProfile?: boolean;
}

export interface UpdateCurrentUserPayload {
  nickname?: string;
  languageCode?: 'ko' | 'en' | 'ar';
}

export interface UserProfilePayload {
  /** ISO 3166-1 alpha-2 (대문자, 예: "SA") */
  nationality: string;
  languageCode: 'ko' | 'en' | 'ar';
  isFirstTime: boolean;
  isVegan: boolean;
  /** VegetarianType 코드값 (vegan|lacto|ovo|lacto_ovo|pesco) — isVegan=false면 null */
  veganType?: string | null;
  hasReligion: boolean;
  /** ReligionType 코드값 (halal|kosher|hindu) — hasReligion=false면 null */
  religionType?: string | null;
  hasAllergies: boolean;
  /** AllergyCode 코드값 배열 (egg, milk, ...) */
  allergies?: string[];
  noSpicy: boolean;
  noAlcohol: boolean;
}

export class ApiError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`API 요청 실패: ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error('API request failed:', response.status, text);
    throw new ApiError(response.status, text);
  }

  return (json.data ?? json) as T;
}

export async function deleteMe(): Promise<void> {
  const response = await authFetch('/api/v1/users/me', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await parseResponse(response);
  }
}

export async function getMe(): Promise<CurrentUser> {
  const response = await authFetch('/api/v1/users/me', {
    method: 'GET',
  });

  return parseResponse<CurrentUser>(response);
}

export async function updateMe(payload: UpdateCurrentUserPayload): Promise<CurrentUser> {
  const response = await authFetch('/api/v1/users/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<CurrentUser>(response);
}

export async function createProfile(profile: UserProfilePayload): Promise<UserProfilePayload> {
  const response = await authFetch('/api/v1/users/me/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });

  return parseResponse<UserProfilePayload>(response);
}

export async function getProfile(): Promise<UserProfilePayload> {
  const response = await authFetch('/api/v1/users/me/profile', {
    method: 'GET',
  });

  return parseResponse<UserProfilePayload>(response);
}

export async function updateProfile(profile: UserProfilePayload): Promise<UserProfilePayload> {
  const response = await authFetch('/api/v1/users/me/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });

  return parseResponse<UserProfilePayload>(response);
}
