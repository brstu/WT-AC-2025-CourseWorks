import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа').max(50, 'Максимум 50 символов'),
  password: z.string().min(8, 'Минимум 8 символов').max(100, 'Максимум 100 символов'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа').max(50, 'Максимум 50 символов'),
  password: z.string().min(8, 'Минимум 8 символов').max(100, 'Максимум 100 символов'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export const notebookSchema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(200, 'Максимум 200 символов'),
  description: z.string().max(1000, 'Максимум 1000 символов').optional().nullable(),
});

export const noteSchema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(200, 'Максимум 200 символов'),
  content: z.string().max(5000, 'Максимум 5000 символов').optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const labelSchema = z.object({
  name: z.string().min(1, 'Обязательное поле').max(100, 'Максимум 100 символов'),
  color: z.string().max(50).optional().nullable(),
  isSystem: z.boolean().optional(),
});

export const shareSchema = z.object({
  userId: z.string().uuid('Выберите пользователя'),
  permission: z.enum(['read', 'write'], { required_error: 'Выберите права доступа' }),
});

export const userCreateSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа').max(50, 'Максимум 50 символов'),
  password: z.string().min(8, 'Минимум 8 символов').max(100, 'Максимум 100 символов'),
  role: z.enum(['admin', 'user']).optional(),
});

export const userUpdateSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа').max(50, 'Максимум 50 символов').optional(),
  password: z.string().min(8, 'Минимум 8 символов').max(100, 'Максимум 100 символов').optional().or(z.literal('')),
  role: z.enum(['admin', 'user']).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type NotebookFormData = z.infer<typeof notebookSchema>;
export type NoteFormData = z.infer<typeof noteSchema>;
export type LabelFormData = z.infer<typeof labelSchema>;
export type ShareFormData = z.infer<typeof shareSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
