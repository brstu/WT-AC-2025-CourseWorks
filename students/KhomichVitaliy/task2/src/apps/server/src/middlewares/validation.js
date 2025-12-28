import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const errors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Validation failed',
      details: errors,
    });
  }
};

export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email(),
      username: z.string().min(3).max(50),
      password: z.string().min(6),
      name: z.string().optional(),
    }),
  }),
  
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
};

export const userSchemas = {
  update: z.object({
    body: z.object({
      name: z.string().optional(),
      avatarUrl: z.string().url().optional(),
    }),
    params: z.object({
      id: z.string(),
    }),
  }),
};

export const projectSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    }),
  }),
  
  update: z.object({
    body: z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional(),
      color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    }),
    params: z.object({
      id: z.string(),
    }),
  }),
};

export const issueSchemas = {
  create: z.object({
    body: z.object({
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      dueDate: z.string().datetime().optional(),
      projectId: z.string(),
      assigneeId: z.string().optional(),
      labelIds: z.array(z.string()).optional(),
    }),
  }),
  
  update: z.object({
    body: z.object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      dueDate: z.string().datetime().optional(),
      assigneeId: z.string().optional().nullable(),
      labelIds: z.array(z.string()).optional(),
    }),
    params: z.object({
      id: z.string(),
    }),
  }),
  
  updateStatus: z.object({
    body: z.object({
      status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']),
    }),
    params: z.object({
      id: z.string(),
    }),
  }),
};

export const commentSchemas = {
  create: z.object({
    body: z.object({
      content: z.string().min(1).max(1000),
    }),
    params: z.object({
      issueId: z.string(),
    }),
  }),
  
  update: z.object({
    body: z.object({
      content: z.string().min(1).max(1000),
    }),
    params: z.object({
      id: z.string(),
    }),
  }),
};

export const labelSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().min(1).max(50),
      color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    }),
  }),
};