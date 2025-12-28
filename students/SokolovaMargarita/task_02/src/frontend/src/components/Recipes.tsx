import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RECIPE_DIFFICULTIES, type RecipeDifficulty } from '../constants/recipes-difficulty'

type Recipe = {
  id: number
  title: string
  description: string
  cooking_time_minutes: number
  difficulty: string
  ingredients: unknown[]
  instructions: string[]
  user_id: number
  image: string
  created_at: string
}

type ApiErrorBody = { detail?: unknown }

const DIFFICULTY_LABEL: Record<string, string> = Object.fromEntries(
  RECIPE_DIFFICULTIES.map((d) => [d.value, d.label])
)

const getDifficultyLabel = (value: string) => DIFFICULTY_LABEL[value] ?? value

function extractDetail(data: unknown): string | undefined {
  if (typeof data === 'string') return data

  if (data && typeof data === 'object' && 'detail' in data) {
    const d = (data as ApiErrorBody).detail
    return typeof d === 'string' ? d : undefined
  }

  return undefined
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
      <rect width="100%" height="100%" fill="#f4f4f5"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial" font-size="24" fill="#71717a">
        No image
      </text>
    </svg>`
  )

export const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const [difficultyFilter, setDifficultyFilter] = useState<RecipeDifficulty | 'all'>('all')

  const endpoint = useMemo(() => `${API_URL}/recipes`, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await axios.get<Recipe[]>(endpoint)
        if (!cancelled) setRecipes(Array.isArray(data) ? data : [])
      } catch (e: unknown) {
        if (cancelled) return

        if (axios.isAxiosError(e)) {
          const msg =
            extractDetail(e.response?.data) ??
            (typeof e.message === 'string' ? e.message : undefined) ??
            'Не удалось загрузить рецепты'

          setError(msg)
        } else if (e instanceof Error) {
          setError(e.message || 'Не удалось загрузить рецепты')
        } else {
          setError('Не удалось загрузить рецепты')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [endpoint])

  const filteredRecipes = useMemo(() => {
    if (difficultyFilter === 'all') return recipes
    return recipes.filter((r) => r.difficulty === difficultyFilter)
  }, [recipes, difficultyFilter])

  if (loading) return <div className="p-4">Загрузка…</div>
  if (error) return <div className="alert-error">{error}</div>

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Все рецепты</h1>
        <p className="mt-1 text-sm text-zinc-600">Здесь отображаются все рецепты</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={difficultyFilter === 'all' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setDifficultyFilter('all')}
        >
          Все
        </button>

        {RECIPE_DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            type="button"
            className={difficultyFilter === d.value ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setDifficultyFilter(d.value)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="card p-4 text-zinc-700">Ничего не найдено по выбранной сложности.</div>
      ) : (
        <div className="grid w-full gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto sm:max-w-[450px] md:max-w-[620px] lg:max-w-full">
          {filteredRecipes.map((r) => (
            <Link key={r.id} to={`/recipes/${r.id}`} className="block">
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
                    <span>🔥 {getDifficultyLabel(r.difficulty)}</span>
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
  )
}
