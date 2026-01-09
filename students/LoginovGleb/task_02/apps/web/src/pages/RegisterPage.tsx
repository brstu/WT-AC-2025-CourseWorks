import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts';
import { Button, Input, Alert, Card, CardBody, CardHeader } from '../components';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(50, 'Имя пользователя не должно превышать 50 символов'),
  email: z.string().email('Введите корректный email'),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      navigate('/applications', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="auth-card">
      <CardHeader>
        <h1 className="auth-card-title">Регистрация</h1>
        <p className="auth-card-subtitle">
          Создайте новый аккаунт для работы с заявками
        </p>
      </CardHeader>
      <CardBody>
        {error && (
          <Alert variant="error" onClose={() => setError(null)} className="auth-card-alert">
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} data-testid="register-form" className="auth-form">
          <Input
            label="Имя пользователя"
            type="text"
            placeholder="username"
            error={errors.username?.message}
            {...register('username')}
          />
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
          <Input
            label="Подтвердите пароль"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="auth-form-submit"
            data-testid="submit-btn"
          >
            Зарегистрироваться
          </Button>
        </form>
        <p className="auth-card-footer">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="auth-card-link">
            Войти
          </Link>
        </p>
      </CardBody>
    </Card>
  );
};
