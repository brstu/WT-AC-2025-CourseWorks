import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../prisma.js';
import { validate, commentSchemas } from '../middlewares/validation.js';

const router = express.Router();

router.get('/issues/:issueId/comments', async (req, res) => {
  try {
    const { issueId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { issueId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'asc' },
      }),
      prisma.comment.count({ where: { issueId } }),
    ]);
    
    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to fetch comments',
    });
  }
});

router.post('/issues/:issueId/comments', validate(commentSchemas.create), async (req, res) => {
  try {
    const { issueId } = req.params;
    const { content } = req.body;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        project: true,
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
    
    const comment = await prisma.comment.create({
      data: {
        content,
        issueId,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const io = req.app.get('io');
    io.to(`project:${issue.projectId}`).emit('comment-created', {
      ...comment,
      issueId,
    });
    
    res.status(StatusCodes.CREATED).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create comment',
    });
  }
});

router.put('/:id', validate(commentSchemas.update), async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        issue: {
          include: {
            project: true,
          },
        },
      },
    });
    
    if (!existingComment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Comment not found',
      });
    }

    if (existingComment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const io = req.app.get('io');
    io.to(`project:${existingComment.issue.projectId}`).emit('comment-updated', comment);
    
    res.json({ comment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to update comment',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        issue: {
          include: {
            project: true,
          },
        },
      },
    });
    
    if (!existingComment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: 'Comment not found',
      });
    }

    if (existingComment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: 'Access denied',
      });
    }
    
    await prisma.comment.delete({
      where: { id },
    });

    const io = req.app.get('io');
    io.to(`project:${existingComment.issue.projectId}`).emit('comment-deleted', id);
    
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to delete comment',
    });
  }
});

export default router;