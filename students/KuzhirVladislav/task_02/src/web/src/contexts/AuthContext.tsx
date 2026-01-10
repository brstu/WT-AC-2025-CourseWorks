import React, { createContext, useContext, useEffect, useState } from 'react'
import authApi from '../api/auth'
import { setAuthToken } from '../api/client'

type AuthContextType = {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // стартуем всегда разлогиненными
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // при старте приложения явно очищаем токен, чтобы гарантировать состояние "logged out"
    localStorage.removeItem('token')
    setToken(null)
    setAuthToken(null)
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      setAuthToken(token)
    } else {
      localStorage.removeItem('token')
      setAuthToken(null)
    }
  }, [token])

  const login = async (username: string, password: string) => {
    const res = await authApi.login({ username, password })
    setToken(res.token)
    // localStorage and axios header are set by effect
  }

  const logout = () => {
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
