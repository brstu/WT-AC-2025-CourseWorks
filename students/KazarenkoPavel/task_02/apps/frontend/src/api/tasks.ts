import { apiClient, extractData } from './client';
import { Task, CreateTaskInput, UpdateTaskInput, TaskQuery } from '../types';

export const tasksApi = {
  async list(query?: TaskQuery): Promise<Task[]> {
    const params = new URLSearchParams();
    if (query?.status) params.set('status', query.status);
    if (query?.priority) params.set('priority', query.priority);
    if (query?.tag) params.set('tag', query.tag);
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.offset) params.set('offset', String(query.offset));

    const response = await apiClient.get(`/tasks?${params.toString()}`);
    return extractData(response);
  },

  async get(id: string): Promise<Task> {
    const response = await apiClient.get(`/tasks/${id}`);
    return extractData(response);
  },

  async create(data: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post('/tasks', data);
    return extractData(response);
  },

  async update(id: string, data: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return extractData(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
