import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="logo">
            📮 Оффер где?
          </Link>
          {isAuthenticated && (
            <nav className="main-nav">
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Канбан
              </Link>
              <Link to="/companies" className={isActive('/companies') ? 'active' : ''}>
                Компании
              </Link>
              <Link to="/jobs" className={isActive('/jobs') ? 'active' : ''}>
                Вакансии
              </Link>
              <Link to="/reminders" className={isActive('/reminders') ? 'active' : ''}>
                Напоминания
              </Link>
              {user?.role === 'admin' && (
                <Link to="/users" className={isActive('/users') ? 'active' : ''}>
                  Пользователи
                </Link>
              )}
            </nav>
          )}
        </div>
        <div className="header-right">
          {isAuthenticated && user && (
            <>
              <span className="user-info">
                {user.email}
                {user.role === 'admin' && <span className="badge admin">Admin</span>}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Выйти
              </button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
