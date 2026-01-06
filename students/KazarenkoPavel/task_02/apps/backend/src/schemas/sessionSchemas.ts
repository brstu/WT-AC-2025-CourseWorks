import { z } from "zod";

const sessionTypeEnum = z.enum(["pomodoro", "short_break", "long_break"]);
const sessionStatusEnum = z.enum(["running", "paused", "completed", "interrupted"]);

export const createSessionSchema = z.object({
  taskId: z.string().uuid().optional(),
  sessionType: sessionTypeEnum,
  duration: z.number().int().positive().optional()
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = z.object({
  status: z.enum(["completed", "interrupted"]),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().positive().optional()
});

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

export const pauseSessionSchema = z.object({});
export const resumeSessionSchema = z.object({});

export const sessionQuerySchema = z.object({
  taskId: z.string().uuid().optional(),
  status: sessionStatusEnum.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.string().optional(),
  offset: z.string().optional()
});

export type SessionQueryInput = z.infer<typeof sessionQuerySchema>;
