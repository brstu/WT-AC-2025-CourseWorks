import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAuth({ children }: { children: JSX.Element }){
  const auth = useAuth()
  const location = useLocation()
  if (!auth.token) {
    // redirect to login, preserve location to return after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }
  return children
}

