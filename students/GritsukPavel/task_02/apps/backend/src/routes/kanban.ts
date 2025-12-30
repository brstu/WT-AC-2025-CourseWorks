import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userIdParam = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const scopeUserId = req.user!.role === 'admin' ? userIdParam ?? req.user!.id : req.user!.id;

    if (req.user!.role !== 'admin' && userIdParam && userIdParam !== req.user!.id) {
      return res.status(403).json({ status: 'error', error: { code: 'forbidden', message: 'Forbidden' } });
    }

    const [stages, jobs] = await Promise.all([
      prisma.stage.findMany({
        where: { job: { userId: scopeUserId } },
        orderBy: { order: 'asc' }
      }),
      prisma.job.findMany({
        where: { userId: scopeUserId },
        select: { id: true, title: true, companyId: true, currentStageId: true }
      })
    ]);

    const jobsByStage: Record<string, any[]> = {};
    for (const stage of stages) {
      jobsByStage[stage.id] = [];
    }

    for (const job of jobs) {
      if (job.currentStageId && jobsByStage[job.currentStageId]) {
        jobsByStage[job.currentStageId].push(job);
      }
    }

    const payload = stages.map((stage) => ({
      id: stage.id,
      jobId: stage.jobId,
      name: stage.name,
      order: stage.order,
      date: stage.date,
      jobs: jobsByStage[stage.id] || []
    }));

    res.json({ status: 'ok', data: { stages: payload } });
  } catch (error) {
    next(error);
  }
});

export { router as kanbanRouter };
