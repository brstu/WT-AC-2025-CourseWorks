import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

import NotFound from '../pages/NotFound'

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const isUserLoading = useAuthStore((s) => s.isUserLoading)

  if (isUserLoading) {
    return
  }

  if (user?.role !== 'admin') {
    return <NotFound />
  }

  return <Outlet />
}
