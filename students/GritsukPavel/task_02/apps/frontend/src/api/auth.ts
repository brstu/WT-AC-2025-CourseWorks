import { apiFetch, setAccessToken } from './client';
import type { AuthData, User } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthData> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, email, password }),
  });
  const json = await res.json();
  if (json.status === 'error') {
    const err = new Error(json.error?.message || 'Registration failed') as Error & {
      fields?: Record<string, string>;
    };
    err.fields = json.error?.fields;
    throw err;
  }
  setAccessToken(json.data.accessToken);
  return json.data as AuthData;
}

export async function login(email: string, password: string): Promise<AuthData> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (json.status === 'error') {
    const err = new Error(json.error?.message || 'Login failed') as Error & {
      fields?: Record<string, string>;
    };
    err.fields = json.error?.fields;
    throw err;
  }
  setAccessToken(json.data.accessToken);
  return json.data as AuthData;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // ignore
  }
  setAccessToken(null);
}

export async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    const json = await res.json();
    if (json.status === 'ok' && json.data?.accessToken) {
      setAccessToken(json.data.accessToken);
      return json.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getMe(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>('/users/me');
}
