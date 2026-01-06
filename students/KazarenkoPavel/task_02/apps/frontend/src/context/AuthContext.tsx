import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { authApi, setAccessToken, getAccessToken } from '../api';
import { extractError } from '../api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Попытка восстановить сессию при загрузке
  useEffect(() => {
    const initAuth = async () => {
      // Если есть токен в памяти, пробуем получить пользователя
      if (getAccessToken()) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          setAccessToken(null);
        }
      } else {
        // Пробуем refresh через cookie
        try {
          const { accessToken } = await authApi.refresh();
          setAccessToken(accessToken);
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          // Не авторизован
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Слушаем событие logout (когда refresh token недействителен)
    const handleLogout = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { accessToken, user: userData } = await authApi.login({ email, password });
      setAccessToken(accessToken);
      setUser(userData);
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setError(null);
    try {
      const { accessToken, user: userData } = await authApi.register({ username, email, password });
      setAccessToken(accessToken);
      setUser(userData);
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Игнорируем ошибки при logout
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
