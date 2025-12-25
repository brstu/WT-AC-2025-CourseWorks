import type { ApiErrorShape } from "../types";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:3001";

type RequestInitExt = RequestInit & { retry?: boolean };

type ClientConfig = {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  onLogout: () => void;
};

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class ApiClient {
  private getAccessToken: ClientConfig["getAccessToken"];
  private setAccessToken: ClientConfig["setAccessToken"];
  private onLogout: ClientConfig["onLogout"];
  private refreshPromise: Promise<string | null> | null = null;

  constructor(config: ClientConfig) {
    this.getAccessToken = config.getAccessToken;
    this.setAccessToken = config.setAccessToken;
    this.onLogout = config.onLogout;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include"
        });
        if (!res.ok) {
          return null;
        }
        const data = (await res.json()) as { accessToken?: string };
        if (data.accessToken) {
          this.setAccessToken(data.accessToken);
          return data.accessToken;
        }
        return null;
      })().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private buildHeaders(init?: RequestInit): HeadersInit {
    const headers: Record<string, string> = {};
    if (init?.headers) {
      Object.entries(init.headers as Record<string, string>).forEach(([k, v]) => {
        headers[k] = v;
      });
    }
    const token = this.getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (!headers["Content-Type"] && init?.body && !(init.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch (err) {
      return text as unknown as T;
    }
  }

  private extractErrorMessage(payload: unknown): string {
    const p = payload as ApiErrorShape;
    return (
      (p?.message as string) ||
      (p as any)?.error ||
      (p as any)?.detail ||
      "Произошла ошибка"
    );
  }

  async request<T>(path: string, init?: RequestInitExt): Promise<T> {
    const headers = this.buildHeaders(init);
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include"
    });

    if (res.status === 401 && init?.retry !== false) {
      const newToken = await this.refreshAccessToken();
      if (!newToken) {
        this.onLogout();
        throw new Error("Сессия истекла, войдите снова");
      }
      return this.request<T>(path, { ...init, retry: false });
    }

    if (!res.ok) {
      const payload = await this.handleResponse<ApiErrorShape>(res);
      const msg = this.extractErrorMessage(payload);
      throw new Error(msg);
    }

    return this.handleResponse<T>(res);
  }
}

export function jsonBody(body: unknown): RequestInit {
  return { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } };
}

export { API_URL };
