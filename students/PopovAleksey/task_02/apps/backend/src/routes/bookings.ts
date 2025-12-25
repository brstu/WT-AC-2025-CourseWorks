import { BookingStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { assertNoConflicts, ensureDurationAllowed } from "../services/booking";
import { badRequest, forbidden } from "../lib/errors";

const router = Router();

const bookingCreateSchema = z.object({
  roomId: z.string().uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  purpose: z.string().min(1).max(500)
});

const bookingUpdateSchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date()
});

const statusEnum = z.nativeEnum(BookingStatus);

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const limitRaw = Number(req.query.limit ?? 50);
    const offsetRaw = Number(req.query.offset ?? 0);
    const limit = Number.isFinite(limitRaw) ? Math.min(limitRaw, 100) : 50;
    const offset = Number.isFinite(offsetRaw) ? offsetRaw : 0;
    const roomId = req.query.roomId ? String(req.query.roomId) : undefined;
    const status = req.query.status ? statusEnum.parse(req.query.status) : undefined;
    const userIdFilter = req.query.userId ? String(req.query.userId) : undefined;

    // enforce owner-only unless admin
    if (req.user?.role !== "admin") {
      if (userIdFilter && userIdFilter !== req.user?.id) {
        return next(forbidden("Недостаточно прав"));
      }
    }

    const where: any = {
      roomId: roomId || undefined,
      status: status || undefined,
      userId: req.user?.role === "admin" ? userIdFilter || undefined : req.user?.id
    };

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { startTime: "asc" },
        skip: offset,
        take: limit,
        include: { room: true }
      }),
      prisma.booking.count({ where })
    ]);

    return res.json({ data, total, limit, offset });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { room: true } });
    if (!booking) return res.status(404).json({ status: "error", message: "Booking not found" });
    if (req.user?.role !== "admin" && booking.userId !== req.user?.id) {
      return next(forbidden());
    }
    return res.json({ data: booking });
  } catch (err) {
    return next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = bookingCreateSchema.parse(req.body);
    const room = await prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) return res.status(404).json({ status: "error", message: "Room not found" });
    ensureDurationAllowed(req.user!.role, data.startTime, data.endTime);
    await assertNoConflicts({ roomId: data.roomId, startTime: data.startTime, endTime: data.endTime });

    const booking = await prisma.booking.create({
      data: {
        roomId: data.roomId,
        userId: req.user!.id,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
        status: BookingStatus.active
      }
    });

    return res.status(201).json({ data: booking });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = bookingUpdateSchema.parse(req.body);
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ status: "error", message: "Booking not found" });
    if (req.user?.role !== "admin" && booking.userId !== req.user?.id) {
      return next(forbidden());
    }
    if (booking.status !== BookingStatus.active) {
      return next(badRequest("Нельзя переносить неактивное бронирование"));
    }

    ensureDurationAllowed(req.user!.role, payload.startTime, payload.endTime);
    await assertNoConflicts({
      roomId: booking.roomId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      excludeBookingId: booking.id
    });

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        startTime: payload.startTime,
        endTime: payload.endTime
      }
    });
    return res.json({ data: updated });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ status: "error", message: "Booking not found" });
    if (req.user?.role !== "admin" && booking.userId !== req.user?.id) {
      return next(forbidden());
    }
    if (booking.status !== BookingStatus.active) {
      return next(badRequest("Бронирование уже отменено"));
    }

    await prisma.booking.update({ where: { id: booking.id }, data: { status: BookingStatus.cancelled } });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export { router as bookingsRouter };
