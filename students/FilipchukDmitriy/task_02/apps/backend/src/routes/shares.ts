import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../lib/errors";
import { shareCreateSchema, shareUpdateSchema, paginationSchema } from "../lib/validation";
import { ensureNotebookAccess } from "../services/accessService";
import { Role } from "@prisma/client";

const router = Router();

const listSchema = paginationSchema.extend({
  notebookId: z.string().uuid().optional(),
  userId: z.string().uuid().optional()
});

router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid query", parsed.error.flatten().fieldErrors);
  }
  const { limit, offset, notebookId, userId } = parsed.data;

  const isAdmin = req.user!.role === Role.admin;
  const where: any = {};

  if (notebookId) where.notebookId = notebookId;
  if (userId) where.userId = userId;

  if (!isAdmin) {
    if (notebookId) {
      await ensureNotebookAccess(req.user!, notebookId, "owner");
    } else if (userId) {
      if (userId !== req.user!.id) {
        throw new HttpError(403, "forbidden", "Forbidden");
      }
    } else {
      where.userId = req.user!.id;
    }
  }

  const shares = await prisma.share.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    select: { id: true, notebookId: true, userId: true, permission: true, createdAt: true }
  });
  res.json({ status: "ok", data: shares });
}));

router.post("/", asyncHandler(async (req, res) => {
  const parsed = shareCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }
  if (parsed.data.userId === req.user!.id) {
    throw new HttpError(400, "validation_failed", "Cannot share with yourself");
  }

  const { notebook } = await ensureNotebookAccess(req.user!, parsed.data.notebookId, "owner");

  const targetUser = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!targetUser) {
    throw new HttpError(404, "not_found", "Target user not found");
  }
  if (notebook.ownerId === targetUser.id) {
    throw new HttpError(400, "validation_failed", "Cannot share with notebook owner");
  }

  const existing = await prisma.share.findUnique({
    where: { notebookId_userId: { notebookId: parsed.data.notebookId, userId: parsed.data.userId } }
  });
  if (existing) {
    throw new HttpError(409, "conflict", "Share already exists");
  }

  const share = await prisma.share.create({
    data: {
      notebookId: parsed.data.notebookId,
      userId: parsed.data.userId,
      permission: parsed.data.permission
    },
    select: { id: true, notebookId: true, userId: true, permission: true, createdAt: true }
  });
  res.status(201).json({ status: "ok", data: share });
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const parsed = shareUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }
  const share = await prisma.share.findUnique({ where: { id: req.params.id } });
  if (!share) {
    throw new HttpError(404, "not_found", "Share not found");
  }

  await ensureNotebookAccess(req.user!, share.notebookId, "owner");

  const updated = await prisma.share.update({
    where: { id: share.id },
    data: { permission: parsed.data.permission },
    select: { id: true, notebookId: true, userId: true, permission: true, createdAt: true }
  });
  res.json({ status: "ok", data: updated });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const share = await prisma.share.findUnique({ where: { id: req.params.id } });
  if (!share) {
    throw new HttpError(404, "not_found", "Share not found");
  }

  const isAdmin = req.user!.role === Role.admin;
  const isOwner = share.userId === req.user!.id;
  let ownerAllowed = false;
  try {
    await ensureNotebookAccess(req.user!, share.notebookId, "owner");
    ownerAllowed = true;
  } catch (err) {
    ownerAllowed = false;
  }

  if (!isAdmin && !isOwner && !ownerAllowed) {
    throw new HttpError(403, "forbidden", "Forbidden");
  }

  await prisma.share.delete({ where: { id: share.id } });
  res.status(204).send();
}));

export { router };
