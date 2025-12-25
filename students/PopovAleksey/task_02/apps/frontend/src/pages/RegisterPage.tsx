import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100)
});

export function RegisterPage() {
  const { register: reg, handleSubmit, formState } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", username: "", password: "" }
  });
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setError(null);
    try {
      await registerUser(data.email, data.username, data.password);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message || "Не удалось зарегистрироваться");
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <p className="muted">Создайте аккаунт для бронирования аудиторий</p>
      {error && <div className="alert">{error}</div>}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label>Email</label>
          <input type="email" {...reg("email")}/>
          {formState.errors.email && <span className="error">{formState.errors.email.message}</span>}
        </div>
        <div className="field">
          <label>Имя пользователя</label>
          <input type="text" {...reg("username")}/>
          {formState.errors.username && <span className="error">{formState.errors.username.message}</span>}
        </div>
        <div className="field">
          <label>Пароль</label>
          <input type="password" {...reg("password")}/>
          {formState.errors.password && <span className="error">{formState.errors.password.message}</span>}
        </div>
        <button className="btn primary" type="submit" disabled={formState.isSubmitting}>Создать аккаунт</button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  );
}
