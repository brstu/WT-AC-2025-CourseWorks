import { z } from "zod";

export const createPollSchema = z.object({
  question: z.string().min(1).max(500),
  isAnonymous: z.boolean().optional().default(false),
  isMultipleChoice: z.boolean().optional().default(false),
  expiresAt: z.string().datetime().optional(),
  choices: z.array(z.object({ text: z.string().min(1).max(200) })).min(2).max(10)
});

export const voteSchema = z.object({
  choiceIds: z.array(z.string().uuid()).min(1)
});

