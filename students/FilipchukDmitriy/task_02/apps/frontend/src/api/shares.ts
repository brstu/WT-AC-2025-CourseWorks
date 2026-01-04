import { api } from './client';
import type { ApiResponse, Share, ShareCreateInput, ShareUpdateInput } from '../types';

interface SharesQuery {
  notebookId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}

export const sharesApi = {
  list: (query: SharesQuery = {}): Promise<ApiResponse<Share[]>> => {
    const params = new URLSearchParams();
    if (query.notebookId) params.append('notebookId', query.notebookId);
    if (query.userId) params.append('userId', query.userId);
    if (query.limit !== undefined) params.append('limit', String(query.limit));
    if (query.offset !== undefined) params.append('offset', String(query.offset));
    const qs = params.toString();
    return api.get(`/shares${qs ? `?${qs}` : ''}`);
  },

  create: (data: ShareCreateInput): Promise<ApiResponse<Share>> =>
    api.post('/shares', data),

  update: (id: string, data: ShareUpdateInput): Promise<ApiResponse<Share>> =>
    api.put(`/shares/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/shares/${id}`),
};
