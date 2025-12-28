import axios from 'axios'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Form = { name: string; email: string; password: string }
type ApiErrorBody = { detail: string }
type Errors = Form

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function Register() {
  const [form, setForm] = useState<Form>({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({ name: '', email: '', password: '' })

  const [loading, setLoading] = useState(false)

  const [apiError, setApiError] = useState<string>('')

  const isDirty = useMemo(() => Boolean(form.name || form.email || form.password), [form])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
  }

  function validate(nextForm: Form): Errors {
    const nextErrors: Errors = { name: '', email: '', password: '' }

    const name = nextForm.name.trim()
    const email = nextForm.email.trim()

    if (!name) nextErrors.name = 'Введите имя'
    else if (name.length < 2) nextErrors.name = 'Имя минимум 2 символа'

    if (!email) nextErrors.email = 'Введите почту'
    else if (!emailRegex.test(email)) nextErrors.email = 'Некорректная почта'

    if (!nextForm.password) nextErrors.password = 'Введите пароль'
    else if (nextForm.password.length < 6) nextErrors.password = 'Пароль минимум 6 символов'

    return nextErrors
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setApiError('')

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    }

    try {
      setLoading(true)

      const res = await axios.post(`${API_URL}/register`, payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        console.log(data)
        throw new Error(data?.detail ?? 'Ошибка регистрации')
      }

      console.log('REGISTER RESPONSE:', res.data)

      localStorage.setItem('user_token', res.data.user_token)
      window.location.reload()
    } catch (err) {
      if (err instanceof Error) {
        const msg = err.message || 'Неизвестная ошибка'

        console.error('REGISTER ERROR:', msg)
        setApiError(String(msg))
        return
      }

      console.log('REGISTER ERROR: Неизвестная ошибка')
      setApiError('Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="card p-6">
        <h1 className="text-xl font-semibold">Регистрация</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-zinc-800">Имя</label>
            <input
              className={`input mt-1 ${errors.name ? 'input-error' : ''}`}
              name="name"
              value={form.name}
              onChange={onChange}
            />
            <p className="field-error">{errors.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">Почта</label>
            <input
              className={`input mt-1 ${errors.email ? 'input-error' : ''}`}
              name="email"
              value={form.email}
              onChange={onChange}
            />
            <p className="field-error">{errors.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800">Пароль</label>
            <input
              className={`input mt-1 ${errors.password ? 'input-error' : ''}`}
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
            />
            <p className="field-error">{errors.password}</p>
          </div>

          <button className="btn-primary w-full" type="submit" disabled={!isDirty || loading}>
            {loading ? 'Отправка...' : 'Зарегистрироваться'}
          </button>

          {apiError && (
            <div className="alert-error" role="alert">
              {apiError}
            </div>
          )}

          <div className="text-center text-sm text-zinc-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-medium text-green-700 hover:underline">
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
