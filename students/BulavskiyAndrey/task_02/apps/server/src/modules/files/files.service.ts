import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { buildPagination } from "../../lib/pagination.js";
import { requireMembership } from "../groups/groups.service.js";
import { MembershipRole } from "@prisma/client";

export const getFiles = async (
  groupId: string,
  userId: string,
  page?: number | string,
  pageSize?: number | string,
  category?: string
) => {
  const { skip, take } = buildPagination(page, pageSize);
  await requireMembership(userId, groupId);

  const where: any = { groupId };
  if (category) {
    where.category = category;
  }

  const [items, total] = await Promise.all([
    prisma.file.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        }
      }
    }),
    prisma.file.count({ where })
  ]);

  return { items, total };
};

export const getFile = async (groupId: string, id: string, userId: string) => {
  await requireMembership(userId, groupId);

  const file = await prisma.file.findFirst({
    where: { id, groupId },
    include: {
      uploader: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!file) {
    throw new AppError(404, "File not found", "not_found");
  }

  return file;
};

export const createFile = async (
  groupId: string,
  userId: string,
  data: { name: string; description?: string; filePath: string; fileSize: number; mimeType: string; category?: string }
) => {
  await requireMembership(userId, groupId, [MembershipRole.admin, MembershipRole.moderator, MembershipRole.member]);

  const file = await prisma.file.create({
    data: {
      groupId,
      uploaderId: userId,
      name: data.name,
      description: data.description,
      filePath: data.filePath,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      category: data.category
    },
    include: {
      uploader: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return file;
};

export const deleteFile = async (groupId: string, id: string, userId: string) => {
  const file = await prisma.file.findFirst({
    where: { id, groupId }
  });

  if (!file) {
    throw new AppError(404, "File not found", "not_found");
  }

  const membership = await requireMembership(userId, groupId);
  if (file.uploaderId !== userId && membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
    throw new AppError(403, "You can only delete your own files", "forbidden");
  }

  await prisma.file.delete({ where: { id } });
};

