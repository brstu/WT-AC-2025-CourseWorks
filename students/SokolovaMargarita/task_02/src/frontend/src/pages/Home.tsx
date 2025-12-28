import { Link } from 'react-router-dom'
import { Recipes } from '../components/Recipes'
import { useAuthStore } from '../store/useAuthStore'

export default function Home() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="flex flex-col gap-11">
      {/* <div className="card p-6">
        <h1 className="text-2xl font-semibold">Главная</h1>
        <p className="mt-2 text-zinc-600">Это контент внутри Layout через Outlet.</p>

        <div className="mt-4 flex gap-2">
          <Link to="/start" className="btn btn-primary">
            Начать
          </Link>
          <Link to="/about" className="btn btn-secondary">
            О проекте
          </Link>
        </div>
      </div> */}

      {user && (
        <div className="flex flex-col gap-3">
          {user.role === 'admin' && (
            <Link to="/admin" className="btn-secondary">
              🖥️ Управление рецептами и ингредиентами
            </Link>
          )}
          <Link to="/user-recipes" className="btn-secondary">
            📌 Мои рецепты
          </Link>
          <Link to="/find-by-ingredients" className="btn-secondary">
            🔎 Поиск по ингредиентам
          </Link>
        </div>
      )}

      <Recipes />
    </div>
  )
}
