import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// import { useAuthStore } from '../store/useAuthStore'

type ApiErrorBody = { detail?: unknown }

function extractDetail(data: unknown): string | undefined {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'detail' in data) {
    const d = (data as ApiErrorBody).detail
    return typeof d === 'string' ? d : undefined
  }
  return undefined
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type Recipe = {
  id: number
  title: string
  description: string
  cooking_time_minutes: number
  difficulty: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ingredients: any[]
  instructions: string[]
  user_id: number
  image: string
  created_at: string
}

type UserRecipeApi = {
  id: number
  user_id: number
  recipe_id: number
  checklist: string[]
  notes?: string | null
  is_completed: boolean
  created_at?: string
  updated_at?: string
  recipe?: Recipe
}

export default function UserRecipes() {
  const navigate = useNavigate()
  // const user = useAuthStore((s) => s.user)
  // const isUserLoading = useAuthStore((s) => s.isUserLoading)

  const [items, setItems] = useState<UserRecipeApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ----- edit modal -----
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editItem, setEditItem] = useState<UserRecipeApi | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editChecklist, setEditChecklist] = useState<string[]>([])
  const [editNewItem, setEditNewItem] = useState('')

  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const token = localStorage.getItem('user_token')
      if (!token) {
        navigate('/login')
        return
      }

      setLoading(true)
      setError('')

      try {
        const { data } = await axios.get<UserRecipeApi[]>(`${API_URL}/user-recipes`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const needFetch = data.some((x) => !x.recipe)
        if (!needFetch) {
          if (!cancelled) setItems(data)
          return
        }

        const ids = Array.from(new Set(data.map((x) => x.recipe_id))).filter((id) => id > 0)
        const recipes = await Promise.all(
          ids.map(async (id) => {
            const r = await axios.get<Recipe>(`${API_URL}/recipes/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            return r.data
          })
        )

        const map = new Map<number, Recipe>()
        for (const r of recipes) map.set(r.id, r)

        const merged = data.map((x) => ({ ...x, recipe: x.recipe ?? map.get(x.recipe_id) }))

        if (!cancelled) setItems(merged)
      } catch (e: unknown) {
        if (cancelled) return
        if (axios.isAxiosError(e)) {
          setError(
            extractDetail(e.response?.data) ?? e.message ?? 'Не удалось загрузить мои рецепты'
          )
        } else if (e instanceof Error) {
          setError(e.message || 'Не удалось загрузить мои рецепты')
        } else {
          setError('Не удалось загрузить мои рецепты')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function markCompleted(item: UserRecipeApi) {
    const token = localStorage.getItem('user_token')
    if (!token) return navigate('/login')

    try {
      const { data } = await axios.put<UserRecipeApi>(
        `${API_URL}/user-recipes/${item.recipe?.id}`,
        { is_completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setItems((prev) =>
        prev.map((x) => (x.recipe_id === item.recipe_id ? { ...data, recipe: x.recipe } : x))
      )
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? extractDetail(e.response?.data) ?? e.message
        : e instanceof Error
        ? e.message
        : 'Ошибка обновления'
      alert(msg)
    }
  }

  async function removeFromCollection(recipeId: number) {
    if (!recipeId) return

    const token = localStorage.getItem('user_token')
    if (!token) return navigate('/login')

    setDeleteLoadingId(recipeId)
    try {
      await axios.delete(`${API_URL}/user-recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setItems((prev) => prev.filter((x) => x.recipe?.id !== recipeId))
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? extractDetail(e.response?.data) ?? e.message
        : e instanceof Error
        ? e.message
        : 'Ошибка удаления'
      alert(msg)
    } finally {
      setDeleteLoadingId(null)
    }
  }

  function openEditModal(item: UserRecipeApi) {
    setEditError('')
    setEditItem(item)
    setEditNotes(item.notes ?? '')
    setEditChecklist(Array.isArray(item.checklist) ? item.checklist : [])
    setEditNewItem('')
    setEditOpen(true)
  }

  function addEditChecklistItem() {
    const v = editNewItem.trim()
    if (!v) return
    setEditChecklist((prev) => [...prev, v])
    setEditNewItem('')
  }

  function removeEditChecklistItem(index: number) {
    setEditChecklist((prev) => prev.filter((_, i) => i !== index))
  }

  async function saveEdit() {
    if (!editItem) return
    const token = localStorage.getItem('user_token')
    if (!token) return navigate('/login')

    setEditLoading(true)
    setEditError('')
    try {
      const { data } = await axios.put<UserRecipeApi>(
        `${API_URL}/user-recipes/${editItem.recipe?.id}`,
        {
          checklist: editChecklist,
          notes: editNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setItems((prev) =>
        prev.map((x) =>
          x.recipe_id === editItem.recipe_id
            ? { ...data, recipe: x.recipe } // оставим докачанный recipe
            : x
        )
      )

      setEditOpen(false)
      setEditItem(null)
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setEditError(extractDetail(e.response?.data) ?? e.message ?? 'Не удалось сохранить')
      } else if (e instanceof Error) {
        setEditError(e.message || 'Не удалось сохранить')
      } else {
        setEditError('Не удалось сохранить')
      }
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) return <div className="p-4">Загрузка…</div>
  if (error) return <div className="alert-error">{error}</div>

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link to="/" className="btn-secondary">
          ← Назад
        </Link>
        <div className="text-zinc-600">Мои рецепты: {items.length}</div>
      </div>

      {items.length === 0 ? (
        <div className="card p-4">Пока нет сохранённых рецептов.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {items.map((x) => {
            const title = x.recipe?.title ?? `Recipe #${x.recipe_id}`

            return (
              <div key={x.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/recipes/${x.recipe_id}`}
                      className="text-lg font-bold text-zinc-900 block truncate"
                    >
                      {title}
                    </Link>
                    <div className="mt-1 text-sm text-zinc-500">
                      Статус: {x.is_completed ? '✅ выполнено' : '🕒 в процессе'}
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="mt-4">
                  <div className="font-semibold">Checklist</div>
                  {Array.isArray(x.checklist) && x.checklist.length > 0 ? (
                    <ul className="mt-2 space-y-1 list-disc pl-5 text-zinc-800">
                      {x.checklist.map((item, idx) => (
                        <li key={`${x.id}-cl-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 text-sm text-zinc-500">Пусто</div>
                  )}
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <div className="font-semibold">Notes</div>
                  <div className="mt-2 text-zinc-800 whitespace-pre-wrap">
                    {x.notes?.trim() ? (
                      x.notes
                    ) : (
                      <span className="text-sm text-zinc-500">Нет заметок</span>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-5 flex flex-col gap-2">
                  <button
                    className="btn-primary"
                    onClick={() => markCompleted(x)}
                    disabled={x.is_completed}
                    title={x.is_completed ? 'Уже выполнено' : 'Пометить выполненным'}
                  >
                    {x.is_completed ? '✅ Выполнено' : 'Пометить выполненным'}
                  </button>

                  <button className="btn-secondary" onClick={() => openEditModal(x)}>
                    Редактировать
                  </button>

                  <button
                    className="btn-secondary border-red-200 text-red-700 hover:bg-red-50 focus:ring-red-200 disabled:opacity-60"
                    onClick={() => {
                      if (!x?.recipe?.id) {
                        return
                      }
                      removeFromCollection(x.recipe?.id)
                    }}
                    disabled={deleteLoadingId === x.recipe_id}
                  >
                    {deleteLoadingId === x.recipe_id ? 'Удаление…' : 'Удалить'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      {editOpen && editItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => (!editLoading ? setEditOpen(false) : null)}
          />
          <div className="relative w-[min(92vw,560px)] rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-bold">Редактировать</div>
                <div className="text-sm text-zinc-500">
                  {editItem.recipe?.title ?? `Recipe #${editItem.recipe_id}`}
                </div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => (!editLoading ? setEditOpen(false) : null)}
              >
                ✕
              </button>
            </div>

            {editError ? <div className="alert-error mt-3">{editError}</div> : null}

            <div className="mt-4">
              <div className="font-semibold">Checklist</div>

              <div className="mt-2 flex gap-2">
                <input
                  value={editNewItem}
                  onChange={(e) => setEditNewItem(e.target.value)}
                  className="input flex-1"
                  placeholder="Добавить пункт"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addEditChecklistItem()
                  }}
                />
                <button className="btn-secondary" onClick={addEditChecklistItem}>
                  Добавить
                </button>
              </div>

              {editChecklist.length ? (
                <ul className="mt-3 space-y-2">
                  {editChecklist.map((item, idx) => (
                    <li
                      key={`${editItem.id}-edit-${idx}`}
                      className="flex items-center justify-between gap-2 card p-2"
                    >
                      <div className="text-zinc-800">{item}</div>
                      <button
                        className="btn-secondary"
                        onClick={() => removeEditChecklistItem(idx)}
                      >
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
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="input mt-2 w-full min-h-[110px]"
                placeholder="Заметки..."
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => setEditOpen(false)}
                disabled={editLoading}
              >
                Отмена
              </button>
              <button className="btn-primary" onClick={saveEdit} disabled={editLoading}>
                {editLoading ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
