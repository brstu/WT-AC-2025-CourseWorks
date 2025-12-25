import { ApiClient, jsonBody } from "./client";
import type { User } from "../types";

export type AuthResponse = { accessToken: string; user: User };

export function createAuthApi(client: ApiClient) {
  return {
    login: (email: string, password: string) =>
      client.request<AuthResponse>("/auth/login", { method: "POST", ...jsonBody({ email, password }) }),
    register: (email: string, username: string, password: string) =>
      client.request<AuthResponse>("/auth/register", { method: "POST", ...jsonBody({ email, username, password }) }),
    logout: () => client.request<void>("/auth/logout", { method: "POST" }),
    me: () => client.request<{ user: User }>("/users/me")
  };
}
