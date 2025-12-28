import { Link } from 'react-router-dom'

export default function AdminHome() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Админ-панель</h1>
        <p className="mt-1 text-sm text-zinc-600">Выбери, чем управлять:</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link className="btn btn-primary w-full" to={'/admin/recipes'}>
            Рецепты
          </Link>

          <Link className="btn btn-primary w-full" to={'/admin/ingredients'}>
            Ингредиенты
          </Link>
        </div>
      </div>
    </div>
  )
}
