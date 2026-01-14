import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { buildPagination } from "../../lib/pagination.js";
import { requireMembership } from "../groups/groups.service.js";
import { MembershipRole, EventType } from "@prisma/client";

export const getEvents = async (
  groupId: string,
  userId: string,
  page?: number | string,
  pageSize?: number | string,
  startDate?: string,
  endDate?: string
) => {
  const { skip, take } = buildPagination(page, pageSize);
  await requireMembership(userId, groupId);

  const where: any = { groupId };
  if (startDate) {
    where.startAt = { gte: new Date(startDate) };
  }
  if (endDate) {
    where.endAt = { lte: new Date(endDate) };
  }

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: { startAt: "asc" },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    }),
    prisma.event.count({ where })
  ]);

  return { items, total };
};

export const getEvent = async (groupId: string, id: string, userId: string) => {
  await requireMembership(userId, groupId);

  const event = await prisma.event.findFirst({
    where: { id, groupId },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!event) {
    throw new AppError(404, "Event not found", "not_found");
  }

  return event;
};

export const createEvent = async (
  groupId: string,
  userId: string,
  data: { title: string; description?: string; startAt: string; endAt: string; location?: string; type: EventType }
) => {
  await requireMembership(userId, groupId, [MembershipRole.admin, MembershipRole.moderator, MembershipRole.member]);

  const event = await prisma.event.create({
    data: {
      groupId,
      creatorId: userId,
      title: data.title,
      description: data.description,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      location: data.location,
      type: data.type
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return event;
};

export const updateEvent = async (
  groupId: string,
  id: string,
  userId: string,
  data: Partial<{ title: string; description: string; startAt: string; endAt: string; location: string; type: EventType }>
) => {
  const event = await prisma.event.findFirst({
    where: { id, groupId }
  });

  if (!event) {
    throw new AppError(404, "Event not found", "not_found");
  }

  const membership = await requireMembership(userId, groupId);
  if (event.creatorId !== userId && membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
    throw new AppError(403, "You can only edit your own events", "forbidden");
  }

  const updateData: any = {};
  if (data.title) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startAt) updateData.startAt = new Date(data.startAt);
  if (data.endAt) updateData.endAt = new Date(data.endAt);
  if (data.location !== undefined) updateData.location = data.location;
  if (data.type) updateData.type = data.type;

  const updated = await prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return updated;
};

export const deleteEvent = async (groupId: string, id: string, userId: string) => {
  const event = await prisma.event.findFirst({
    where: { id, groupId }
  });

  if (!event) {
    throw new AppError(404, "Event not found", "not_found");
  }

  const membership = await requireMembership(userId, groupId);
  if (event.creatorId !== userId && membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
    throw new AppError(403, "You can only delete your own events", "forbidden");
  }

  await prisma.event.delete({ where: { id } });
};

