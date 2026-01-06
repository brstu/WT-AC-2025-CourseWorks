import { z } from "zod";

const priorityEnum = z.enum(["low", "medium", "high"]);
const statusEnum = z.enum(["pending", "in_progress", "completed"]);

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  tagIds: z.array(z.string().uuid()).optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
  tagIds: z.array(z.string().uuid()).optional()
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskQuerySchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  tag: z.string().uuid().optional(),
  limit: z.string().optional(),
  offset: z.string().optional()
});

export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
