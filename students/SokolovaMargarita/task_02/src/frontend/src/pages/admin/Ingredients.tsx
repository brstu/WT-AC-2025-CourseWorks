import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from '../../constants/ingredients'

type Ingredient = {
  id: number
  name: string
  category: string
  unit: string
  description: string
  calories_per_unit: number
  image: string
}

type ApiErrorBody = { detail: string }

type SortDir = 'asc' | 'desc'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

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

export default function Ingredients() {
  const [items, setItems] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const collator = useMemo(() => new Intl.Collator('ru', { sensitivity: 'base' }), [])

  function categoryLabel(value: string) {
    return INGREDIENT_CATEGORIES.find((c) => c.value === value)?.label ?? value
  }

  function unitLabel(value: string) {
    return INGREDIENT_UNITS.find((u) => u.value === value)?.label ?? value
  }

  const viewItems = useMemo(() => {
    const filtered = categoryFilter ? items.filter((i) => i.category === categoryFilter) : items
    const mul = sortDir === 'desc' ? -1 : 1

    return [...filtered].sort((a, b) => collator.compare(a.name, b.name) * mul)
  }, [items, categoryFilter, sortDir, collator])

  useEffect(() => {
    void fetchIngredients()
  }, [])

  async function fetchIngredients() {
    try {
      setLoading(true)
      setApiError('')

      const token = localStorage.getItem('user_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.get(`${API_URL}/ingredients`, {
        headers,
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка загрузки ингредиентов')
      }

      setItems(Array.isArray(res.data) ? (res.data as Ingredient[]) : [])
    } catch (err) {
      if (err instanceof Error) setApiError(err.message || 'Неизвестная ошибка')
      else setApiError('Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  async function deleteIngredient(id: number, name: string) {
    const ok = confirm(`Удалить "${name}"?`)
    if (!ok) return

    try {
      setDeletingId(id)
      setApiError('')

      const token = localStorage.getItem('user_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.delete(`${API_URL}/ingredients/${id}`, {
        headers,
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка удаления ингредиента')
      }

      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      if (err instanceof Error) setApiError(err.message || 'Неизвестная ошибка')
      else setApiError('Неизвестная ошибка')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="app-shell">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ингредиенты</h1>
          <p className="text-sm text-zinc-600">Список всех ингредиентов</p>
        </div>

        <Link to="/admin/ingredients/create" className="btn-primary">
          Добавить ингредиент
        </Link>
      </div>

      {/* ✅ Фильтр + сортировка */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-800">Категория</label>
            <select
              className="input mt-1"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Все категории</option>
              {INGREDIENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">Сортировка</label>
            <select
              className="input mt-1"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as SortDir)}
            >
              <option value="asc">По возрастанию (А→Я)</option>
              <option value="desc">По убыванию (Я→А)</option>
            </select>
          </div>
        </div>

        {(categoryFilter || sortDir !== 'asc') && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-600">
              Показано: <span className="font-medium text-zinc-900">{viewItems.length}</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setCategoryFilter('')
                setSortDir('asc')
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
        {viewItems.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="shrink-0">
                <img
                  src={item.image?.trim() ? item.image : FALLBACK_IMG}
                  alt={item.name}
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
                      <h2 className="truncate text-lg font-semibold">{item.name}</h2>
                      <span className="text-xs text-zinc-500">#{item.id}</span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-zinc-700 sm:grid-cols-3">
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <div className="text-xs text-zinc-500">Категория</div>
                        <div className="font-medium">{categoryLabel(item.category)}</div>
                      </div>

                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <div className="text-xs text-zinc-500">Единица</div>
                        <div className="font-medium">{unitLabel(item.unit)}</div>
                      </div>

                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                        <div className="text-xs text-zinc-500">Ккал / ед.</div>
                        <div className="font-medium">{item.calories_per_unit}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-zinc-500">Описание</div>
                    <div className="mt-1 text-sm text-zinc-700 break-all">
                      {item.description?.trim() ? item.description : '—'}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Link to={`/admin/ingredients/${item.id}/edit`} className="btn-secondary">
                      Редактировать
                    </Link>
                    <button
                      type="button"
                      className="btn-secondary border-red-200 text-red-700 hover:bg-red-50 focus:ring-red-200 disabled:opacity-60"
                      disabled={deletingId === item.id}
                      onClick={() => void deleteIngredient(item.id, item.name)}
                    >
                      {deletingId === item.id ? 'Удаление...' : 'Удалить'}
                    </button>
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
