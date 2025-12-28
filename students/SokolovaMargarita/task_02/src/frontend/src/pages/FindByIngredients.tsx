import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  type IngredientCategory,
  type IngredientUnit,
} from '../constants/ingredients'
import { RECIPE_DIFFICULTIES, type RecipeDifficulty } from '../constants/recipes-difficulty'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f4f4f5"/>
          <stop offset="1" stop-color="#e4e4e7"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="ui-sans-serif, system-ui" font-size="22" fill="#71717a">
        no image
      </text>
    </svg>`
  )

type Ingredient = {
  id: number
  name: string
  category: IngredientCategory | string
  unit: IngredientUnit | string
  description: string
  calories_per_unit: number
  image: string
  created_at: string
}

type RecipeIngredient = {
  ingredient_id: number
  quantity: number
  note: string
  name: string
  category: string
  unit: string
  image?: string
}

type Recipe = {
  id: number
  title: string
  description: string
  cooking_time_minutes: number
  difficulty: RecipeDifficulty | string
  instructions: string[]
  ingredients: RecipeIngredient[]
  user_id: number
  image?: string
  created_at: string
}

type ApiErrorBody = { detail?: unknown }
function extractDetail(data: unknown): string | undefined {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'detail' in data) {
    const d = (data as ApiErrorBody).detail
    return typeof d === 'string' ? d : undefined
  }
  return undefined
}

function getAuthHeaders() {
  const token = localStorage.getItem('user_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  INGREDIENT_CATEGORIES.map((c) => [c.value, c.label])
)
const UNIT_LABEL: Record<string, string> = Object.fromEntries(
  INGREDIENT_UNITS.map((u) => [u.value, u.label])
)
const DIFFICULTY_LABEL: Record<string, string> = Object.fromEntries(
  RECIPE_DIFFICULTIES.map((d) => [d.value, d.label])
)

const getCategoryLabel = (v: string) => CATEGORY_LABEL[v] ?? v
const getUnitLabel = (v: string) => UNIT_LABEL[v] ?? v
const getDifficultyLabel = (v: string) => DIFFICULTY_LABEL[v] ?? v

export default function FindByIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loadingIngredients, setLoadingIngredients] = useState(false)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const [maxTime, setMaxTime] = useState<number | ''>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [recipeCategory, setRecipeCategory] = useState<string>('')

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchingRecipes, setSearchingRecipes] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const ingredientsById = useMemo(() => {
    const map = new Map<number, Ingredient>()
    for (const i of ingredients) map.set(i.id, i)
    return map
  }, [ingredients])

  const selectedList = useMemo(() => {
    return Array.from(selectedIds)
      .map((id) => ingredientsById.get(id))
      .filter(Boolean) as Ingredient[]
  }, [selectedIds, ingredientsById])

  useEffect(() => {
    let cancelled = false

    async function loadIngredients() {
      setLoadingIngredients(true)
      setError(null)
      try {
        const res = await axios.get<Ingredient[]>(`${API_URL}/ingredients`, {
          headers: getAuthHeaders(),
          params: {
            category: categoryFilter || undefined,
            search: search.trim() || undefined,
          },
        })

        if (cancelled) return

        const sorted = [...res.data].sort((a, b) =>
          sort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        )
        setIngredients(sorted)
      } catch (e: unknown) {
        if (cancelled) return
        const err = e as { response?: { data?: unknown } }
        setError(extractDetail(err.response?.data) ?? 'Не удалось загрузить продукты')
      } finally {
        if (!cancelled) setLoadingIngredients(false)
      }
    }

    loadIngredients()
    return () => {
      cancelled = true
    }
  }, [search, categoryFilter, sort])

  function toggleIngredient(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function removeSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  async function submitFindRecipes() {
    if (selectedIds.size === 0) return

    setSearchingRecipes(true)
    setError(null)
    setRecipes([])

    try {
      const payload: Record<string, unknown> = {
        ingredients: Array.from(selectedIds),
      }
      if (maxTime !== '') payload.max_time = Number(maxTime)
      if (difficulty) payload.difficulty = difficulty
      if (recipeCategory) payload.category = recipeCategory

      const res = await axios.post<Recipe[]>(`${API_URL}/recipes/find-by-ingredients`, payload, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      })

      setRecipes(res.data)
    } catch (e: unknown) {
      const err = e as { response?: { data?: unknown } }
      setError(extractDetail(err.response?.data) ?? 'Не удалось найти рецепты')
    } finally {
      setSearchingRecipes(false)
    }
  }

  const selectedCount = selectedIds.size

  return (
    <div className="flex flex-col gap-6">
      {/* Панель фильтров */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Поиск рецептов по ингредиентам</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Выбери продукты ниже и нажми “Найти рецепты”.
            </p>
          </div>

          <button
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={clearSelection}
            disabled={selectedCount === 0}
          >
            Очистить
          </button>
        </div>

        {/* Чипсы выбранных ингредиентов */}
        {selectedList.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedList.slice(0, 12).map((i) => (
              <button
                key={i.id}
                onClick={() => removeSelected(i.id)}
                className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm hover:bg-zinc-50"
                title="Убрать"
              >
                <span className="max-w-[180px] truncate">{i.name}</span>
                <span className="text-zinc-400 group-hover:text-zinc-600">×</span>
              </button>
            ))}
            {selectedList.length > 12 ? (
              <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600">
                +{selectedList.length - 12}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600">Поиск продукта</label>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Например: молоко"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600">Категория (список продуктов)</label>
            <select
              className="input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Все</option>
              {INGREDIENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600">Сортировка</label>
            <select
              className="input"
              value={sort}
              onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600">Максимум минут</label>
            <input
              className="input"
              type="number"
              min={1}
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Например: 30"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600">Сложность</label>
            <select
              className="input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">Любая</option>
              {RECIPE_DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600">Категория (фильтр рецептов)</label>
            <select
              className="input"
              value={recipeCategory}
              onChange={(e) => setRecipeCategory(e.target.value)}
            >
              <option value="">Не важно</option>
              {INGREDIENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={submitFindRecipes}
            disabled={searchingRecipes || selectedCount === 0}
          >
            {searchingRecipes ? 'Ищу…' : `Найти рецепты (${selectedCount})`}
          </button>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}
      </div>

      <div className="card p-6">
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-lg font-semibold">Продукты</h3>
          <div className="text-sm text-zinc-600">Выбрано: {selectedCount}</div>
        </div>

        {loadingIngredients ? (
          <div className="mt-3 text-zinc-600">Загрузка…</div>
        ) : ingredients.length === 0 ? (
          <div className="mt-3 text-zinc-600">Ничего не найдено</div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ingredients.map((p) => {
              const checked = selectedIds.has(p.id)
              const img = p.image || FALLBACK_IMG

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleIngredient(p.id)}
                  className="text-left"
                  title={checked ? 'Убрать из выбора' : 'Добавить в выбор'}
                >
                  <article
                    className={`card relative overflow-hidden aspect-square group transition ${
                      checked ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    <img
                      src={img}
                      alt={p.name}
                      onError={(ev) => {
                        ;(ev.currentTarget as HTMLImageElement).src = FALLBACK_IMG
                      }}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

                    <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
                      <span className="inline-flex max-w-[75%] truncate rounded-full bg-black/15 px-3 py-1 text-xs text-white backdrop-blur">
                        {getCategoryLabel(String(p.category))}
                      </span>

                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition ${
                          checked ? 'bg-green-600/90' : 'bg-black/15'
                        }`}
                        aria-label={checked ? 'Выбрано' : 'Не выбрано'}
                      >
                        <span className="text-white text-lg leading-none">
                          {checked ? '✓' : '+'}
                        </span>
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <h4 className="text-lg font-bold leading-tight line-clamp-2 drop-shadow-sm">
                        {p.name}
                      </h4>

                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/90">
                        <span>⚖️ {getUnitLabel(String(p.unit))}</span>
                        <span className="text-white/40">•</span>
                        <span>🔥 {p.calories_per_unit ?? 0} ккал</span>
                      </div>

                      {p.description ? (
                        <p className="mt-2 text-sm text-white/85 line-clamp-2">{p.description}</p>
                      ) : null}
                    </div>

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10" />
                  </article>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold">Результаты</h3>

        {recipes.length === 0 ? (
          <div className="mt-3 text-zinc-600">
            Пока пусто. Выбери продукты и нажми “Найти рецепты”.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <Link key={r.id} to={`/recipes/${r.id}`} className="block">
                {/* <span>{JSON.stringify(r)}</span> */}
                <article className="card relative overflow-hidden aspect-square group">
                  <img
                    src={r.image || FALLBACK_IMG}
                    alt={r.title}
                    onError={(ev) => {
                      ;(ev.currentTarget as HTMLImageElement).src = FALLBACK_IMG
                    }}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="text-lg font-bold leading-tight line-clamp-2 drop-shadow-sm">
                      {r.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/90">
                      <span>⏱ {r.cooking_time_minutes} мин</span>
                      <span className="text-white/40">•</span>
                      <span>🔥 {getDifficultyLabel(String(r.difficulty))}</span>
                      <span className="text-white/40">•</span>
                      <span>🥕 {Array.isArray(r.ingredients) ? r.ingredients.length : 0} инг.</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10" />
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
