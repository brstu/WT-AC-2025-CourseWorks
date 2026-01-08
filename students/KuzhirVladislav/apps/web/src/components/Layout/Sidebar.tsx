import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const linkStyle = () => ({
  display: "block",
  padding: "8px 10px",
  borderRadius: 6,
  color: "var(--text)",
  textDecoration: "none",
  marginBottom: 6,
});

export default function Sidebar() {
  const auth = useAuth();
  const nav = useNavigate();

  const openLogin = () =>
    nav("/auth/login", { replace: true, state: { from: window.location.pathname } });
  const openRegister = () =>
    nav("/auth/register", { replace: true, state: { from: window.location.pathname } });

  return (
    <aside>
      <nav>
        <h3>Навигация</h3>
        <div className="links">
          {auth.token && (
            <NavLink
              to="/"
              style={linkStyle}
              className={({ isActive }) => (isActive ? "navlink-active" : "navlink")}
            >
              Дашборд
            </NavLink>
          )}
          {auth.token ? (
            <>
              <NavLink
                to="/clients"
                style={linkStyle}
                className={({ isActive }) => (isActive ? "navlink-active" : "navlink")}
              >
                Клиенты
              </NavLink>
              <NavLink
                to="/deals"
                style={linkStyle}
                className={({ isActive }) => (isActive ? "navlink-active" : "navlink")}
              >
                Сделки
              </NavLink>
              <NavLink
                to="/stages"
                style={linkStyle}
                className={({ isActive }) => (isActive ? "navlink-active" : "navlink")}
              >
                Этапы
              </NavLink>
              <NavLink
                to="/tasks"
                style={linkStyle}
                className={({ isActive }) => (isActive ? "navlink-active" : "navlink")}
              >
                Задачи
              </NavLink>
              <NavLink
                to="/invoices"
                style={linkStyle}
                className={({ isActive }) => (isActive ? "navlink-active" : "navlink")}
              >
                Счета
              </NavLink>
            </>
          ) : (
            <>
              <div style={{ color: "var(--muted)", marginTop: 8 }}>
                Войдите, чтобы увидеть все разделы
              </div>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          {!auth.token ? (
            <>
              <button className="button" onClick={openLogin}>
                Войти
              </button>
              <button className="button secondary" onClick={openRegister}>
                Регистрация
              </button>
            </>
          ) : (
            <>
              <button
                className="button"
                onClick={() => {
                  auth.logout();
                  nav("/");
                }}
              >
                Выйти
              </button>
            </>
          )}
        </div>
      </nav>
    </aside>
  );
}
