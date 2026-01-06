import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional()
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().optional()
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>;
