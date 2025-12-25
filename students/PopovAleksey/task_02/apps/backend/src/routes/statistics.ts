import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { forbidden } from "../lib/errors";

const router = Router();

const periodSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});

router.get("/rooms/:id", requireAuth, requireRole(["admin", "teacher"]), async (req, res, next) => {
  try {
    const { from, to } = periodSchema.parse(req.query);
    const where: any = { roomId: req.params.id, status: "active" };
    if (from) where.startTime = { gte: from };
    if (to) where.endTime = { lte: to };

    const bookings = await prisma.booking.findMany({ where, select: { startTime: true, endTime: true } });
    const totalBookings = bookings.length;
    const totalHours = bookings.reduce((acc, b) => acc + (b.endTime.getTime() - b.startTime.getTime()) / 36e5, 0);
    return res.json({
      roomId: req.params.id,
      totalBookings,
      totalHours
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/users/:id", requireAuth, async (req, res, next) => {
  try {
    const { from, to } = periodSchema.parse(req.query);
    if (req.user?.role !== "admin" && req.user?.id !== req.params.id) {
      return next(forbidden());
    }
    const where: any = { userId: req.params.id };
    if (from) where.startTime = { gte: from };
    if (to) where.endTime = { lte: to };
    const totalBookings = await prisma.booking.count({ where });
    return res.json({ userId: req.params.id, totalBookings });
  } catch (err) {
    return next(err);
  }
});

export { router as statisticsRouter };
