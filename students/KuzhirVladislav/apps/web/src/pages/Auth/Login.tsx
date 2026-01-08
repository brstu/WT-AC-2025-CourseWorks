import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FormField from "../../components/UI/FormField";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const from = (location.state as any)?.from?.pathname || "/";

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username) errs.username = "Поле обязательно";
    if (!password) errs.password = "Поле обязательно";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await auth.login(username, password);
      nav(from, { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Вход</h1>
      <div className="card">
        <div className="form-row form-stack">
          <FormField
            ref={inputRef as any}
            label="Логин"
            name="username"
            value={username}
            onChange={(v) => setUsername(v)}
            placeholder="Логин"
            error={errors.username}
          />
          <FormField
            label="Пароль"
            name="password"
            type="password"
            value={password}
            onChange={(v) => setPassword(v)}
            placeholder="Пароль"
            error={errors.password}
          />
        </div>
        {error && <div style={{ color: "tomato", marginTop: 8 }}>{error}</div>}
        <div className="form-actions" style={{ marginTop: 12 }}>
          <button className="button" onClick={submit} disabled={loading}>
            {loading ? "Вхожу..." : "Войти"}
          </button>
          <button
            className="button secondary"
            onClick={() => nav("/auth/register", { state: { from: location.state?.from ?? from } })}
          >
            Регистрация
          </button>
        </div>
      </div>
    </div>
  );
}
