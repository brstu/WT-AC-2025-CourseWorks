const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    if (json.status === 'ok' && json.data?.accessToken) {
      accessToken = json.data.accessToken;
      return accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      if (onUnauthorized) onUnauthorized();
      throw new Error('Session expired. Please login again.');
    }
  }

  const json = await res.json();

  if (json.status === 'error') {
    const err = new Error(json.error?.message || 'Unknown error') as Error & {
      code?: string;
      fields?: Record<string, string>;
    };
    err.code = json.error?.code;
    err.fields = json.error?.fields;
    throw err;
  }

  return json.data as T;
}
