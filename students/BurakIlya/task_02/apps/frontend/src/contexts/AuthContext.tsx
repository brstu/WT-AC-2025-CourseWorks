import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logout as apiLogout,
  refreshAccessToken,
  setAccessToken,
  setAccessTokenListener
} from "../lib/api";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshMe: () => Promise<void>;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setAccessTokenListener((nextToken) => {
      setTokenState(nextToken);
      if (!nextToken) {
        setUser(null);
      }
    });
    return () => setAccessTokenListener(null);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiLogin(email, password);
      setUser(resp.user);
      setAccessToken(resp.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiRegister({ email, username, password });
      setUser(resp.user);
      setAccessToken(resp.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await apiLogout();
    } catch (err) {
      // ignore logout errors to still clear local session
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const refreshMe = async () => {
    try {
      const resp = await getMe();
      setUser(resp.user);
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    }
  };

  const bootstrap = useCallback(async () => {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const resp = await getMe();
        setUser(resp.user);
      }
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const value: AuthContextValue = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
    refreshMe,
    initializing
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
