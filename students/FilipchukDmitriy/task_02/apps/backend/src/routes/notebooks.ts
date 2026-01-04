import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../lib/errors";
import { notebookCreateSchema, notebookUpdateSchema, paginationSchema } from "../lib/validation";
import { ensureNotebookAccess } from "../services/accessService";
import { Role } from "@prisma/client";

const router = Router();

const notebooksQuerySchema = paginationSchema.extend({
  shared: z.preprocess((v) => (v === "true" || v === true ? true : v === "false" || v === false ? false : undefined), z.boolean().optional()),
  ownerId: z.string().uuid().optional()
});

router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const parsed = notebooksQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid query", parsed.error.flatten().fieldErrors);
  }
  const { limit, offset, shared, ownerId } = parsed.data;
  const isAdmin = req.user!.role === Role.admin;

  const where: any = {};
  if (isAdmin) {
    if (ownerId) where.ownerId = ownerId;
    if (shared === true) {
      where.shares = { some: {} };
    }
  } else {
    if (shared === true) {
      where.shares = { some: { userId: req.user!.id } };
    } else {
      where.ownerId = req.user!.id;
    }
  }

  const notebooks = await prisma.notebook.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: offset,
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true
    }
  });
  res.json({ status: "ok", data: notebooks });
}));

router.post("/", asyncHandler(async (req, res) => {
  const parsed = notebookCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }
  const isAdmin = req.user!.role === Role.admin;
  const ownerId = isAdmin && typeof req.body.ownerId === "string" ? req.body.ownerId : req.user!.id;

  const notebook = await prisma.notebook.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      ownerId
    },
    select: { id: true, title: true, description: true, ownerId: true, createdAt: true, updatedAt: true }
  });
  res.status(201).json({ status: "ok", data: notebook });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const { notebook } = await ensureNotebookAccess(req.user!, req.params.id, "read");
  const full = await prisma.notebook.findUnique({
    where: { id: notebook.id },
    select: {
      id: true,
      title: true,
      description: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      notes: {
        select: { id: true, title: true, updatedAt: true }
      }
    }
  });
  res.json({ status: "ok", data: full });
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const parsed = notebookUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }
  await ensureNotebookAccess(req.user!, req.params.id, "owner");

  if (Object.keys(parsed.data).length === 0) {
    throw new HttpError(400, "validation_failed", "No fields to update");
  }

  const updated = await prisma.notebook.update({
    where: { id: req.params.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description === undefined ? undefined : parsed.data.description ?? null
    },
    select: { id: true, title: true, description: true, ownerId: true, createdAt: true, updatedAt: true }
  });
  res.json({ status: "ok", data: updated });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  await ensureNotebookAccess(req.user!, req.params.id, "owner");
  await prisma.notebook.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export { router };
