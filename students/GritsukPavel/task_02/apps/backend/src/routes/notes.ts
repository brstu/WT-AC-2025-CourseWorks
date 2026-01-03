import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { createNoteSchema, updateNoteSchema } from '../validation/resourceSchemas';
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

    const notes = await prisma.note.findMany({ where: { jobId }, orderBy: { createdAt: 'desc' } });
    res.json({ status: 'ok', data: { notes } });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBody(createNoteSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const job = await prisma.job.findUnique({ where: { id: req.body.jobId } });
    if (!job) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Job not found' } });
    }
    assertCanModify(job.userId, req.user!);

    const note = await prisma.note.create({
      data: {
        jobId: req.body.jobId,
        content: req.body.content,
      },
    });

    res.status(201).json({ status: 'ok', data: { note } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!note) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Note not found' } });
    }
    assertCanRead(note.job.userId, req.user!);
    res.json({ status: 'ok', data: { note } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateBody(updateNoteSchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!note) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Note not found' } });
    }
    assertCanModify(note.job.userId, req.user!);

    const updated = await prisma.note.update({
      where: { id: note.id },
      data: { content: req.body.content },
    });
    res.json({ status: 'ok', data: { note: updated } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!note) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Note not found' } });
    }
    assertCanModify(note.job.userId, req.user!);

    await prisma.note.delete({ where: { id: note.id } });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export { router as notesRouter };
