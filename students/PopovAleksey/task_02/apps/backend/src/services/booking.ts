import { BookingStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { badRequest, forbidden } from "../lib/errors";

function getDurationHours(start: Date, end: Date) {
  return (end.getTime() - start.getTime()) / 1000 / 60 / 60;
}

function ensureDurationAllowed(role: Role, start: Date, end: Date) {
  const hours = getDurationHours(start, end);
  if (hours <= 0) throw badRequest("endTime must be after startTime");
  if (role === "student" && hours > 2) throw forbidden("Студент может бронировать до 2 часов");
  if (role === "teacher" && hours > 4) throw forbidden("Преподаватель может бронировать до 4 часов");
}

export async function findConflicts(params: { roomId: string; startTime: Date; endTime: Date; excludeBookingId?: string }) {
  const { roomId, startTime, endTime, excludeBookingId } = params;
  return prisma.booking.findMany({
    where: {
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      roomId,
      status: BookingStatus.active,
      NOT: [{ endTime: { lte: startTime } }, { startTime: { gte: endTime } }]
    },
    orderBy: { startTime: "asc" }
  });
}

export async function assertNoConflicts(params: { roomId: string; startTime: Date; endTime: Date; excludeBookingId?: string }) {
  const conflicts = await findConflicts(params);
  if (conflicts.length > 0) {
    throw badRequest("Конфликт бронирований", { conflicts });
  }
}

export { ensureDurationAllowed };
