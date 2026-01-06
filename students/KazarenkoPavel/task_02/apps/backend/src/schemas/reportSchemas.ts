import { z } from "zod";

export const dateParamSchema = z.object({
  date: z.string().datetime(),
  userId: z.string().uuid().optional()
});

export const weekParamSchema = z.object({
  weekStart: z.string().datetime(),
  userId: z.string().uuid().optional()
});

export const monthParamSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  userId: z.string().uuid().optional()
});

export const rangeParamSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  userId: z.string().uuid().optional()
});

export const exportQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  format: z.enum(["csv", "json"]).default("json"),
  userId: z.string().uuid().optional()
});

export type ExportQueryInput = z.infer<typeof exportQuerySchema>;
