import { z } from 'zod';

const uuid = z.string().uuid('Неверный идентификатор');

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Введите название компании.').max(100),
  description: z.string().max(1000).optional().nullable()
});

export const updateCompanySchema = createCompanySchema.partial();

export const createJobSchema = z.object({
  title: z.string().min(1, 'Введите название вакансии.').max(200),
  companyId: uuid,
  salary: z.string().max(50).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  url: z.string().url('Введите корректный URL.').optional().nullable()
});

export const updateJobSchema = createJobSchema.extend({
  currentStageId: uuid.optional().nullable()
}).partial();

export const createStageSchema = z.object({
  jobId: uuid,
  name: z.string().min(1, 'Введите название этапа.').max(50),
  order: z.number().int().min(0, 'Укажите порядковый номер этапа.'),
  date: z.string().datetime().optional().nullable()
});

export const updateStageSchema = createStageSchema.partial();

export const createNoteSchema = z.object({
  jobId: uuid,
  content: z.string().min(1, 'Заметка не может быть пустой.').max(5000)
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Заметка не может быть пустой.').max(5000)
});

export const createReminderSchema = z.object({
  jobId: uuid,
  title: z.string().min(1, 'Введите название напоминания.').max(200),
  date: z.string().datetime().refine((value) => new Date(value) > new Date(), 'Дата напоминания должна быть в будущем.')
});

export const updateReminderSchema = z.object({
  title: z.string().min(1, 'Введите название напоминания.').max(200).optional(),
  date: z.string().datetime().optional(),
  completed: z.boolean().optional()
});