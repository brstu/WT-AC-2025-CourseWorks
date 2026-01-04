import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../lib/errors";
import { noteCreateSchema, noteUpdateSchema, paginationSchema } from "../lib/validation";
import { ensureNotebookAccess, ensureNoteAccess } from "../services/accessService";
import { Role } from "@prisma/client";

const router = Router();

const listSchema = paginationSchema.extend({
  notebookId: z.string().uuid(),
  labelId: z.string().uuid().optional()
});

router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid query", parsed.error.flatten().fieldErrors);
  }
  const { notebookId, labelId, limit, offset } = parsed.data;

  await ensureNotebookAccess(req.user!, notebookId, "read");

  if (labelId) {
    await validateLabelsOwnership([labelId], req.user!);
  }

  const where: any = { notebookId };
  if (labelId) {
    where.labels = { some: { labelId } };
  }

  const notes = await prisma.note.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: offset,
    take: limit,
    select: { id: true, title: true, content: true, notebookId: true, createdAt: true, updatedAt: true }
  });
  res.json({ status: "ok", data: notes });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const note = await ensureNoteAccess(req.user!, req.params.id, "read");
  const full = await prisma.note.findUnique({
    where: { id: note.id },
    select: {
      id: true,
      title: true,
      content: true,
      notebookId: true,
      createdAt: true,
      updatedAt: true,
      labels: { select: { label: { select: { id: true, name: true, color: true, isSystem: true, ownerId: true } } } }
    }
  });
  res.json({ status: "ok", data: full });
}));

router.post("/", asyncHandler(async (req, res) => {
  const parsed = noteCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  await ensureNotebookAccess(req.user!, parsed.data.notebookId, "write");

  const labelIds = Array.from(new Set(parsed.data.labelIds ?? []));
  if (labelIds.length > 0) {
    await validateLabelsOwnership(labelIds, req.user!);
  }

  const note = await prisma.note.create({
    data: {
      notebookId: parsed.data.notebookId,
      title: parsed.data.title,
      content: parsed.data.content ?? null,
      labels: {
        create: labelIds.map((labelId) => ({ label: { connect: { id: labelId } } }))
      }
    },
    select: { id: true, title: true, content: true, notebookId: true, createdAt: true, updatedAt: true }
  });

  res.status(201).json({ status: "ok", data: note });
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const parsed = noteUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const existing = await ensureNoteAccess(req.user!, req.params.id, "write");
  if (Object.keys(parsed.data).length === 0) {
    throw new HttpError(400, "validation_failed", "No fields to update");
  }

  const labelIds = parsed.data.labelIds ? Array.from(new Set(parsed.data.labelIds)) : undefined;
  if (labelIds && labelIds.length > 0) {
    await validateLabelsOwnership(labelIds, req.user!);
  }

  const shouldCreateHistory = parsed.data.content !== undefined && parsed.data.content !== existing.content;

  await prisma.$transaction(async (tx) => {
    if (shouldCreateHistory) {
      await tx.noteHistory.create({
        data: {
          noteId: existing.id,
          content: existing.content ?? "",
          editedById: req.user!.id
        }
      });
    }

    await tx.note.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title ?? undefined,
        content: parsed.data.content === undefined ? undefined : parsed.data.content ?? null
      }
    });

    if (labelIds) {
      await tx.noteLabel.deleteMany({ where: { noteId: existing.id } });
      if (labelIds.length > 0) {
        await tx.noteLabel.createMany({ data: labelIds.map((labelId) => ({ noteId: existing.id, labelId })) });
      }
    }
  });

  const updated = await prisma.note.findUnique({
    where: { id: existing.id },
    select: { id: true, title: true, content: true, notebookId: true, createdAt: true, updatedAt: true }
  });

  res.json({ status: "ok", data: updated });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const note = await ensureNoteAccess(req.user!, req.params.id, "read");
  await ensureNotebookAccess(req.user!, note.notebookId, "owner");
  await prisma.note.delete({ where: { id: note.id } });
  res.status(204).send();
}));

router.get("/:id/history", asyncHandler(async (req, res) => {
  const note = await ensureNoteAccess(req.user!, req.params.id, "read");
  const history = await prisma.noteHistory.findMany({
    where: { noteId: note.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, content: true, editedById: true, createdAt: true }
  });
  res.json({ status: "ok", data: history });
}));

router.post("/:id/history/:historyId/restore", asyncHandler(async (req, res) => {
  const note = await ensureNoteAccess(req.user!, req.params.id, "write");
  const history = await prisma.noteHistory.findFirst({
    where: { id: req.params.historyId, noteId: note.id }
  });
  if (!history) {
    throw new HttpError(404, "not_found", "History entry not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.noteHistory.create({
      data: {
        noteId: note.id,
        content: note.content ?? "",
        editedById: req.user!.id
      }
    });

    await tx.note.update({
      where: { id: note.id },
      data: { content: history.content }
    });
  });

  const updated = await prisma.note.findUnique({ where: { id: note.id }, select: { id: true, title: true, content: true, notebookId: true, createdAt: true, updatedAt: true } });
  res.json({ status: "ok", data: updated });
}));

async function validateLabelsOwnership(labelIds: string[], user: { id: string; role: Role }) {
  const labels = await prisma.label.findMany({ where: { id: { in: labelIds } } });
  if (labels.length !== labelIds.length) {
    throw new HttpError(404, "not_found", "One or more labels not found");
  }
  if (user.role === Role.admin) return;
  const invalid = labels.find((label) => !label.isSystem && label.ownerId !== user.id);
  if (invalid) {
    throw new HttpError(403, "forbidden", "Cannot use labels you do not own");
  }
}

export { router };
