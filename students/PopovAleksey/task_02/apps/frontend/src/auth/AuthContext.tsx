import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiClient } from "../api/client";
import { createAuthApi } from "../api/auth";
import type { User } from "../types";

export type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  client: ApiClient;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tokenRef = useRef<string | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateToken = useCallback((token: string | null) => {
    tokenRef.current = token;
    setAccessTokenState(token);
  }, []);

  const handleSoftLogout = useCallback(() => {
    updateToken(null);
    setUser(null);
  }, [updateToken]);

  const client = useMemo(
    () =>
      new ApiClient({
        getAccessToken: () => tokenRef.current,
        setAccessToken: updateToken,
        onLogout: handleSoftLogout
      }),
    [handleSoftLogout, updateToken]
  );

  const authApi = useMemo(() => createAuthApi(client), [client]);

  useEffect(() => {
    (async () => {
      try {
        const refreshed = await client.request<{ accessToken: string }>("/auth/refresh", {
          method: "POST",
          retry: false
        });
        if (refreshed?.accessToken) {
          updateToken(refreshed.accessToken);
          const me = await authApi.me();
          setUser(me.user);
        }
      } catch (err) {
        handleSoftLogout();
      } finally {
        setLoading(false);
      }
    })();
  }, [authApi, client, handleSoftLogout, updateToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      updateToken(res.accessToken);
      setUser(res.user);
    },
    [authApi, updateToken]
  );

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const res = await authApi.register(email, username, password);
      updateToken(res.accessToken);
      setUser(res.user);
    },
    [authApi, updateToken]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // ignore
    }
    handleSoftLogout();
  }, [authApi, handleSoftLogout]);

  const value = useMemo(
    () => ({ user, accessToken, loading, login, register, logout, client }),
    [accessToken, client, loading, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
