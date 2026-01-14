import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  isPinned: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(false)
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

