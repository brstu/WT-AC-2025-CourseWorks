import { api } from './http';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function registerApi(body: { email: string; password: string; name?: string }) {
  return api<AuthResponse>('/auth/register', { method: 'POST', body, auth: false });
}

export function loginApi(body: { email: string; password: string }) {
  return api<AuthResponse>('/auth/login', { method: 'POST', body, auth: false });
}
