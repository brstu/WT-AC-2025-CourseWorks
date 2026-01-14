import { z } from "zod";
import { ChatType } from "@prisma/client";

export const createChatSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.nativeEnum(ChatType).default(ChatType.group),
  isReadOnly: z.boolean().optional().default(false)
});

export const createMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  attachments: z.array(z.any()).optional().default([])
});

export const updateMessageSchema = z.object({
  content: z.string().min(1).max(5000)
});

