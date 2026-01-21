import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/auth';
import { setToken } from '../app/authStore';
import { ApiError } from '../api/http';

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState('Test');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('qwerty123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerApi({ name, email, password });
      setToken(res.token);
      nav('/booking');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Регистрация</h2>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          Имя
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          Пароль (минимум 6 символов)
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            type="password"
          />
        </label>

        {error && (
          <div style={{ padding: 10, border: '1px solid #f99', background: '#ffecec' }}>
            {error}
          </div>
        )}

        <button disabled={loading} type="submit">
          {loading ? 'Создаём...' : 'Создать аккаунт'}
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <span>Уже есть аккаунт?</span>
          <Link to="/login">Войти</Link>
        </div>
      </form>
    </div>
  );
}
