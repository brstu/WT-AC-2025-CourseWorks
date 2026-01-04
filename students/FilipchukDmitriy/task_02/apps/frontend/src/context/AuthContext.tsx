import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Prevent multiple simultaneous refresh calls
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const response = await authApi.refresh();
        if (response.status === 'ok' && response.data) {
          setAccessToken(response.data.accessToken);
          return response.data.accessToken;
        }
        return null;
      } catch {
        setUser(null);
        setAccessToken(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  // Try to refresh token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await refreshAccessToken();
        if (token) {
          // Fetch user info
          const userResponse = await authApi.getMe(token);
          if (userResponse.status === 'ok' && userResponse.data) {
            setUser(userResponse.data);
          }
        }
      } catch {
        // Ignore errors on initial load
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [refreshAccessToken]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    if (response.status === 'ok' && response.data) {
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
    } else {
      throw new Error(response.error || 'Login failed');
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const response = await authApi.register(username, password);
    if (response.status === 'ok' && response.data) {
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    setAccessToken,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
