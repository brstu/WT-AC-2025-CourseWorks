import axios from 'axios'
import { useMemo, useState } from 'react'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  type IngredientCategory,
  type IngredientUnit,
} from '../../constants/ingredients'
import { Link } from 'react-router-dom'

type IngredientForm = {
  name: string
  category: IngredientCategory | ''
  unit: IngredientUnit | ''
  description: string
  calories_per_unit: number
  image: string
}

type IngredientPayload = {
  name: string
  category: string
  unit: string
  description: string
  calories_per_unit: number
  image: string
}

type ApiErrorBody = { detail: string }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function CreateIngredient() {
  const [form, setForm] = useState<IngredientForm>({
    name: '',
    category: '',
    unit: '',
    description: '',
    calories_per_unit: 0,
    image: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof IngredientForm, string>>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [createdId, setCreatedId] = useState<number | null>(null)

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.category.trim().length > 0 &&
      form.unit.trim().length > 0 &&
      Number.isFinite(form.calories_per_unit) &&
      form.calories_per_unit >= 0
    )
  }, [form])

  function setField<K extends keyof IngredientForm>(key: K, value: IngredientForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setApiError('')
    setSuccessMsg('')
    setCreatedId(null)
  }

  function validate(): boolean {
    const next: Partial<Record<keyof IngredientForm, string>> = {}

    if (!form.name.trim()) next.name = 'Введите название'
    if (!form.category.trim()) next.category = 'Выберите категорию'
    if (!form.unit.trim()) next.unit = 'Выберите единицу'

    if (!Number.isFinite(form.calories_per_unit)) next.calories_per_unit = 'Введите число'
    if (Number.isFinite(form.calories_per_unit) && form.calories_per_unit < 0)
      next.calories_per_unit = 'Не может быть меньше 0'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setApiError('')
    setSuccessMsg('')
    setCreatedId(null)

    if (!validate()) return

    const payload: IngredientPayload = {
      name: form.name.trim(),
      category: String(form.category).trim(),
      unit: String(form.unit).trim(),
      description: form.description.trim(),
      calories_per_unit: Number(form.calories_per_unit) || 0,
      image: form.image.trim(),
    }

    try {
      setLoading(true)

      const token = localStorage.getItem('user_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.post(`${API_URL}/ingredients`, payload, {
        headers,
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка создания ингредиента')
      }

      const idFromApi =
        res.data && typeof res.data === 'object' && 'id' in res.data ? Number(res.data.id) : null

      setCreatedId(Number.isFinite(idFromApi) ? idFromApi : null)
      setSuccessMsg('Ингредиент успешно добавлен')

      console.log('INGREDIENT CREATE RESPONSE:', res.data)

      setForm({
        name: '',
        category: '',
        unit: '',
        description: '',
        calories_per_unit: 0,
        image: '',
      })
      setErrors({})
    } catch (err) {
      if (err instanceof Error) {
        const msg = err.message || 'Неизвестная ошибка'
        console.error('INGREDIENT CREATE ERROR:', msg)
        setApiError(msg)
      } else {
        console.error('INGREDIENT CREATE ERROR: Неизвестная ошибка')
        setApiError('Неизвестная ошибка')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (key: keyof IngredientForm) => `input ${errors[key] ? 'input-error' : ''}`

  return (
    <div className="app-shell">
      <div className="mb-4">
        <Link className="text-2xl font-bold" to={'/admin/ingredients'}>
          Ингредиенты
        </Link>
        <p className="text-sm text-zinc-600">Создание ингредиента</p>
      </div>
      <div className="mx-auto w-full max-w-3xl p-4">
        <div className="card p-4">
          <form onSubmit={onSubmit} className="grid gap-4" noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium">Название *</label>
              <input
                className={inputClass('name')}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Например: Молоко"
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Категория *</label>
              <select
                className={inputClass('category')}
                value={form.category}
                onChange={(e) => setField('category', e.target.value as IngredientCategory | '')}
              >
                <option value="" disabled>
                  Выберите категорию
                </option>
                {INGREDIENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && <div className="field-error">{errors.category}</div>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Единица *</label>
              <select
                className={inputClass('unit')}
                value={form.unit}
                onChange={(e) => setField('unit', e.target.value as IngredientUnit | '')}
              >
                <option value="" disabled>
                  Выберите единицу
                </option>
                {INGREDIENT_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
              {errors.unit && <div className="field-error">{errors.unit}</div>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Описание</label>
              <textarea
                className={inputClass('description')}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Опционально"
                rows={4}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Калории на единицу *</label>
              <input
                type="number"
                min={0}
                step="any"
                className={inputClass('calories_per_unit')}
                value={Number.isFinite(form.calories_per_unit) ? form.calories_per_unit : 0}
                onChange={(e) =>
                  setField('calories_per_unit', e.target.value === '' ? 0 : Number(e.target.value))
                }
                placeholder="0"
              />
              {errors.calories_per_unit && (
                <div className="field-error">{errors.calories_per_unit}</div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Изображение (string)</label>
              <input
                className={inputClass('image')}
                value={form.image}
                onChange={(e) => setField('image', e.target.value)}
                placeholder="URL"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button type="submit" className="btn-primary" disabled={!canSubmit || loading}>
                {loading ? 'Отправка...' : 'Сохранить ингредиент'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={loading}
                onClick={() => {
                  setForm({
                    name: '',
                    category: '',
                    unit: '',
                    description: '',
                    calories_per_unit: 0,
                    image: '',
                  })
                  setErrors({})
                  setApiError('')
                }}
              >
                Сбросить
              </button>
            </div>

            {apiError && (
              <div className="alert-error" role="alert">
                {apiError}
              </div>
            )}

            {successMsg && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                <div className="font-medium">
                  {successMsg}
                  {createdId !== null ? ` (ID: ${createdId})` : ''}
                </div>
                <div className="mt-1">
                  <Link
                    to="/admin/ingredients"
                    className="font-medium text-green-700 hover:underline"
                  >
                    Перейти к списку ингредиентов
                  </Link>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
