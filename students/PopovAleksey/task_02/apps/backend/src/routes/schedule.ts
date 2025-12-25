import { BookingStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { findConflicts } from "../services/booking";

const router = Router();

const scheduleQuery = z.object({
  roomId: z.string().uuid(),
  date: z.coerce.date().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});

router.get("/", async (req, res, next) => {
  try {
    const params = scheduleQuery.parse(req.query);
    const where: any = { roomId: params.roomId, status: BookingStatus.active };
    if (params.date) {
      const day = params.date;
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      where.startTime = { lt: end };
      where.endTime = { gt: start };
    }
    if (params.from) where.endTime = { gt: params.from };
    if (params.to) where.startTime = { lt: params.to };
    const bookings = await prisma.booking.findMany({ where, orderBy: { startTime: "asc" }, include: { room: true } });
    return res.json({ data: bookings });
  } catch (err) {
    return next(err);
  }
});

const conflictQuery = z.object({
  roomId: z.string().uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
});

router.get("/conflicts", async (req, res, next) => {
  try {
    const params = conflictQuery.parse(req.query);
    const conflicts = await findConflicts(params);
    return res.json({ hasConflicts: conflicts.length > 0, conflicts });
  } catch (err) {
    return next(err);
  }
});

export { router as scheduleRouter };
