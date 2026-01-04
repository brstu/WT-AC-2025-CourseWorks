import { fetchDirect } from './client';
import { config } from '../config';
import type { ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  login: (username: string, password: string): Promise<ApiResponse<AuthResponse>> =>
    fetchDirect('/auth/login', {
      method: 'POST',
      body: { username, password },
    }),

  register: (username: string, password: string): Promise<ApiResponse<AuthResponse>> =>
    fetchDirect('/auth/register', {
      method: 'POST',
      body: { username, password },
    }),

  refresh: (): Promise<ApiResponse<{ accessToken: string }>> =>
    fetchDirect('/auth/refresh', { method: 'POST' }),

  logout: (): Promise<ApiResponse<void>> =>
    fetchDirect('/auth/logout', { method: 'POST' }),

  getMe: async (token: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${config.apiUrl}/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    return response.json();
  },
};
