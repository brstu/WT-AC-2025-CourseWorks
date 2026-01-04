import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../lib/errors";
import { labelCreateSchema, labelUpdateSchema, paginationSchema } from "../lib/validation";
import { Role } from "@prisma/client";

const router = Router();

const listSchema = paginationSchema.extend({
  ownerId: z.string().uuid().optional()
});

router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid query", parsed.error.flatten().fieldErrors);
  }
  const { limit, offset, ownerId } = parsed.data;

  let where: any;
  if (req.user!.role === Role.admin) {
    where = {};
    if (ownerId) where.ownerId = ownerId;
  } else {
    if (ownerId && ownerId !== req.user!.id) {
      throw new HttpError(403, "forbidden", "Forbidden");
    }
    if (ownerId) {
      where = { ownerId: req.user!.id };
    } else {
      where = { OR: [{ isSystem: true }, { ownerId: req.user!.id }] };
    }
  }

  const labels = await prisma.label.findMany({
    where,
    orderBy: { name: "asc" },
    skip: offset,
    take: limit,
    select: { id: true, name: true, color: true, isSystem: true, ownerId: true }
  });
  res.json({ status: "ok", data: labels });
}));

router.post("/", asyncHandler(async (req, res) => {
  const parsed = labelCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }
  const isSystem = parsed.data.isSystem === true;
  if (isSystem && req.user!.role !== Role.admin) {
    throw new HttpError(403, "forbidden", "Only admin can create system labels");
  }

  const label = await prisma.label.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color ?? null,
      isSystem,
      ownerId: isSystem ? null : req.user!.id
    },
    select: { id: true, name: true, color: true, isSystem: true, ownerId: true }
  });
  res.status(201).json({ status: "ok", data: label });
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const parsed = labelUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const label = await prisma.label.findUnique({ where: { id: req.params.id } });
  if (!label) {
    throw new HttpError(404, "not_found", "Label not found");
  }

  if (label.isSystem && req.user!.role !== Role.admin) {
    throw new HttpError(403, "forbidden", "Only admin can modify system labels");
  }
  if (!label.isSystem && req.user!.role !== Role.admin && label.ownerId !== req.user!.id) {
    throw new HttpError(403, "forbidden", "Cannot modify labels you do not own");
  }

  if (parsed.data.isSystem !== undefined && req.user!.role !== Role.admin) {
    throw new HttpError(403, "forbidden", "Only admin can change system flag");
  }

  if (Object.keys(parsed.data).length === 0) {
    throw new HttpError(400, "validation_failed", "No fields to update");
  }

  const updated = await prisma.label.update({
    where: { id: req.params.id },
    data: {
      name: parsed.data.name ?? undefined,
      color: parsed.data.color === undefined ? undefined : parsed.data.color ?? null,
      isSystem: parsed.data.isSystem ?? undefined
    },
    select: { id: true, name: true, color: true, isSystem: true, ownerId: true }
  });
  res.json({ status: "ok", data: updated });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const label = await prisma.label.findUnique({ where: { id: req.params.id } });
  if (!label) {
    throw new HttpError(404, "not_found", "Label not found");
  }
  if (label.isSystem && req.user!.role !== Role.admin) {
    throw new HttpError(403, "forbidden", "Only admin can delete system labels");
  }
  if (!label.isSystem && req.user!.role !== Role.admin && label.ownerId !== req.user!.id) {
    throw new HttpError(403, "forbidden", "Cannot delete labels you do not own");
  }
  await prisma.label.delete({ where: { id: label.id } });
  res.status(204).send();
}));

export { router };
