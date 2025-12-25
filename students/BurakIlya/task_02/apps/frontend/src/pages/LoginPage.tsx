import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<{ email: string; password: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: { email: string; password: string }) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      navigate("/requests");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Не удалось войти");
    }
  };

  return (
    <div className="auth-page">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h2>Вход</h2>
        <p className="muted">Используйте данные из seed или созданный аккаунт.</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input type="email" placeholder="user@example.com" {...register("email")} />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </label>
          <label>
            Пароль
            <input type="password" placeholder="Пароль" {...register("password")} />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </label>
          {formError || error ? <div className="error">{formError || error}</div> : null}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          Нет аккаунта? <Link to="/register">Регистрация</Link>
        </p>
      </div>
    </div>
  );
}
