import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../prisma.js';
import { validate, labelSchemas } from '../middlewares/validation.js';
import { adminMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    
    const where = {};
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [labels, total] = await Promise.all([
      prisma.label.findMany({
        where,
        include: {
          _count: {
            select: {
              issues: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.label.count({ where }),
    ]);
    
    res.json({
      labels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get labels error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch labels',
    });
  }
});

router.post('/', adminMiddleware, validate(labelSchemas.create), async (req, res) => {
  try {
    const { name, color } = req.body;

    const existingLabel = await prisma.label.findUnique({
      where: { name },
    });
    
    if (existingLabel) {
      return res.status(StatusCodes.CONFLICT).json({
        error: 'Label with this name already exists',
      });
    }
    
    const label = await prisma.label.create({
      data: {
        name,
        color: color || '#6b7280',
      },
    });
    
    res.status(StatusCodes.CREATED).json({ label });
  } catch (error) {
    console.error('Create label error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create label',
    });
  }
});

router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.label.delete({
      where: { id },
    });
    
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error('Delete label error:', error);
    
    if (error.code === 'P2025') {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Label not found',
      });
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete label',
    });
  }
});

export default router;