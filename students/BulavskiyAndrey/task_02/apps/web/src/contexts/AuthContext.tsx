import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User, LoginDto, RegisterDto } from "../types";
import { authApi, setAccessToken, setOnAuthError } from "../api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Предотвращаем двойной вызов checkAuth в StrictMode
  const isCheckingAuth = useRef(false);
  const hasInitialized = useRef(false);

  const handleAuthError = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    // Устанавливаем коллбек для обработки ошибок авторизации
    setOnAuthError(handleAuthError);
  }, [handleAuthError]);

  const checkAuth = useCallback(async () => {
    // Предотвращаем параллельные вызовы
    if (isCheckingAuth.current) {
      return;
    }

    isCheckingAuth.current = true;

    try {
      setIsLoading(true);
      // Пробуем refresh токен (он в httpOnly cookie)
      const result = await authApi.refresh();
      if (result) {
        setUser(result.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
      isCheckingAuth.current = false;
    }
  }, []);

  useEffect(() => {
    // Проверяем auth только один раз при монтировании
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;
    checkAuth();
  }, [checkAuth]);

  const login = async (data: LoginDto) => {
    const result = await authApi.login(data);
    setUser(result.user);
  };

  const register = async (data: RegisterDto) => {
    const result = await authApi.register(data);
    setUser(result.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

