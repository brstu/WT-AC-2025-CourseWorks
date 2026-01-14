import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { buildPagination } from "../../lib/pagination.js";
import { requireMembership } from "../groups/groups.service.js";
import { MembershipRole } from "@prisma/client";

export const getAnnouncements = async (
  groupId: string,
  userId: string,
  page?: number | string,
  pageSize?: number | string
) => {
  const { skip, take } = buildPagination(page, pageSize);
  const membership = await requireMembership(userId, groupId);
  
  const where: any = { groupId };
  if (membership === MembershipRole.guest) {
    where.isPublic = true;
  }

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take,
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    }),
    prisma.announcement.count({ where })
  ]);

  return { items, total };
};

export const getAnnouncement = async (groupId: string, id: string, userId: string) => {
  const membership = await requireMembership(userId, groupId);
  
  const announcement = await prisma.announcement.findFirst({
    where: {
      id,
      groupId,
      ...(membership === MembershipRole.guest ? { isPublic: true } : {})
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!announcement) {
    throw new AppError(404, "Announcement not found", "not_found");
  }

  return announcement;
};

export const createAnnouncement = async (
  groupId: string,
  userId: string,
  data: { title: string; content: string; isPinned?: boolean; isPublic?: boolean }
) => {
  await requireMembership(userId, groupId, [MembershipRole.admin, MembershipRole.moderator, MembershipRole.member]);
  
  const announcement = await prisma.announcement.create({
    data: {
      groupId,
      authorId: userId,
      title: data.title,
      content: data.content,
      isPinned: data.isPinned ?? false,
      isPublic: data.isPublic ?? false,
      publishedAt: new Date()
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return announcement;
};

export const updateAnnouncement = async (
  groupId: string,
  id: string,
  userId: string,
  data: Partial<{ title: string; content: string; isPinned: boolean; isPublic: boolean }>
) => {
  const announcement = await prisma.announcement.findFirst({
    where: { id, groupId }
  });

  if (!announcement) {
    throw new AppError(404, "Announcement not found", "not_found");
  }

  const membership = await requireMembership(userId, groupId);
  if (announcement.authorId !== userId && membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
    throw new AppError(403, "You can only edit your own announcements", "forbidden");
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return updated;
};

export const deleteAnnouncement = async (groupId: string, id: string, userId: string) => {
  const announcement = await prisma.announcement.findFirst({
    where: { id, groupId }
  });

  if (!announcement) {
    throw new AppError(404, "Announcement not found", "not_found");
  }

  const membership = await requireMembership(userId, groupId);
  if (announcement.authorId !== userId && membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
    throw new AppError(403, "You can only delete your own announcements", "forbidden");
  }

  await prisma.announcement.delete({ where: { id } });
};

