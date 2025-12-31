import React, { createContext, useContext, useMemo, useState } from "react";
import { getAuth, logout } from "./auth";
import { setToken, apiRequest } from "./api";
import type { JwtPayload } from "./jwt";

type AuthState = {
  token: string | null;
  payload: JwtPayload | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => getAuth());

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      refresh() {
        setState(getAuth());
      },
      async login(email, password) {
        const res = await apiRequest<{ token: string }>("/auth/login", {
          method: "POST",
          body: { email, password },
          token: null,
        });
        setToken(res.data.token);
        setState(getAuth());
      },
      async register(email, password) {
        await apiRequest("/auth/register", {
          method: "POST",
          body: { email, password },
          token: null,
        });
      },
      logout() {
        logout();
        setState(getAuth());
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
