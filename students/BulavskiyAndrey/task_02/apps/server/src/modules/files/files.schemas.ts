import { z } from "zod";

export const createFileSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  filePath: z.string(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  category: z.string().max(50).optional()
});

