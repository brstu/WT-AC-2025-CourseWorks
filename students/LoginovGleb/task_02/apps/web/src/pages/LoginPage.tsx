import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts';
import { Button, Input, Alert, Card, CardBody, CardHeader } from '../components';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname || '/applications';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="auth-card">
      <CardHeader>
        <h1 className="auth-card-title">Вход в систему</h1>
        <p className="auth-card-subtitle">
          Введите ваши учётные данные для входа
        </p>
      </CardHeader>
      <CardBody>
        {error && (
          <Alert variant="error" onClose={() => setError(null)} className="auth-card-alert">
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form" className="auth-form">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="auth-form-submit"
            data-testid="submit-btn"
          >
            Войти
          </Button>
        </form>
        <p className="auth-card-footer">
          Нет аккаунта?{' '}
          <Link to="/register" className="auth-card-link">
            Зарегистрироваться
          </Link>
        </p>
      </CardBody>
    </Card>
  );
};
