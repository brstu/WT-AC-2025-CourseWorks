import axios from 'axios'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Form = { email: string; password: string }
type Errors = Form
type ApiErrorBody = { detail: string }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function Login() {
  const [form, setForm] = useState<Form>({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string>('')

  const isDirty = useMemo(() => Boolean(form.email || form.password), [form])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
    setApiError('')
  }

  function validate(nextForm: Form): Errors {
    const nextErrors: Errors = { email: '', password: '' }

    const email = nextForm.email.trim()

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
      email: form.email.trim(),
      password: form.password,
    }

    try {
      setLoading(true)

      const res = await axios.post(`${API_URL}/login`, payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      })

      if (res.status < 200 || res.status >= 300) {
        const data = res.data as Partial<ApiErrorBody> | undefined
        throw new Error(data?.detail ?? 'Ошибка входа')
      }

      console.log('LOGIN RESPONSE:', res.data)

      localStorage.setItem('user_token', res.data.user_token)
      window.location.reload()
    } catch (err) {
      if (err instanceof Error) {
        const msg = err.message || 'Неизвестная ошибка'
        console.error('LOGIN ERROR:', msg)
        setApiError(msg)
      } else {
        console.error('LOGIN ERROR: Неизвестная ошибка')
        setApiError('Неизвестная ошибка')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="card p-6">
        <h1 className="text-xl font-semibold">Вход</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
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
            {loading ? 'Отправка...' : 'Войти'}
          </button>

          {apiError && (
            <div className="alert-error" role="alert">
              {apiError}
            </div>
          )}

          <div className="text-center text-sm text-zinc-600">
            Нет аккаунта?{' '}
            <Link to="/register" className="font-medium text-green-700 hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
