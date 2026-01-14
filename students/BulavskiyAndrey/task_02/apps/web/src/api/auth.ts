import type { AuthResponse, LoginDto, RegisterDto, User } from "../types";
import { apiRequest, setAccessToken, API_BASE_URL } from "./client";

type ApiOk<T> = { status: "ok"; data: T };

// Предотвращаем параллельные refresh запросы
let isRefreshing = false;
let refreshPromise: Promise<AuthResponse | null> | null = null;

export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error?.message || "Ошибка регистрации");
    }

    const result: ApiOk<AuthResponse> = await response.json();
    setAccessToken(result.data.accessToken);
    return result.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error?.message || "Неверный email или пароль");
    }

    const result: ApiOk<AuthResponse> = await response.json();
    setAccessToken(result.data.accessToken);
    return result.data;
  },

  refresh: async (): Promise<AuthResponse | null> => {
    // Если уже идёт refresh, возвращаем существующий промис
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async (): Promise<AuthResponse | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          setAccessToken(null);
          return null;
        }

        const result: ApiOk<AuthResponse> = await response.json();
        setAccessToken(result.data.accessToken);
        return result.data;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
    }
  },
};

