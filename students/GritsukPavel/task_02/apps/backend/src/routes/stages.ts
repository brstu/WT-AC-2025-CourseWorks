import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { createStageSchema, updateStageSchema } from '../validation/resourceSchemas';
import { requireAuth } from '../middleware/auth';
import { assertCanModify, assertCanRead, enforceUserRole } from '../lib/authorization';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
    if (!jobId) {
      return res
        .status(400)
        .json({
          status: 'error',
          error: { code: 'validation_failed', message: 'jobId is required' },
        });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Job not found' } });
    }
    assertCanRead(job.userId, req.user!);

    const stages = await prisma.stage.findMany({ where: { jobId }, orderBy: { order: 'asc' } });
    res.json({ status: 'ok', data: { stages } });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(createStageSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const { jobId } = req.body;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Job not found' } });
    }
    assertCanModify(job.userId, req.user!);

    const stage = await prisma.stage.create({
      data: {
        jobId,
        name: req.body.name,
        order: req.body.order,
        date: req.body.date ? new Date(req.body.date) : undefined,
      },
    });

    res.status(201).json({ status: 'ok', data: { stage } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const stage = await prisma.stage.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!stage) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Stage not found' } });
    }
    assertCanRead(stage.job.userId, req.user!);
    res.json({ status: 'ok', data: { stage } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateBody(updateStageSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const stage = await prisma.stage.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!stage) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Stage not found' } });
    }
    assertCanModify(stage.job.userId, req.user!);

    const updated = await prisma.stage.update({
      where: { id: stage.id },
      data: {
        name: req.body.name ?? stage.name,
        order: req.body.order ?? stage.order,
        date: req.body.date ? new Date(req.body.date) : stage.date,
      },
    });

    res.json({ status: 'ok', data: { stage: updated } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const stage = await prisma.stage.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!stage) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Stage not found' } });
    }
    assertCanModify(stage.job.userId, req.user!);

    await prisma.stage.delete({ where: { id: stage.id } });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export { router as stagesRouter };
