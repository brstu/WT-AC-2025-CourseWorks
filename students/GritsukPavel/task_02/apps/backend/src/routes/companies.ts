import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { createCompanySchema, updateCompanySchema } from '../validation/resourceSchemas';
import { requireAuth } from '../middleware/auth';
import { assertCanModify, assertCanRead, enforceUserRole } from '../lib/authorization';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const userIdFilter = typeof req.query.userId === 'string' ? req.query.userId : undefined;

    const scopeUserId = req.user!.role === 'admin' ? userIdFilter : req.user!.id;
    const where = scopeUserId ? { userId: scopeUserId } : {};

    const companies = await prisma.company.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Admin can read all; user already scoped
    if (req.user!.role !== 'admin' && req.user!.role !== 'user') {
      return res
        .status(403)
        .json({ status: 'error', error: { code: 'forbidden', message: 'Forbidden' } });
    }

    res.json({ status: 'ok', data: { companies } });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, validateBody(createCompanySchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const company = await prisma.company.create({
      data: {
        name: req.body.name,
        description: req.body.description ?? undefined,
        userId: req.user!.id,
      },
    });
    res.status(201).json({ status: 'ok', data: { company } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Company not found' } });
    }
    assertCanRead(company.userId, req.user!);
    res.json({ status: 'ok', data: { company } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateBody(updateCompanySchema), async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Company not found' } });
    }
    assertCanModify(company.userId, req.user!);

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: req.body.name ?? company.name,
        description: req.body.description ?? company.description,
      },
    });

    res.json({ status: 'ok', data: { company: updated } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    enforceUserRole(req.user!);
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'Company not found' } });
    }
    assertCanModify(company.userId, req.user!);

    await prisma.company.delete({ where: { id: company.id } });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

export { router as companiesRouter };
