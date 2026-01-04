import bcrypt from "bcrypt";
import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../lib/errors";
import { userCreateSchema, userUpdateSchema, paginationSchema } from "../lib/validation";
import { assertAdmin } from "../services/accessService";
import { config } from "../config";

const router = Router();

router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, role: true }
  });
  res.json({ status: "ok", data: user });
}));

router.get("/", requireAuth, asyncHandler(async (req, res) => {
  assertAdmin(req.user!);
  const parsed = paginationSchema.parse(req.query);
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    skip: parsed.offset,
    take: parsed.limit
  });
  res.json({ status: "ok", data: users });
}));

router.post("/", requireAuth, asyncHandler(async (req, res) => {
  assertAdmin(req.user!);
  const parsed = userCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }
  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) {
    throw new HttpError(409, "username_taken", "Username already exists");
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, config.bcryptSaltRounds);
  const user = await prisma.user.create({
    data: {
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role ?? Role.user
    },
    select: { id: true, username: true, role: true }
  });
  res.status(201).json({ status: "ok", data: user });
}));

router.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const isAdmin = req.user!.role === Role.admin;
  if (!isAdmin && req.user!.id !== targetId) {
    throw new HttpError(403, "forbidden", "Forbidden");
  }
  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, username: true, role: true }
  });
  if (!user) {
    throw new HttpError(404, "not_found", "User not found");
  }
  res.json({ status: "ok", data: user });
}));

router.put("/:id", requireAuth, asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const isAdmin = req.user!.role === Role.admin;
  if (!isAdmin && req.user!.id !== targetId) {
    throw new HttpError(403, "forbidden", "Forbidden");
  }

  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "validation_failed", "Invalid input", parsed.error.flatten().fieldErrors);
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    throw new HttpError(404, "not_found", "User not found");
  }

  const updates: { username?: string; passwordHash?: string; role?: Role } = {};
  if (parsed.data.username !== undefined) {
    if (parsed.data.username !== target.username) {
      const exists = await prisma.user.findUnique({ where: { username: parsed.data.username } });
      if (exists && exists.id !== targetId) {
        throw new HttpError(409, "username_taken", "Username already exists");
      }
    }
    updates.username = parsed.data.username;
  }
  if (parsed.data.password !== undefined) updates.passwordHash = await bcrypt.hash(parsed.data.password, config.bcryptSaltRounds);
  if (parsed.data.role !== undefined) {
    if (!isAdmin) {
      throw new HttpError(403, "forbidden", "Only admin can change roles");
    }
    updates.role = parsed.data.role as Role;
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, "validation_failed", "No fields to update");
  }

  const user = await prisma.user.update({
    where: { id: targetId },
    data: updates,
    select: { id: true, username: true, role: true }
  });
  res.json({ status: "ok", data: user });
}));

router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
  assertAdmin(req.user!);
  const targetId = req.params.id;
  if (targetId === req.user!.id) {
    throw new HttpError(400, "validation_failed", "Admin cannot delete self");
  }
  try {
    await prisma.user.delete({ where: { id: targetId } });
    res.status(204).send();
  } catch (err) {
    throw new HttpError(404, "not_found", "User not found");
  }
}));

export { router };
