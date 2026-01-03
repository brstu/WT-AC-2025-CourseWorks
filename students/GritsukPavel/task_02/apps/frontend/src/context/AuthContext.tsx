import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import {
  setAccessToken,
  setOnUnauthorized,
  refreshToken,
  logout as apiLogout,
  getMe,
} from '../api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
  };

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
    });

    // Try to restore session via refresh token
    const init = async () => {
      try {
        const token = await refreshToken();
        if (token) {
          const { user } = await getMe();
          setUser(user);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
