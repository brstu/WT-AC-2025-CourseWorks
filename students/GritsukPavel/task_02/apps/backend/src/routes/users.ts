import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../lib/authorization';

const router = Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'User not found' } });
    }

    res.status(200).json({ status: 'ok', data: { user } });
  } catch (error) {
    next(error);
  }
});

// Admin: list all users
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ status: 'ok', data: { users } });
  } catch (error) {
    next(error);
  }
});

// Admin: delete user
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user!.id) {
      return res
        .status(400)
        .json({
          status: 'error',
          error: { code: 'validation_failed', message: 'Cannot delete yourself' },
        });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res
        .status(404)
        .json({ status: 'error', error: { code: 'not_found', message: 'User not found' } });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ status: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

export { router as usersRouter };
