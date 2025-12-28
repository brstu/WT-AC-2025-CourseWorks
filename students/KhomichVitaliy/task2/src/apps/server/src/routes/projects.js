import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../prisma.js';
import { validate, projectSchemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    const where = {};

    if (req.user.role !== 'ADMIN') {
      where.creatorId = req.user.id;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              issues: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);
    
    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch projects',
    });
  }
});

router.post('/', validate(projectSchemas.create), async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        creatorId: req.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
    
    res.status(StatusCodes.CREATED).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create project',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        issues: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            labels: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Project not found',
      });
    }

    if (project.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch project',
    });
  }
});

router.put('/:id', validate(projectSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!existingProject) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Project not found',
      });
    }
    
    if (existingProject.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
    
    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update project',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!existingProject) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Project not found',
      });
    }
    
    if (existingProject.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    await prisma.project.delete({
      where: { id },
    });
    
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete project',
    });
  }
});

export default router;