import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type User = {
  id: string
  name: string
  email: string
  role: string
}

type AuthState = {
  user: User | null
  isUserLoading: boolean

  loadUser: () => Promise<User | null>
  logout: () => void

  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isUserLoading: false,

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('user_token')
    set({ user: null })
  },

  loadUser: async () => {
    const { user, isUserLoading } = get()
    if (user || isUserLoading) return user

    const token = localStorage.getItem('user_token')
    if (!token) return null

    set({ isUserLoading: true })

    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const detail = (res.data as { detail?: string })?.detail
        throw new Error(detail ?? 'Не удалось загрузить профиль')
      }

      set({ user: res.data as User })
      return res.data as User
    } catch {
      localStorage.removeItem('user_token')
      set({ user: null })

      return null
    } finally {
      set({ isUserLoading: false })
    }
  },
}))
