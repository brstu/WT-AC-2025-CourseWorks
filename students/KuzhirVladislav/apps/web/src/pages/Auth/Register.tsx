import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authApi from "../../api/auth";
import FormField from "../../components/UI/FormField";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const from = (location.state as any)?.from?.pathname || "/";

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username) errs.username = "Обязательное поле";
    if (!password || password.length < 4) errs.password = "Пароль >= 4 символов";
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = "Неверный email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register({ username, password, email });
      nav("/auth/login", { state: { from: location.state?.from ?? from } });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Регистрация</h1>
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
            label="Email"
            name="email"
            value={email}
            onChange={(v) => setEmail(v)}
            placeholder="Email"
            error={errors.email}
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
            {loading ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
          <button
            className="button secondary"
            onClick={() => nav("/auth/login", { state: { from: location.state?.from ?? from } })}
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  );
}
