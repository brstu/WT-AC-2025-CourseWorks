import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../prisma.js';
import { adminMiddleware } from '../middlewares/auth.js';
import { validate, userSchemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch users',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'User not found',
      });
    }

    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch user',
    });
  }
});

router.put('/:id', validate(userSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatarUrl } = req.body;

    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(avatarUrl && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 'P2025') {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'User not found',
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update user',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    await prisma.user.delete({
      where: { id },
    });
    
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.code === 'P2025') {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'User not found',
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete user',
    });
  }
});

export default router;