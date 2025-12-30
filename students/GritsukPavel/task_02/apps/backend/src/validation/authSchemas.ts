import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(1, 'Введите корректное имя пользователя.'),
  email: z.string().email('Введите корректный email.'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов.')
});

export const loginSchema = z.object({
  email: z.string().email('Введите корректный email.'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов.')
});
