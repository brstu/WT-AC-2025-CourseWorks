import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">Room Booking</div>
        <nav>
          {user ? (
            <div className="flex">
              <span className="muted">{user.username} · {user.role}</span>
              <button className="btn secondary" onClick={logout}>Выйти</button>
            </div>
          ) : (
            <div className="flex">
              <NavLink to="/login">Войти</NavLink>
              <NavLink to="/register">Регистрация</NavLink>
            </div>
          )}
        </nav>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div className="nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Главная</NavLink>
            <NavLink to="/rooms" className={({ isActive }) => (isActive ? "active" : "")}>Аудитории</NavLink>
            <NavLink to="/bookings" className={({ isActive }) => (isActive ? "active" : "")}>Бронирования</NavLink>
            <NavLink to="/schedule" className={({ isActive }) => (isActive ? "active" : "")}>Расписание</NavLink>
          </div>
        </aside>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
