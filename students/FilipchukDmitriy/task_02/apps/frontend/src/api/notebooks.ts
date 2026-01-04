import { api } from './client';
import type { ApiResponse, Notebook, NotebookWithNotes, NotebookCreateInput, NotebookUpdateInput } from '../types';

interface NotebooksQuery {
  limit?: number;
  offset?: number;
  shared?: boolean;
  ownerId?: string;
}

export const notebooksApi = {
  list: (query: NotebooksQuery = {}): Promise<ApiResponse<Notebook[]>> => {
    const params = new URLSearchParams();
    if (query.limit !== undefined) params.append('limit', String(query.limit));
    if (query.offset !== undefined) params.append('offset', String(query.offset));
    if (query.shared !== undefined) params.append('shared', String(query.shared));
    if (query.ownerId) params.append('ownerId', query.ownerId);
    const qs = params.toString();
    return api.get(`/notebooks${qs ? `?${qs}` : ''}`);
  },

  get: (id: string): Promise<ApiResponse<NotebookWithNotes>> =>
    api.get(`/notebooks/${id}`),

  create: (data: NotebookCreateInput): Promise<ApiResponse<Notebook>> =>
    api.post('/notebooks', data),

  update: (id: string, data: NotebookUpdateInput): Promise<ApiResponse<Notebook>> =>
    api.put(`/notebooks/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/notebooks/${id}`),
};
