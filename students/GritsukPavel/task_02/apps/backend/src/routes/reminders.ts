import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { createReminderSchema, updateReminderSchema } from '../validation/resourceSchemas';
import { requireAuth } from '../middleware/auth';
import { assertCanModify, assertCanRead, enforceUserRole } from '../lib/authorization';

const router = Router();

// Map Prisma fields to API format
function mapReminderToApi(reminder: any) {
  return {
    id: reminder.id,
    jobId: reminder.jobId,
    message: reminder.title,
    remindAt: reminder.date,
    createdAt: reminder.createdAt,
    job: reminder.job,
  };
}

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
    const completed =
      typeof req.query.completed === 'string' ? req.query.completed === 'true' : undefined;
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    const userIdFilter = typeof req.query.userId === 'string' ? req.query.userId : undefined;

    const scopeUserId = req.user!.role === 'admin' ? userIdFilter : req.user!.id;
    const where: any = {
      job: scopeUserId ? { userId: scopeUserId } : undefined,
    };
    if (jobId) where.jobId = jobId;
    if (typeof completed === 'boolean') where.completed = completed;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    if (req.user!.role !== 'admin' && req.user!.role !== 'user') {
      return res
        .status(403)
        .json({ status: 'error', error: { code: 'forbidden', message: 'Forbidden' } });
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { job: { select: { id: true, title: true } } },
    });

    const mappedReminders = reminders.map(mapReminderToApi);
    res.json({ status: 'ok', data: { reminders: mappedReminders } });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(createReminderSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const job = await prisma.job.findUnique({ where: { id: req.body.jobId } });
    if (!job) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Job not found' } });
    }
    assertCanModify(job.userId, req.user!);

    const reminder = await prisma.reminder.create({
      data: {
        jobId: req.body.jobId,
        title: req.body.message || req.body.title,
        date: new Date(req.body.remindAt || req.body.date),
      },
    });

    res.status(201).json({ status: 'ok', data: { reminder: mapReminderToApi(reminder) } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id },
      include: { job: { select: { id: true, title: true, userId: true } } },
    });
    if (!reminder) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Reminder not found' } });
    }
    assertCanRead(reminder.job.userId, req.user!);
    res.json({ status: 'ok', data: { reminder: mapReminderToApi(reminder) } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateBody(updateReminderSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!reminder) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Reminder not found' } });
    }
    assertCanModify(reminder.job.userId, req.user!);

    const updated = await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        title: req.body.message || req.body.title || reminder.title,
        date: req.body.remindAt
          ? new Date(req.body.remindAt)
          : req.body.date
            ? new Date(req.body.date)
            : reminder.date,
        completed: req.body.completed ?? reminder.completed,
      },
    });

    res.json({ status: 'ok', data: { reminder: mapReminderToApi(updated) } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!reminder) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Reminder not found' } });
    }
    assertCanModify(reminder.job.userId, req.user!);

    await prisma.reminder.delete({ where: { id: reminder.id } });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export { router as remindersRouter };
