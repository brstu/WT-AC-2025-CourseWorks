import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { createJobSchema, updateJobSchema } from '../validation/resourceSchemas';
import { requireAuth } from '../middleware/auth';
import { assertCanModify, assertCanRead, enforceUserRole } from '../lib/authorization';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const userIdFilter = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const companyId = typeof req.query.companyId === 'string' ? req.query.companyId : undefined;
    const stageId = typeof req.query.stageId === 'string' ? req.query.stageId : undefined;

    const scopeUserId = req.user!.role === 'admin' ? userIdFilter : req.user!.id;
    const where: any = {};
    if (scopeUserId) where.userId = scopeUserId;
    if (companyId) where.companyId = companyId;
    if (stageId) where.currentStageId = stageId;

    const jobs = await prisma.job.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (req.user!.role !== 'admin' && req.user!.role !== 'user') {
      return res
        .status(403)
        .json({ status: 'error', error: { code: 'forbidden', message: 'Forbidden' } });
    }

    res.json({ status: 'ok', data: { jobs } });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(createJobSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const { companyId } = req.body;

    // Проверяем компанию если указана
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (!company) {
        return res
          .status(400)
          .json({
            status: 'error',
            error: { code: 'validation_failed', message: 'Company not found' },
          });
      }
      assertCanModify(company.userId, req.user!);
    }

    const job = await prisma.job.create({
      data: {
        title: req.body.title,
        companyId: companyId || null,
        userId: req.user!.id,
        status: req.body.status || 'APPLIED',
        salary: req.body.salary ?? undefined,
        location: req.body.location ?? undefined,
        url: req.body.url ?? undefined,
      },
      include: { company: true },
    });

    res.status(201).json({ status: 'ok', data: { job } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        stages: { orderBy: { order: 'asc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        reminders: { orderBy: { date: 'asc' } },
      },
    });
    if (!job) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Job not found' } });
    }
    assertCanRead(job.userId, req.user!);
    res.json({ status: 'ok', data: { job } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateBody(updateJobSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Job not found' } });
    }
    assertCanModify(job.userId, req.user!);

    if (req.body.companyId) {
      const company = await prisma.company.findUnique({ where: { id: req.body.companyId } });
      if (!company) {
        return res
          .status(400)
          .json({
            status: 'error',
            error: { code: 'validation_failed', message: 'Company not found' },
          });
      }
      assertCanModify(company.userId, req.user!);
    }

    if (req.body.currentStageId) {
      const stage = await prisma.stage.findUnique({ where: { id: req.body.currentStageId } });
      if (!stage || stage.jobId !== job.id) {
        return res
          .status(400)
          .json({
            status: 'error',
            error: { code: 'validation_failed', message: 'Stage does not belong to this job' },
          });
      }
    }

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        title: req.body.title ?? job.title,
        companyId: req.body.companyId !== undefined ? req.body.companyId : job.companyId,
        status: req.body.status ?? job.status,
        salary: req.body.salary ?? job.salary,
        location: req.body.location ?? job.location,
        url: req.body.url ?? job.url,
        currentStageId: req.body.currentStageId ?? job.currentStageId,
      },
    });

    res.json({ status: 'ok', data: { job: updated } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Job not found' } });
    }
    assertCanModify(job.userId, req.user!);

    await prisma.job.delete({ where: { id: job.id } });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export { router as jobsRouter };
