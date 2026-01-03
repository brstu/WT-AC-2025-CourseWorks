import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { JobStatus } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { enforceUserRole } from '../lib/authorization';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';

const router = Router();

router.use(requireAuth);

// Предопределённые колонки канбана
const KANBAN_COLUMNS = [
  { id: 'APPLIED', name: 'Отклик отправлен', color: '#3b82f6', order: 1 },
  { id: 'SCREENING', name: 'HR-скрининг', color: '#8b5cf6', order: 2 },
  { id: 'INTERVIEW', name: 'Интервью', color: '#f59e0b', order: 3 },
  { id: 'OFFER', name: 'Оффер', color: '#10b981', order: 4 },
  { id: 'REJECTED', name: 'Отказ', color: '#ef4444', order: 5 },
  { id: 'ARCHIVED', name: 'Архив', color: '#6b7280', order: 6 },
];

// GET /api/kanban - получить канбан-доску
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Получаем все вакансии пользователя
    const jobs = await prisma.job.findMany({
      where: { userId },
      include: {
        company: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Группируем вакансии по статусу
    const columns = KANBAN_COLUMNS.map((col) => ({
      ...col,
      jobs: jobs
        .filter((job) => job.status === col.id)
        .map((job) => ({
          id: job.id,
          title: job.title,
          companyId: job.companyId,
          companyName: job.company?.name || null,
          salary: job.salary,
          url: job.url,
          updatedAt: job.updatedAt,
        })),
    }));

    res.json({ status: 'ok', data: { columns } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/kanban/move - переместить вакансию в другую колонку
const moveJobSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED']),
});

router.put('/move', validateBody(moveJobSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const { jobId, status } = req.body;

    // Проверяем что вакансия принадлежит пользователю
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Job not found' } });
    }
    if (job.userId !== req.user!.id) {
      return res
        .status(403)
        .json({ status: 'error', error: { code: 'forbidden', message: 'Forbidden' } });
    }

    // Обновляем статус
    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status: status as JobStatus },
      include: { company: { select: { id: true, name: true } } },
    });

    res.json({
      status: 'ok',
      data: {
        job: {
          id: updated.id,
          title: updated.title,
          companyId: updated.companyId,
          companyName: updated.company?.name || null,
          status: updated.status,
          updatedAt: updated.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/kanban/columns - получить список колонок (для UI)
router.get('/columns', async (_req, res) => {
  res.json({ status: 'ok', data: { columns: KANBAN_COLUMNS } });
});

export { router as kanbanRouter };
