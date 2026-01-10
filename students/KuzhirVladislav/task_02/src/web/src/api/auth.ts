import api from './client'

type LoginPayload = { username: string; password: string }

export default {
  login: async (payload: LoginPayload) => {
    const res = await api.post('/api/v1/auth/login', payload)
    return res.data as { token: string }
  },
  register: async (payload: any) => {
    const res = await api.post('/api/v1/auth/register', payload)
    return res.data
  }
}

