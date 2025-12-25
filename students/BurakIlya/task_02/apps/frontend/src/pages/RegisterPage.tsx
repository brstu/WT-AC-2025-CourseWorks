import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6)
});

export default function RegisterPage() {
  const { register: registerUser, loading, error } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<{ email: string; username: string; password: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: { email: string; username: string; password: string }) => {
    setFormError(null);
    try {
      await registerUser(values.email, values.username, values.password);
      navigate("/requests");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Не удалось зарегистрироваться");
    }
  };

  return (
    <div className="auth-page">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h2>Регистрация</h2>
        <p className="muted">Создайте новый аккаунт.</p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input type="email" placeholder="newuser@example.com" {...register("email")} />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </label>
          <label>
            Имя пользователя
            <input type="text" placeholder="newuser" {...register("username")} />
            {errors.username && <span className="error">{errors.username.message}</span>}
          </label>
          <label>
            Пароль
            <input type="password" placeholder="Минимум 6 символов" {...register("password")} />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </label>
          {formError || error ? <div className="error">{formError || error}</div> : null}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Создаём..." : "Зарегистрироваться"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
