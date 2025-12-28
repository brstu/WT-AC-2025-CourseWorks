import { useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function AppLayout() {
  const loadUser = useAuthStore((s) => s.loadUser)
  const user = useAuthStore((s) => s.user)
  const isUserLoading = useAuthStore((s) => s.isUserLoading)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const year = new Date().getFullYear()

  return (
    <div className="app-shell">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold">
            Cooking <span className="text-green-700">Recipe</span>
          </Link>

          {isUserLoading ? (
            <div className="text-sm text-zinc-600">Загрузка...</div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-700">{user.name}</span>
              <button className="btn-secondary" onClick={logout}>
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary">
                Войти
              </Link>
              <Link to="/start" className="btn-primary">
                Начать
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-600">© {year} Cooking Recipe</div>
          <div className="text-sm text-zinc-500">Сделано с любовью к еде 🍳</div>
        </div>
      </footer>
    </div>
  )
}
