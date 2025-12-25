import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import classNames from "classnames";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const links = [
    { to: "/requests", label: "Запросы" },
    { to: "/volunteers", label: "Волонтёры" },
    { to: "/assignments", label: "Назначения" },
    { to: "/reviews", label: "Отзывы" },
    { to: "/categories", label: "Категории (admin)" }
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Помощь рядом</h1>
          <p className="subtitle">MVP · Вариант 43</p>
        </div>
        <div className="user-box">
          {user ? (
            <>
              <div className="user-meta">
                <strong>{user.username}</strong>
                <span>{user.email}</span>
                <span className="role">{user.role}</span>
              </div>
              <button className="btn" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : null}
        </div>
      </header>
      <div className="app-body">
        <nav className="sidebar">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => classNames("nav-link", { active: isActive })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
