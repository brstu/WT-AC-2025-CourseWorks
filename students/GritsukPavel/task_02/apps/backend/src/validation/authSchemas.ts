import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(1, 'Введите корректное имя пользователя.'),
  email: z.string().email('Введите корректный email.'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов.')
    .regex(/[A-Z]/, 'Добавьте хотя бы одну заглавную букву.')
    .regex(/[a-z]/, 'Добавьте хотя бы одну строчную букву.')
    .regex(/[0-9]/, 'Добавьте хотя бы одну цифру.')
    .regex(/[!@#$%^&*]/, 'Добавьте хотя бы один спецсимвол (!@#$%^&*).'),
});

export const loginSchema = z.object({
  email: z.string().email('Введите корректный email.'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов.'),
});
