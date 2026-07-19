const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gymhub_access_token');
}

export function getAccessToken() {
  return getToken();
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('gymhub_access_token', accessToken);
  localStorage.setItem('gymhub_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('gymhub_access_token');
  localStorage.removeItem('gymhub_refresh_token');
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      (data.code as string) ?? 'ERROR',
      (Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message) ?? 'Request failed',
    );
  }
  return data as T;
}

export { API_URL };
