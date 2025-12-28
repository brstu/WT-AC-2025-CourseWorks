import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RECIPE_DIFFICULTIES, type RecipeDifficulty } from '../../constants/recipes-difficulty'

type ApiErrorBody = { detail: string }

type IngredientOption = {
  id: number
  name: string
  category?: string
  unit?: string
  image?: string
}

type IngredientRow = {
  ingredient_id: number | ''
  quantity: number | ''
  note: string
}

type Form = {
  title: string
  description: string
  cooking_time_minutes: number | ''
  difficulty: RecipeDifficulty
  ingredients: IngredientRow[]
  instructions: string[]
  image: string
}

type Errors = {
  title: string
  description: string
  cooking_time_minutes: string
  difficulty: string
  ingredients: string
  instructions: string
  image: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function CreateRecipe() {
  const navigate = useNavigate()

  const [ingredientsOptions, setIngredientsOptions] = useState<IngredientOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  const [form, setForm] = useState<Form>({
    title: '',
    description: '',
    cooking_time_minutes: '',
    difficulty: 'easy',
    ingredients: [{ ingredient_id: '', quantity: '', note: '' }],
    instructions: [''],
    image: '',
  })

  const [errors, setErrors] = useState<Errors>({
    title: '',
    description: '',
    cooking_time_minutes: '',
    difficulty: '',
    ingredients: '',
    instructions: '',
    image: '',
  })

  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const token = localStorage.getItem('user_token')

  const isDirty = useMemo(() => {
    const hasAny =
      Boolean(form.title.trim()) ||
      Boolean(form.description.trim()) ||
      Boolean(form.image.trim()) ||
      form.cooking_time_minutes !== '' ||
      Boolean(form.difficulty.trim()) ||
      form.ingredients.some((r) => r.ingredient_id !== '' || r.quantity !== '' || r.note.trim()) ||
      form.instructions.some((s) => s.trim())

    return hasAny
  }, [form])

  // загрузка ингредиентов для селекта
  useEffect(() => {
    let cancelled = false

    async function loadIngredients() {
      try {
        setLoadingOptions(true)
        const res = await axios.get(`${API_URL}/ingredients`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          validateStatus: () => true,
        })

        if (cancelled) return

        if (res.status < 200 || res.status >= 300) {
          // если эндпоинт отсутствует/закрыт — просто оставим без вариантов
          setIngredientsOptions([])
          return
        }

        const data = res.data as IngredientOption[] | { items?: IngredientOption[] }
        const list = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : []
        setIngredientsOptions(list)
      } catch {
        if (!cancelled) setIngredientsOptions([])
      } finally {
        if (!cancelled) setLoadingOptions(false)
      }
    }

    loadIngredients()
    return () => {
      cancelled = true
    }
  }, [token])

  function setField<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((p) => ({ ...p, [key]: value }))
    setApiError('')
    // чистим частично
    if (key in errors) {
      setErrors((p) => ({ ...p, [key as keyof Errors]: '' }))
    }
  }

  function validate(next: Form): Errors {
    const nextErrors: Errors = {
      title: '',
      description: '',
      cooking_time_minutes: '',
      difficulty: '',
      ingredients: '',
      instructions: '',
      image: '',
    }

    if (!next.title.trim()) nextErrors.title = 'Введите название рецепта'

    if (next.cooking_time_minutes === '')
      nextErrors.cooking_time_minutes = 'Укажите время готовки (в минутах)'
    else if (Number(next.cooking_time_minutes) <= 0)
      nextErrors.cooking_time_minutes = 'Время готовки должно быть больше 0'

    if (!next.difficulty.trim()) nextErrors.difficulty = 'Укажите сложность'

    // ингредиенты: хотя бы 1 строка с ingredient_id и quantity
    const meaningfulRows = next.ingredients.filter(
      (r) => r.ingredient_id !== '' || r.quantity !== '' || r.note.trim()
    )

    if (meaningfulRows.length === 0) {
      nextErrors.ingredients = 'Добавьте хотя бы один ингредиент'
    } else {
      const hasInvalid = meaningfulRows.some(
        (r) =>
          r.ingredient_id === '' ||
          r.ingredient_id === 0 ||
          r.quantity === '' ||
          Number(r.quantity) <= 0
      )
      if (hasInvalid)
        nextErrors.ingredients = 'Проверьте ингредиенты: выберите ингредиент и укажите количество'
    }

    // шаги: хотя бы 1 непустой
    const steps = next.instructions.map((s) => s.trim()).filter(Boolean)
    if (steps.length === 0) nextErrors.instructions = 'Добавьте хотя бы один шаг приготовления'

    // image опционально — оставим без ошибки

    return nextErrors
  }

  function updateIngredientRow(index: number, patch: Partial<IngredientRow>) {
    setForm((p) => {
      const rows = p.ingredients.slice()
      rows[index] = { ...rows[index], ...patch }
      return { ...p, ingredients: rows }
    })
    setErrors((p) => ({ ...p, ingredients: '' }))
    setApiError('')
  }

  function addIngredientRow() {
    setForm((p) => ({
      ...p,
      ingredients: [...p.ingredients, { ingredient_id: '', quantity: '', note: '' }],
    }))
    setApiError('')
  }

  function removeIngredientRow(index: number) {
    setForm((p) => {
      const rows = p.ingredients.slice()
      rows.splice(index, 1)
      return {
        ...p,
        ingredients: rows.length ? rows : [{ ingredient_id: '', quantity: '', note: '' }],
      }
    })
    setApiError('')
  }

  function updateStep(index: number, value: string) {
    setForm((p) => {
      const steps = p.instructions.slice()
      steps[index] = value
      return { ...p, instructions: steps }
    })
    setErrors((p) => ({ ...p, instructions: '' }))
    setApiError('')
  }

  function addStep() {
    setForm((p) => ({ ...p, instructions: [...p.instructions, ''] }))
    setApiError('')
  }

  function removeStep(index: number) {
    setForm((p) => {
      const steps = p.instructions.slice()
      steps.splice(index, 1)
      return { ...p, instructions: steps.length ? steps : [''] }
    })
    setApiError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setApiError('')

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      cooking_time_minutes: Number(form.cooking_time_minutes),
      difficulty: form.difficulty.trim(),
      ingredients: form.ingredients
        .filter((r) => r.ingredient_id !== '' || r.quantity !== '' || r.note.trim())
        .map((r) => ({
          ingredient_id: Number(r.ingredient_id),
          quantity: Number(r.quantity),
          note: r.note.trim(),
        })),
      instructions: form.instructions.map((s) => s.trim()).filter(Boolean),
      image: form.image.trim(),
    }

    try {
      setLoading(true)

      const res = await axios.post(`${API_URL}/recipes`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка создания рецепта')
      }

      console.log('CREATE RECIPE RESPONSE:', res.data)

      const createdId = res.data?.id
      if (createdId) navigate(`/recipes/${createdId}`)
      else navigate('/recipes')
    } catch (err) {
      if (err instanceof Error) {
        const msg = err.message || 'Неизвестная ошибка'
        console.error('CREATE RECIPE ERROR:', msg)
        setApiError(msg)
      } else {
        console.error('CREATE RECIPE ERROR: Неизвестная ошибка')
        setApiError('Неизвестная ошибка')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Создание рецепта</h1>
          <Link to="/recipes" className="text-sm font-medium text-green-700 hover:underline">
            К списку рецептов
          </Link>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
          {/* Основное */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-800">Название</label>
              <input
                className={`input mt-1 ${errors.title ? 'input-error' : ''}`}
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
              />
              <p className="field-error">{errors.title}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-800">Описание</label>
              <textarea
                className={`input mt-1 min-h-[96px] ${errors.description ? 'input-error' : ''}`}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
              />
              <p className="field-error">{errors.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">Время готовки (мин)</label>
              <input
                className={`input mt-1 ${errors.cooking_time_minutes ? 'input-error' : ''}`}
                type="number"
                min={1}
                value={form.cooking_time_minutes}
                onChange={(e) =>
                  setField(
                    'cooking_time_minutes',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
              />
              <p className="field-error">{errors.cooking_time_minutes}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800">Сложность</label>
              <select
                className={`input mt-1 ${errors.difficulty ? 'input-error' : ''}`}
                value={form.difficulty}
                onChange={(e) => setField('difficulty', e.target.value as RecipeDifficulty)}
              >
                {RECIPE_DIFFICULTIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="field-error">{errors.difficulty}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-800">Картинка</label>
              <input
                className={`input mt-1 ${errors.image ? 'input-error' : ''}`}
                value={form.image}
                onChange={(e) => setField('image', e.target.value)}
                placeholder="https://..."
              />
              <p className="field-error">{errors.image}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Ингредиенты</h2>
              <button className="btn-primary" type="button" onClick={addIngredientRow}>
                + Добавить
              </button>
            </div>

            <p className="mt-1 text-sm text-zinc-600">
              {loadingOptions
                ? 'Загружаю список ингредиентов...'
                : 'Выберите ингредиент и укажите количество.'}
            </p>

            <p className="field-error">{errors.ingredients}</p>

            <div className="mt-3 space-y-3">
              {form.ingredients.map((row, idx) => (
                <div
                  key={idx}
                  className="grid gap-3 rounded-xl border border-zinc-200 p-3 md:grid-cols-12"
                >
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-zinc-700">Ингредиент</label>
                    <select
                      className="input mt-1"
                      value={row.ingredient_id}
                      onChange={(e) =>
                        updateIngredientRow(idx, {
                          ingredient_id: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                    >
                      <option value="">— выбрать —</option>
                      {ingredientsOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    {!ingredientsOptions.length && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Если список пуст — проверь эндпоинт <code>/ingredients</code>.
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-zinc-700">Количество</label>
                    <input
                      className="input mt-1"
                      type="number"
                      min={0}
                      step="any"
                      value={row.quantity}
                      onChange={(e) =>
                        updateIngredientRow(idx, {
                          quantity: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-zinc-700">Примечание</label>
                    <input
                      className="input mt-1"
                      value={row.note}
                      onChange={(e) => updateIngredientRow(idx, { note: e.target.value })}
                      placeholder=""
                    />
                  </div>

                  <div className="md:col-span-1 md:flex md:items-end">
                    <button
                      type="button"
                      className="btn-primary w-full"
                      onClick={() => removeIngredientRow(idx)}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Инструкция */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Шаги приготовления</h2>
              <button className="btn-primary" type="button" onClick={addStep}>
                + Добавить шаг
              </button>
            </div>

            <p className="field-error">{errors.instructions}</p>

            <div className="mt-3 space-y-3">
              {form.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-700">Шаг {idx + 1}</label>
                    <input
                      className="input mt-1"
                      value={step}
                      onChange={(e) => updateStep(idx, e.target.value)}
                      placeholder="Опишите действие..."
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => removeStep(idx)}
                      title="Удалить шаг"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Link to="/recipes" className="text-sm font-medium text-zinc-700 hover:underline">
              Отмена
            </Link>

            <button
              className="btn-primary md:min-w-[220px]"
              type="submit"
              disabled={!isDirty || loading}
            >
              {loading ? 'Создаю...' : 'Создать рецепт'}
            </button>
          </div>

          {apiError && (
            <div className="alert-error" role="alert">
              {apiError}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
