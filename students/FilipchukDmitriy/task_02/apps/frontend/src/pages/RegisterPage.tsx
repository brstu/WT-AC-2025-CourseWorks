import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { registerSchema, type RegisterFormData } from '../lib/validation';
import { Button, Input } from '../components/ui';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      await registerUser(data.username, data.password);
      navigate('/notebooks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">📝</span>
          <h1 className="text-3xl font-bold text-gray-900">Пишем вдвоём</h1>
          <p className="text-gray-600 mt-2">Создайте аккаунт</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Имя пользователя"
              {...register('username')}
              error={errors.username?.message}
              placeholder="Минимум 3 символа"
              autoComplete="username"
            />

            <Input
              label="Пароль"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Минимум 8 символов"
              autoComplete="new-password"
            />

            <Input
              label="Подтвердите пароль"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Повторите пароль"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Зарегистрироваться
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
