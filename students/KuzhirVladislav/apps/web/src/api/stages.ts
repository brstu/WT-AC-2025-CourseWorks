import api from './client'
import { Stage } from '../types/models'

export default {
  list: async (): Promise<Stage[]> => {
    const res = await api.get('/api/v1/stages')
    return res.data || []
  },
  get: async (id: string) => {
    const res = await api.get(`/api/v1/stages/${id}`)
    return res.data as Stage
  },
  create: async (payload: Partial<Stage>) => {
    const res = await api.post('/api/v1/stages', payload)
    return res.data as Stage
  },
  update: async (id: string, payload: Partial<Stage>) => {
    const res = await api.put(`/api/v1/stages/${id}`, payload)
    return res.data as Stage
  },
  remove: async (id: string) => {
    const res = await api.delete(`/api/v1/stages/${id}`)
    return res.data
  }
}

