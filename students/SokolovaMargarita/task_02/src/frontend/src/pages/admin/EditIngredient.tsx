import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  type IngredientCategory,
  type IngredientUnit,
} from '../../constants/ingredients'

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

type IngredientFromApi = {
  id: number
  name: string
  category: string
  unit: string
  description: string
  calories_per_unit: number
  image: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function toCategory(value: string): IngredientCategory | '' {
  const ok = INGREDIENT_CATEGORIES.some((c) => c.value === value)
  return ok ? (value as IngredientCategory) : ''
}

function toUnit(value: string): IngredientUnit | '' {
  const ok = INGREDIENT_UNITS.some((u) => u.value === value)
  return ok ? (value as IngredientUnit) : ''
}

export default function EditIngredient() {
  // В роуте сделай параметр так же: /admin/ingredients/:ingredient_id/edit
  const { ingredient_id } = useParams<{ ingredient_id: string }>()

  const [form, setForm] = useState<IngredientForm>({
    name: '',
    category: '',
    unit: '',
    description: '',
    calories_per_unit: 0,
    image: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof IngredientForm, string>>>({})
  const [loading, setLoading] = useState(false) // загрузка ингредиента
  const [saving, setSaving] = useState(false) // сохранение
  const [apiError, setApiError] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  const idNum = Number(ingredient_id)
  const validId = Number.isFinite(idNum) && idNum > 0

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      String(form.category).trim().length > 0 &&
      String(form.unit).trim().length > 0 &&
      Number.isFinite(form.calories_per_unit) &&
      form.calories_per_unit >= 0
    )
  }, [form])

  function setField<K extends keyof IngredientForm>(key: K, value: IngredientForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setApiError('')
    setSuccessMsg('')
  }

  function validate(): boolean {
    const next: Partial<Record<keyof IngredientForm, string>> = {}

    if (!form.name.trim()) next.name = 'Введите название'
    if (!String(form.category).trim()) next.category = 'Выберите категорию'
    if (!String(form.unit).trim()) next.unit = 'Выберите единицу'

    if (!Number.isFinite(form.calories_per_unit)) next.calories_per_unit = 'Введите число'
    if (Number.isFinite(form.calories_per_unit) && form.calories_per_unit < 0)
      next.calories_per_unit = 'Не может быть меньше 0'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  useEffect(() => {
    void fetchIngredient()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredient_id])

  async function fetchIngredient() {
    setApiError('')
    setSuccessMsg('')

    if (!validId) {
      setApiError('Некорректный ID ингредиента в URL')
      return
    }

    try {
      setLoading(true)

      const token = localStorage.getItem('user_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.get(`${API_URL}/ingredients/${idNum}`, {
        headers,
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка загрузки ингредиента')
      }

      const data = res.data as IngredientFromApi

      setForm({
        name: String(data.name ?? ''),
        category: toCategory(String(data.category ?? '')),
        unit: toUnit(String(data.unit ?? '')),
        description: String(data.description ?? ''),
        calories_per_unit: Number.isFinite(Number(data.calories_per_unit))
          ? Number(data.calories_per_unit)
          : 0,
        image: String(data.image ?? ''),
      })
      setErrors({})
    } catch (err) {
      if (err instanceof Error) setApiError(err.message || 'Неизвестная ошибка')
      else setApiError('Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setApiError('')
    setSuccessMsg('')

    if (!validId) {
      setApiError('Некорректный ID ингредиента в URL')
      return
    }

    if (!validate()) return

    // ✅ Собираем ВСЕ поля из form (даже если пользователь ничего не менял)
    const payload: IngredientPayload = {
      name: form.name.trim(),
      category: String(form.category).trim(),
      unit: String(form.unit).trim(),
      description: form.description.trim(),
      calories_per_unit: Number(form.calories_per_unit) || 0,
      image: form.image.trim(),
    }

    try {
      setSaving(true)

      const token = localStorage.getItem('user_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.put(`${API_URL}/ingredients/${idNum}`, payload, {
        headers,
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка обновления ингредиента')
      }

      setSuccessMsg('Ингредиент успешно обновлён')
    } catch (err) {
      if (err instanceof Error) setApiError(err.message || 'Неизвестная ошибка')
      else setApiError('Неизвестная ошибка')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (key: keyof IngredientForm) => `input ${errors[key] ? 'input-error' : ''}`

  return (
    <div className="app-shell">
      <div className="mb-4">
        <Link className="text-2xl font-bold" to={'/admin/ingredients'}>
          Ингредиенты
        </Link>
        <p className="text-sm text-zinc-600">Редактирование ингредиента</p>
      </div>

      <div className="mx-auto w-full max-w-3xl p-4">
        <div className="card p-4">
          {loading ? (
            <div className="text-sm text-zinc-600">Загрузка...</div>
          ) : (
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
                    setField(
                      'calories_per_unit',
                      e.target.value === '' ? 0 : Number(e.target.value)
                    )
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
                <button type="submit" className="btn-primary" disabled={!canSubmit || saving}>
                  {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>

                <Link to="/admin/ingredients" className="btn-secondary">
                  Назад
                </Link>

                <button
                  type="button"
                  className="btn-secondary"
                  disabled={saving}
                  onClick={() => void fetchIngredient()}
                >
                  Сбросить к данным с сервера
                </button>
              </div>

              {apiError && (
                <div className="alert-error" role="alert">
                  {apiError}
                </div>
              )}

              {successMsg && (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  <div className="font-medium">{successMsg}</div>
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
          )}
        </div>
      </div>
    </div>
  )
}
