import { z } from 'zod';

const uuid = z.string().uuid('Неверный идентификатор');

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Введите название компании.').max(100),
  description: z.string().max(1000).optional().nullable(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createJobSchema = z.object({
  title: z.string().min(1, 'Введите название вакансии.').max(200),
  companyId: uuid.optional().nullable(),
  status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED']).optional(),
  salary: z.string().max(50).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  url: z.string().url('Введите корректный URL.').optional().nullable(),
});

export const updateJobSchema = createJobSchema
  .extend({
    currentStageId: uuid.optional().nullable(),
    status: z
      .enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED'])
      .optional(),
  })
  .partial();

export const createStageSchema = z.object({
  jobId: uuid,
  name: z.string().min(1, 'Введите название этапа.').max(50),
  order: z.number().int().min(0, 'Укажите порядковый номер этапа.'),
  date: z.string().datetime().optional().nullable(),
});

export const updateStageSchema = createStageSchema.partial();

export const createNoteSchema = z.object({
  jobId: uuid,
  content: z.string().min(1, 'Заметка не может быть пустой.').max(5000),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Заметка не может быть пустой.').max(5000),
});

export const createReminderSchema = z
  .object({
    jobId: uuid,
    // Support both old (title/date) and new (message/remindAt) formats
    title: z.string().min(1).max(200).optional(),
    message: z.string().min(1, 'Введите текст напоминания.').max(200).optional(),
    date: z.string().datetime().optional(),
    remindAt: z.string().datetime().optional(),
  })
  .refine((data) => data.title || data.message, {
    message: 'Введите название напоминания.',
    path: ['message'],
  })
  .refine((data) => data.date || data.remindAt, {
    message: 'Укажите дату напоминания.',
    path: ['remindAt'],
  })
  .refine(
    (data) => {
      const dateValue = data.remindAt || data.date;
      return dateValue && new Date(dateValue) > new Date();
    },
    { message: 'Дата напоминания должна быть в будущем.', path: ['remindAt'] },
  );

export const updateReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(200).optional(),
  date: z.string().datetime().optional(),
  remindAt: z.string().datetime().optional(),
  completed: z.boolean().optional(),
});
