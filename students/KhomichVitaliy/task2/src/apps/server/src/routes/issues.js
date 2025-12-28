import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../prisma.js';
import { validate, issueSchemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      projectId,
      status,
      priority,
      assigneeId,
      labelIds,
      search,
      page = 1,
      limit = 20,
    } = req.query;
    
    const where = {
      project: {
        ...(req.user.role !== 'ADMIN' && { creatorId: req.user.id }),
      },
    };
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }
    
    if (labelIds) {
      const labelArray = Array.isArray(labelIds) ? labelIds : [labelIds];
      where.labels = {
        some: {
          id: {
            in: labelArray,
          },
        },
      };
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          labels: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.issue.count({ where }),
    ]);
    
    res.json({
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch issues',
    });
  }
});

router.post('/', validate(issueSchemas.create), async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assigneeId,
      labelIds = [],
    } = req.body;
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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
    
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        creatorId: req.user.id,
        assigneeId,
        labels: {
          connect: labelIds.map(id => ({ id })),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        labels: true,
      },
    });
    

    const io = req.app.get('io');
    io.to(`project:${projectId}`).emit('issue-created', issue);
    
    res.status(StatusCodes.CREATED).json({ issue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create issue',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        labels: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    
    if (!issue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Issue not found',
      });
    }

    if (issue.project.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    res.json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch issue',
    });
  }
});

router.put('/:id', validate(issueSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      labelIds,
    } = req.body;

    const existingIssue = await prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
    
    if (!existingIssue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Issue not found',
      });
    }

    if (existingIssue.project.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId }),
    };
    
    const issue = await prisma.issue.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        labels: true,
      },
    });

    if (labelIds !== undefined) {
      await prisma.issue.update({
        where: { id },
        data: {
          labels: {
            set: labelIds.map(id => ({ id })),
          },
        },
      });
      
      issue.labels = await prisma.label.findMany({
        where: { id: { in: labelIds } },
      });
    }

    const io = req.app.get('io');
    io.to(`project:${issue.projectId}`).emit('issue-updated', issue);
    
    res.json({ issue });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update issue',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingIssue = await prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
    
    if (!existingIssue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Issue not found',
      });
    }

    if (existingIssue.project.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    await prisma.issue.delete({
      where: { id },
    });

    const io = req.app.get('io');
    io.to(`project:${existingIssue.projectId}`).emit('issue-deleted', id);
    
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete issue',
    });
  }
});

router.patch('/:id/status', validate(issueSchemas.updateStatus), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const existingIssue = await prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
    
    if (!existingIssue) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Issue not found',
      });
    }

    if (existingIssue.project.creatorId !== req.user.id && 
        existingIssue.assigneeId !== req.user.id && 
        req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    const issue = await prisma.issue.update({
      where: { id },
      data: { status },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const io = req.app.get('io');
    io.to(`project:${issue.projectId}`).emit('issue-status-updated', {
      id: issue.id,
      status: issue.status,
      updatedAt: issue.updatedAt,
    });
    
    res.json({ issue });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update issue status',
    });
  }
});

export default router;