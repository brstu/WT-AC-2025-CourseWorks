import { z } from "zod";

const username = z.string().min(3).max(50);
const password = z.string().min(8).max(100);

export const registerSchema = z.object({
  username,
  password
});

export const loginSchema = z.object({
  username,
  password
});

export const paginationSchema = z.object({
  limit: z.preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().int().min(1).max(100).default(50)),
  offset: z.preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().int().min(0).default(0))
});

export const userCreateSchema = z.object({
  username,
  password,
  role: z.enum(["admin", "user"]).optional()
});

export const userUpdateSchema = z.object({
  username: username.optional(),
  password: password.optional(),
  role: z.enum(["admin", "user"]).optional()
});

export const notebookCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable()
});

export const notebookUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable()
});

export const noteCreateSchema = z.object({
  notebookId: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().max(5000).optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional()
});

export const noteUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(5000).optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional()
});

export const labelCreateSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().max(50).optional().nullable(),
  isSystem: z.boolean().optional()
});

export const labelUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().max(50).optional().nullable(),
  isSystem: z.boolean().optional()
});

export const shareCreateSchema = z.object({
  notebookId: z.string().uuid(),
  userId: z.string().uuid(),
  permission: z.enum(["read", "write"])
});

export const shareUpdateSchema = z.object({
  permission: z.enum(["read", "write"])
});
