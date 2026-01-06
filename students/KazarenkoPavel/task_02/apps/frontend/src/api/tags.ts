import { apiClient, extractData } from './client';
import { Tag, CreateTagInput, UpdateTagInput } from '../types';

export const tagsApi = {
  async list(): Promise<Tag[]> {
    const response = await apiClient.get('/tags');
    return extractData(response);
  },

  async create(data: CreateTagInput): Promise<Tag> {
    const response = await apiClient.post('/tags', data);
    return extractData(response);
  },

  async update(id: string, data: UpdateTagInput): Promise<Tag> {
    const response = await apiClient.put(`/tags/${id}`, data);
    return extractData(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  },
};
