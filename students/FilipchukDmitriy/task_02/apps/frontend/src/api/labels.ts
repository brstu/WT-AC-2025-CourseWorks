import { api } from './client';
import type { ApiResponse, Label, LabelCreateInput, LabelUpdateInput } from '../types';

interface LabelsQuery {
  limit?: number;
  offset?: number;
  ownerId?: string;
}

export const labelsApi = {
  list: (query: LabelsQuery = {}): Promise<ApiResponse<Label[]>> => {
    const params = new URLSearchParams();
    if (query.limit !== undefined) params.append('limit', String(query.limit));
    if (query.offset !== undefined) params.append('offset', String(query.offset));
    if (query.ownerId) params.append('ownerId', query.ownerId);
    const qs = params.toString();
    return api.get(`/labels${qs ? `?${qs}` : ''}`);
  },

  create: (data: LabelCreateInput): Promise<ApiResponse<Label>> =>
    api.post('/labels', data),

  update: (id: string, data: LabelUpdateInput): Promise<ApiResponse<Label>> =>
    api.put(`/labels/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/labels/${id}`),
};
