import { apiClient, extractData } from './client';
import { Session, CreateSessionInput, UpdateSessionInput, SessionQuery } from '../types';

export const sessionsApi = {
  async list(query?: SessionQuery): Promise<Session[]> {
    const params = new URLSearchParams();
    if (query?.taskId) params.set('taskId', query.taskId);
    if (query?.status) params.set('status', query.status);
    if (query?.from) params.set('from', query.from);
    if (query?.to) params.set('to', query.to);
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.offset) params.set('offset', String(query.offset));

    const response = await apiClient.get(`/sessions?${params.toString()}`);
    return extractData(response);
  },

  async create(data: CreateSessionInput): Promise<Session> {
    const response = await apiClient.post('/sessions', data);
    return extractData(response);
  },

  async update(id: string, data: UpdateSessionInput): Promise<Session> {
    const response = await apiClient.put(`/sessions/${id}`, data);
    return extractData(response);
  },

  async pause(id: string): Promise<Session> {
    const response = await apiClient.patch(`/sessions/${id}/pause`);
    return extractData(response);
  },

  async resume(id: string): Promise<Session> {
    const response = await apiClient.patch(`/sessions/${id}/resume`);
    return extractData(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/sessions/${id}`);
  },
};
