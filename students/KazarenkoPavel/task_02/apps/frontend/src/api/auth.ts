import { apiClient, extractData } from './client';
import { AuthResponse, User } from '../types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return extractData(response);
  },

  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return extractData(response);
  },

  async refresh(): Promise<{ accessToken: string }> {
    const response = await apiClient.post('/auth/refresh');
    return extractData(response);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/users/me');
    return extractData(response);
  },
};
