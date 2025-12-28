import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RECIPE_DIFFICULTIES } from '../constants/recipes-difficulty'
import { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from '../constants/ingredients'
import { useAuthStore } from '../store/useAuthStore'

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  INGREDIENT_CATEGORIES.map((c) => [c.value, c.label])
)

const UNIT_LABEL: Record<string, string> = Object.fromEntries(
  INGREDIENT_UNITS.map((u) => [u.value, u.label])
)

const getCategoryLabel = (value: string) => CATEGORY_LABEL[value] ?? value
const getUnitLabel = (value: string) => UNIT_LABEL[value] ?? value

type RecipeIngredient = {
  ingredient_id: number
  quantity: number
  note: string
  name: string
  category: string
  unit: string
  image: string
}

type Recipe = {
  id: number
  title: string
  description: string
  cooking_time_minutes: number
  difficulty: string
  ingredients: RecipeIngredient[]
  instructions: string[]
  user_id: number
  image: string
  created_at: string
}

type UserRecipe = {
  id: number
  user_id: number
  recipe_id: number
  checklist: string[]
  notes?: string | null
  is_completed: boolean
  created_at?: string
  updated_at?: string
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

export default function Recipe() {
  const params = useParams()
  const recipeId = Number(params.recipe_id)

  const user = useAuthStore((s) => s.user)

  const navigate = useNavigate()

  const [saveOpen, setSaveOpen] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [notes, setNotes] = useState('')
  const [checklist, setChecklist] = useState<string[]>([])
  const [newItem, setNewItem] = useState('')

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const [userRecipe, setUserRecipe] = useState<UserRecipe | null>(null)
  const [userRecipeLoading, setUserRecipeLoading] = useState(false)

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const endpoint = useMemo(() => `${API_URL}/recipes/${recipeId}`, [recipeId])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!Number.isFinite(recipeId) || recipeId <= 0) {
        setError('Некорректный id рецепта')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('user_token')
        const { data } = await axios.get<Recipe | Recipe[]>(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        const normalized = Array.isArray(data) ? data[0] ?? null : data
        if (!cancelled) setRecipe(normalized ?? null)
      } catch (e: unknown) {
        if (cancelled) return
        if (axios.isAxiosError(e)) {
          const msg =
            extractDetail(e.response?.data) ??
            (typeof e.message === 'string' ? e.message : undefined) ??
            'Не удалось загрузить рецепт'
          setError(msg)
        } else if (e instanceof Error) {
          setError(e.message || 'Не удалось загрузить рецепт')
        } else {
          setError('Не удалось загрузить рецепт')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [endpoint, recipeId])

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      if (!user) {
        setUserRecipe(null)
        return
      }

      const token = localStorage.getItem('user_token')
      if (!token) {
        setUserRecipe(null)
        return
      }

      if (!Number.isFinite(recipeId) || recipeId <= 0) {
        setUserRecipe(null)
        return
      }

      setUserRecipeLoading(true)
      try {
        const { data } = await axios.get<UserRecipe>(`${API_URL}/user-recipes/${recipeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!cancelled) setUserRecipe(data)
      } catch (e: unknown) {
        if (cancelled) return
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          setUserRecipe(null)
          return
        }
        console.error(e)
        setUserRecipe(null)
      } finally {
        if (!cancelled) setUserRecipeLoading(false)
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [user, recipeId])

  function openSaveModal() {
    if (!user) {
      return navigate('/login')
    }

    setSaveError('')
    setNotes('')

    setChecklist([])

    setNewItem('')
    setSaveOpen(true)
  }

  function addChecklistItem() {
    const v = newItem.trim()
    if (!v) return
    setChecklist((prev) => [...prev, v])
    setNewItem('')
  }

  function removeChecklistItem(index: number) {
    setChecklist((prev) => prev.filter((_, i) => i !== index))
  }

  async function submitUserRecipe() {
    if (!recipe) return

    const token = localStorage.getItem('user_token')
    if (!token) {
      setSaveError('Нужно войти в аккаунт')
      return
    }

    setSaveLoading(true)
    setSaveError('')

    try {
      await axios.post(
        `${API_URL}/user-recipes`,
        {
          recipe_id: recipe.id,
          checklist,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      navigate('/user-recipes')
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setSaveError(
          extractDetail(e.response?.data) ?? e.message ?? 'Не удалось добавить рецепт в коллекцию'
        )
      } else if (e instanceof Error) {
        setSaveError(e.message || 'Не удалось добавить рецепт в коллекцию')
      } else {
        setSaveError('Не удалось добавить рецепт в коллекцию')
      }
    } finally {
      setSaveLoading(false)
    }
  }

  async function deleteUserRecipe() {
    if (!user) return navigate('/login')

    const token = localStorage.getItem('user_token')
    if (!token) return navigate('/login')

    setDeleteLoading(true)
    setDeleteError('')

    try {
      await axios.delete(`${API_URL}/user-recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserRecipe(null) // сразу обновили UI
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setDeleteError(
          extractDetail(e.response?.data) ?? e.message ?? 'Не удалось удалить из коллекции'
        )
      } else if (e instanceof Error) {
        setDeleteError(e.message || 'Не удалось удалить из коллекции')
      } else {
        setDeleteError('Не удалось удалить из коллекции')
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <div className="p-4">Загрузка…</div>
  if (error) return <div className="alert-error">{error}</div>
  if (!recipe) return <div className="card p-4">Рецепт не найден</div>

  // const createdText = recipe.created_at ? new Date(recipe.created_at).toLocaleString() : ''

  return (
    <div className="w-full">
      <div className="mb-10">
        <Link to="/" className="btn-secondary">
          ← Назад
        </Link>
      </div>
      <div className="mx-auto w-full px-4 sm:px-0 sm:max-w-[560px] md:max-w-[840px] lg:max-w-[1120px]">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200">
          <div className="relative w-full aspect-[16/9] lg:aspect-[16/5] bg-zinc-100">
            <img
              src={recipe.image || FALLBACK_IMG}
              alt={recipe.title}
              onError={(ev) => {
                ;(ev.currentTarget as HTMLImageElement).src = FALLBACK_IMG
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight drop-shadow-sm">
              {recipe.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/90">
              <span className="rounded-full bg-white/15 px-3 py-1">
                ⏱ {recipe.cooking_time_minutes} мин
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1">
                🔥 {getDifficultyLabel(recipe.difficulty)}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1">
                🥕 {recipe.ingredients?.length ?? 0} инг.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            {userRecipeLoading ? (
              <div className="text-sm text-zinc-500">Проверяем, в коллекции ли рецепт…</div>
            ) : userRecipe ? (
              <>
                <button className="btn-secondary" onClick={() => navigate('/user-recipes')}>
                  📌 Перейти в мои рецепты
                </button>

                <button
                  className="btn-secondary border-red-200 text-red-700 hover:bg-red-50 focus:ring-red-200 disabled:opacity-60"
                  onClick={deleteUserRecipe}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Удаление…' : '🗑 Удалить'}
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={openSaveModal}>
                ⭐ Добавить в мои рецепты
              </button>
            )}
          </div>

          {deleteError ? <div className="alert-error">{deleteError}</div> : null}
        </div>

        {/* Описание */}
        <div className="mt-4 card p-4">
          <h2 className="text-lg font-bold">Описание</h2>
          <p className="mt-2 text-zinc-700">
            {recipe.description?.trim() ? recipe.description : 'Без описания'}
          </p>
        </div>

        {/* Контент */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* Инструкции */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold">Приготовление</h2>

            {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 ? (
              <ol className="mt-3 space-y-3">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-800">
                      {step}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-3 text-zinc-600">Шаги приготовления не указаны.</div>
            )}
          </div>

          <aside>
            <h2 className="text-lg font-bold">Ингредиенты</h2>

            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
              <div className="mt-3 space-y-3">
                {recipe.ingredients.map((ing) => (
                  <div
                    key={ing.ingredient_id}
                    className="flex gap-3 rounded-xl border border-zinc-200 p-3"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                      <img
                        src={ing.image || FALLBACK_IMG}
                        alt={ing.name}
                        onError={(ev) => {
                          ;(ev.currentTarget as HTMLImageElement).src = FALLBACK_IMG
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 truncate">{ing.name}</div>
                          <div className="mt-0.5 text-xs text-zinc-500 truncate">
                            {getCategoryLabel(ing.category)}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="font-semibold text-zinc-900">
                            {ing.quantity} {getUnitLabel(ing.unit)}
                          </div>
                        </div>
                      </div>

                      {ing.note?.trim() ? (
                        <div className="mt-2 text-sm text-zinc-700">
                          <span className="text-zinc-500">Примечание:</span> {ing.note}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 text-zinc-600">Ингредиенты не указаны.</div>
            )}
          </aside>
        </div>
      </div>

      {saveOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => (!saveLoading ? setSaveOpen(false) : null)}
          />
          <div className="relative w-[min(92vw,560px)] rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold">Добавить в мои рецепты</div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => (!saveLoading ? setSaveOpen(false) : null)}
              >
                ✕
              </button>
            </div>

            {saveError ? <div className="alert-error mt-3">{saveError}</div> : null}

            <div className="mt-4">
              <div className="font-semibold">Checklist</div>

              <div className="mt-2 flex gap-2">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="input flex-1"
                  placeholder="Например: купить молоко"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addChecklistItem()
                  }}
                />
                <button className="btn-secondary" onClick={addChecklistItem}>
                  Добавить
                </button>
              </div>

              {checklist.length ? (
                <ul className="mt-3 space-y-2">
                  {checklist.map((item, idx) => (
                    <li
                      key={`${item}-${idx}`}
                      className="flex items-center justify-between gap-2 card p-2"
                    >
                      <div className="text-zinc-800">{item}</div>
                      <button className="btn-secondary" onClick={() => removeChecklistItem(idx)}>
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 text-sm text-zinc-500">Пока пусто.</div>
              )}
            </div>

            <div className="mt-4">
              <div className="font-semibold">Notes</div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input mt-2 w-full min-h-[100px]"
                placeholder="Заметки..."
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => setSaveOpen(false)}
                disabled={saveLoading}
              >
                Отмена
              </button>
              <button className="btn-primary" onClick={submitUserRecipe} disabled={saveLoading}>
                {saveLoading ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
