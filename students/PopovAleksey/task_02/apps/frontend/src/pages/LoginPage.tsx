import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export function LoginPage() {
  const { register: reg, handleSubmit, formState } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Не удалось войти");
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <p className="muted">Доступ к бронированию аудиторий</p>
      {error && <div className="alert">{error}</div>}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label>Email</label>
          <input type="email" {...reg("email")}/>
          {formState.errors.email && <span className="error">{formState.errors.email.message}</span>}
        </div>
        <div className="field">
          <label>Пароль</label>
          <input type="password" {...reg("password")}/>
          {formState.errors.password && <span className="error">{formState.errors.password.message}</span>}
        </div>
        <button className="btn primary" type="submit" disabled={formState.isSubmitting}>Войти</button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>Нет аккаунта? <Link to="/register">Создать</Link></p>
    </div>
  );
}
