import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api/client'

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Validate token and get user info
      // Simplified - in real app would decode JWT or call /me endpoint
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { accessToken, refreshToken, user } = response.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(user)
  }

  const register = async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password })
    const { accessToken, refreshToken, user } = response.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
