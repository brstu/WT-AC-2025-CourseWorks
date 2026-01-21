import { Outlet, Link, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from './app/authStore';
import { useEffect, useState } from 'react';

export default function App() {
  const nav = useNavigate();
  const [token, setTok] = useState<string | null>(getToken());

  useEffect(() => {
    const onChange = () => setTok(getToken());
    window.addEventListener('bb_auth_changed', onChange);
    return () => window.removeEventListener('bb_auth_changed', onChange);
  }, []);

  const onLogout = () => {
    clearToken();
    nav('/login');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/booking" style={{ fontWeight: 700, textDecoration: 'none' }}>
            Запишите меня
          </Link>
          <Link to="/booking">Бронь</Link>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!token ? (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
            </>
          ) : (
            <button onClick={onLogout}>Выйти</button>
          )}
        </div>
      </header>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
