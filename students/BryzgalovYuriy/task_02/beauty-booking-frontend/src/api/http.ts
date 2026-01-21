import { getToken } from '../app/authStore';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!API_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_API_URL is not set. Add it to .env (e.g. http://127.0.0.1:8080)');
}

type ApiErrorBody = {
  error?: { message?: string; status?: number };
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export async function api<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: unknown;
    auth?: boolean; // default true
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const base = API_URL ?? '';
  const url = joinUrl(base, path);

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  const useAuth = options.auth !== false;
  if (useAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as ApiErrorBody;
      msg = data?.error?.message ?? data?.message ?? msg;
    } catch {
      // ignore json parse
      const text = await res.text().catch(() => '');
      if (text) msg = text;
    }
    throw new ApiError(res.status, msg);
  }

  // на случай 204
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
