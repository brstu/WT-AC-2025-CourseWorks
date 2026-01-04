import { config } from '../config';
import type { ApiResponse } from '../types';

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

let getAccessToken: () => string | null = () => null;
let refreshAccessToken: () => Promise<string | null> = async () => null;
let onUnauthorized: () => void = () => {};

export function setAuthHelpers(helpers: {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onUnauthorized: () => void;
}) {
  getAccessToken = helpers.getAccessToken;
  refreshAccessToken = helpers.refreshAccessToken;
  onUnauthorized = helpers.onUnauthorized;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retry = true
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;

  const token = getAccessToken();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // For refresh token cookie
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return { status: 'ok' } as ApiResponse<T>;
    }

    const data = await response.json();

    // Handle 401 - try to refresh token once
    if (response.status === 401 && retry) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return request<T>(endpoint, options, false);
      } else {
        onUnauthorized();
        return { status: 'error', error: 'Session expired. Please login again.', code: 'unauthorized' };
      }
    }

    if (!response.ok) {
      return {
        status: 'error',
        error: data.error || 'Request failed',
        code: data.code,
        details: data.details,
      };
    }

    return data;
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Network error',
      code: 'network_error',
    };
  }
}

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', headers }),

  post: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'POST', body, headers }),

  put: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'PUT', body, headers }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(endpoint, { method: 'DELETE', headers }),
};

// Direct fetch without auth interceptor (for auth endpoints)
export async function fetchDirect<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {} } = options;

  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (response.status === 204) {
      return { status: 'ok' } as ApiResponse<T>;
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        error: data.error || 'Request failed',
        code: data.code,
        details: data.details,
      };
    }

    return data;
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Network error',
      code: 'network_error',
    };
  }
}
