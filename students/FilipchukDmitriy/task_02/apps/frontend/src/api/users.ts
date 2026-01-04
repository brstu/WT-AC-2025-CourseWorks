import { api } from './client';
import type { ApiResponse, UserFull, UserCreateInput, UserUpdateInput } from '../types';

interface UsersQuery {
  limit?: number;
  offset?: number;
}

export const usersApi = {
  list: (query: UsersQuery = {}): Promise<ApiResponse<UserFull[]>> => {
    const params = new URLSearchParams();
    if (query.limit !== undefined) params.append('limit', String(query.limit));
    if (query.offset !== undefined) params.append('offset', String(query.offset));
    const qs = params.toString();
    return api.get(`/users${qs ? `?${qs}` : ''}`);
  },

  get: (id: string): Promise<ApiResponse<UserFull>> =>
    api.get(`/users/${id}`),

  create: (data: UserCreateInput): Promise<ApiResponse<UserFull>> =>
    api.post('/users', data),

  update: (id: string, data: UserUpdateInput): Promise<ApiResponse<UserFull>> =>
    api.put(`/users/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/users/${id}`),
};
