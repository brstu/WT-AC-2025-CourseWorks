import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type ApiErrorBody = { detail: string }

type Recipe = {
  id: number
  title: string
  description: string
  cooking_time_minutes: number
  difficulty: string
  ingredients: []
  instructions: string[]
  user_id: number
  image: string
  created_at: string
}

type SortDir = 'asc' | 'desc'
type SortKey = 'title' | 'created_at' | 'time'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const RECIPE_DIFFICULTIES = [
  { value: 'easy', label: 'Лёгкая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'hard', label: 'Сложная' },
] as const

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240">
      <rect width="100%" height="100%" fill="#f4f4f5"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#71717a" font-size="18" font-family="Arial">
        no image
      </text>
    </svg>`
  )

export default function Recipes() {
  const [items, setItems] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const collator = useMemo(() => new Intl.Collator('ru', { sensitivity: 'base' }), [])

  function difficultyLabel(value: string) {
    return RECIPE_DIFFICULTIES.find((d) => d.value === value)?.label ?? value
  }

  useEffect(() => {
    void fetchRecipes()
  }, [])

  async function fetchRecipes() {
    try {
      setLoading(true)
      setApiError('')

      const token = localStorage.getItem('user_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.get(`${API_URL}/recipes`, {
        headers,
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка загрузки рецептов')
      }

      setItems(Array.isArray(res.data) ? (res.data as Recipe[]) : [])
    } catch (err) {
      if (err instanceof Error) setApiError(err.message || 'Неизвестная ошибка')
      else setApiError('Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  async function deleteRecipe(id: number, title: string) {
    const ok = confirm(`Удалить рецепт "${title}"?`)
    if (!ok) return

    try {
      setDeletingId(id)
      setApiError('')

      const token = localStorage.getItem('user_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.delete(`${API_URL}/recipes/${id}`, {
        headers,
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка удаления рецепта')
      }

      setItems((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      if (err instanceof Error) setApiError(err.message || 'Неизвестная ошибка')
      else setApiError('Неизвестная ошибка')
    } finally {
      setDeletingId(null)
    }
  }

  const viewItems = useMemo(() => {
    const filtered = difficultyFilter
      ? items.filter((r) => r.difficulty === difficultyFilter)
      : items
    const mul = sortDir === 'desc' ? -1 : 1

    return [...filtered].sort((a, b) => {
      if (sortKey === 'title') return collator.compare(a.title ?? '', b.title ?? '') * mul
      if (sortKey === 'time')
        return ((a.cooking_time_minutes ?? 0) - (b.cooking_time_minutes ?? 0)) * mul

      // created_at
      const da = Date.parse(a.created_at ?? '') || 0
      const db = Date.parse(b.created_at ?? '') || 0
      return (da - db) * mul
    })
  }, [items, difficultyFilter, sortKey, sortDir, collator])

  // function formatDate(iso: string) {
  //   const ts = Date.parse(iso)
  //   if (!ts) return '—'
  //   return new Date(ts).toLocaleString('ru-RU')
  // }

  return (
    <div className="app-shell">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Рецепты</h1>
          <p className="text-sm text-zinc-600">Список всех рецептов</p>
        </div>

        <Link to="/admin/recipes/create" className="btn-primary">
          Добавить рецепт
        </Link>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-800">Сложность</label>
            <select
              className="input mt-1"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="">Все</option>
              {RECIPE_DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">Сортировать по</label>
            <select
              className="input mt-1"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="created_at">Дате создания</option>
              <option value="title">Названию</option>
              <option value="time">Времени готовки</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">Направление</label>
            <select
              className="input mt-1"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as SortDir)}
            >
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>
        </div>

        {(difficultyFilter || sortKey !== 'created_at' || sortDir !== 'desc') && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-600">
              Показано: <span className="font-medium text-zinc-900">{viewItems.length}</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDifficultyFilter('')
                setSortKey('created_at')
                setSortDir('desc')
              }}
            >
              Сбросить
            </button>
          </div>
        )}
      </div>

      {apiError && (
        <div className="alert-error" role="alert">
          {apiError}
        </div>
      )}

      {loading && <div className="mt-4 text-sm text-zinc-600">Загрузка...</div>}

      {!loading && viewItems.length === 0 && (
        <div className="mt-4 text-sm text-zinc-600">Ничего не найдено</div>
      )}

      <div className="mt-4 space-y-3">
        {viewItems.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="shrink-0">
                <img
                  src={r.image?.trim() ? r.image : FALLBACK_IMG}
                  alt={r.title}
                  className="h-28 w-28 rounded-xl border border-zinc-200 object-cover sm:h-32 sm:w-32"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG
                  }}
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="truncate text-lg font-semibold">{r.title}</h2>
                      <span className="text-xs text-zinc-500">#{r.id}</span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-4">
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <div className="text-xs text-zinc-500">Сложность</div>
                        <div className="font-medium">{difficultyLabel(r.difficulty)}</div>
                      </div>

                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <div className="text-xs text-zinc-500">Время</div>
                        <div className="font-medium">{r.cooking_time_minutes} мин</div>
                      </div>

                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <div className="text-xs text-zinc-500">Ингредиентов</div>
                        <div className="font-medium">
                          {Array.isArray(r.ingredients) ? r.ingredients.length : 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-zinc-500">Описание</div>
                    <div className="mt-1 text-sm text-zinc-700 break-words">
                      {r.description?.trim() ? r.description : '—'}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Link to={`/recipes/${r.id}`} className="btn-secondary">
                      Открыть
                    </Link>
                    <Link to={`/admin/recipes/${r.id}/edit`} className="btn-secondary">
                      Редактировать
                    </Link>
                    <button
                      type="button"
                      className="btn-secondary border-red-200 text-red-700 hover:bg-red-50 focus:ring-red-200 disabled:opacity-60"
                      disabled={deletingId === r.id}
                      onClick={() => void deleteRecipe(r.id, r.title)}
                    >
                      {deletingId === r.id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-zinc-500">
                    шагов: {Array.isArray(r.instructions) ? r.instructions.length : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
