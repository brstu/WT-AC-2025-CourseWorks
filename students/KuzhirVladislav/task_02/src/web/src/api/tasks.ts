import api from './client'
import { Task } from '../types/models'

export default {
  list: async (params?: { search?: string; dealId?: string }): Promise<Task[]> => {
    const res = await api.get('/api/v1/tasks', { params })
    return res.data || []
  },
  get: async (id: string) => {
    const res = await api.get(`/api/v1/tasks/${id}`)
    return res.data as Task
  },
  create: async (payload: Partial<Task>) => {
    const res = await api.post('/api/v1/tasks', payload)
    return res.data as Task
  },
  update: async (id: string, payload: Partial<Task>) => {
    const res = await api.put(`/api/v1/tasks/${id}`, payload)
    return res.data as Task
  },
  remove: async (id: string) => {
    const res = await api.delete(`/api/v1/tasks/${id}`)
    return res.data
  }
}

