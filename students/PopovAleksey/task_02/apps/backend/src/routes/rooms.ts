import { BookingStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { badRequest } from "../lib/errors";

const router = Router();

const roomCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  capacity: z.number().int().positive(),
  equipment: z.string().optional(),
  location: z.string().min(1)
});

const roomUpdateSchema = roomCreateSchema.partial();

router.get("/", async (req, res, next) => {
  try {
    const capacity = req.query.capacity ? Number(req.query.capacity) : undefined;
    const equipment = req.query.equipment ? String(req.query.equipment) : undefined;
    const where: any = {};
    if (capacity !== undefined && !Number.isNaN(capacity)) where.capacity = { gte: capacity };
    if (equipment) where.equipment = { contains: equipment, mode: "insensitive" };
    const rooms = await prisma.room.findMany({ where, orderBy: { name: "asc" } });
    return res.json({ data: rooms });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) return res.status(404).json({ status: "error", message: "Room not found" });
    return res.json({ data: room });
  } catch (err) {
    return next(err);
  }
});

router.post("/", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const data = roomCreateSchema.parse(req.body);
    const room = await prisma.room.create({ data });
    return res.status(201).json({ data: room });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    const data = roomUpdateSchema.parse(req.body);
    if (Object.keys(data).length === 0) throw badRequest("No fields to update");
    const room = await prisma.room.update({ where: { id: req.params.id }, data });
    return res.json({ data: room });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res, next) => {
  try {
    // Soft rule: prevent delete if active bookings
    const active = await prisma.booking.count({ where: { roomId: req.params.id, status: BookingStatus.active } });
    if (active > 0) {
      return next(badRequest("Нельзя удалить аудиторию с активными бронированиями"));
    }
    await prisma.room.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export { router as roomsRouter };
