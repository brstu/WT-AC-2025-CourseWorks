import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { buildPagination } from "../../lib/pagination.js";
import { requireMembership } from "../groups/groups.service.js";
import { MembershipRole } from "@prisma/client";

export const getChats = async (
  groupId: string,
  userId: string,
  page?: number | string,
  pageSize?: number | string
) => {
  const { skip, take } = buildPagination(page, pageSize);
  await requireMembership(userId, groupId);

  const [items, total] = await Promise.all([
    prisma.chat.findMany({
      where: { groupId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { messages: true }
        }
      }
    }),
    prisma.chat.count({ where: { groupId } })
  ]);

  return { items, total };
};

export const getChat = async (groupId: string, id: string, userId: string) => {
  await requireMembership(userId, groupId);

  const chat = await prisma.chat.findFirst({
    where: { id, groupId },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!chat) {
    throw new AppError(404, "Chat not found", "not_found");
  }

  return chat;
};

export const createChat = async (
  groupId: string,
  userId: string,
  data: { title: string; type: string; isReadOnly?: boolean }
) => {
  await requireMembership(userId, groupId, [MembershipRole.admin, MembershipRole.moderator, MembershipRole.member]);

  const chat = await prisma.chat.create({
    data: {
      groupId,
      createdById: userId,
      title: data.title,
      type: data.type as any,
      isReadOnly: data.isReadOnly ?? false
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return chat;
};

export const getMessages = async (
  groupId: string,
  chatId: string,
  userId: string,
  page?: number | string,
  pageSize?: number | string
) => {
  await requireMembership(userId, groupId);

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, groupId }
  });

  if (!chat) {
    throw new AppError(404, "Chat not found", "not_found");
  }

  const { skip, take } = buildPagination(page, pageSize);

  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where: {
        chatId,
        isDeleted: false
      },
      skip,
      take,
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    }),
    prisma.message.count({
      where: {
        chatId,
        isDeleted: false
      }
    })
  ]);

  return { items, total };
};

export const sendMessage = async (
  groupId: string,
  chatId: string,
  userId: string,
  data: { content: string; attachments?: any[] }
) => {
  await requireMembership(userId, groupId, [MembershipRole.admin, MembershipRole.moderator, MembershipRole.member]);

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, groupId }
  });

  if (!chat) {
    throw new AppError(404, "Chat not found", "not_found");
  }

  if (chat.isReadOnly) {
    const membership = await requireMembership(userId, groupId);
    if (membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
      throw new AppError(403, "This chat is read-only", "forbidden");
    }
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      authorId: userId,
      content: data.content,
      attachments: data.attachments ?? []
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return message;
};

export const updateMessage = async (
  groupId: string,
  chatId: string,
  messageId: string,
  userId: string,
  data: { content: string }
) => {
  await requireMembership(userId, groupId);

  const message = await prisma.message.findFirst({
    where: { id: messageId, chatId }
  });

  if (!message) {
    throw new AppError(404, "Message not found", "not_found");
  }

  if (message.authorId !== userId) {
    throw new AppError(403, "You can only edit your own messages", "forbidden");
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: data.content,
      editedAt: new Date()
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return updated;
};

export const deleteMessage = async (groupId: string, chatId: string, messageId: string, userId: string) => {
  await requireMembership(userId, groupId);

  const message = await prisma.message.findFirst({
    where: { id: messageId, chatId }
  });

  if (!message) {
    throw new AppError(404, "Message not found", "not_found");
  }

  const membership = await requireMembership(userId, groupId);
  if (message.authorId !== userId && membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
    throw new AppError(403, "You can only delete your own messages", "forbidden");
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true }
  });
};

export const deleteChat = async (groupId: string, id: string, userId: string) => {
  const chat = await prisma.chat.findFirst({
    where: { id, groupId }
  });

  if (!chat) {
    throw new AppError(404, "Chat not found", "not_found");
  }

  const membership = await requireMembership(userId, groupId);
  if (chat.createdById !== userId && membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
    throw new AppError(403, "You can only delete chats you created", "forbidden");
  }

  await prisma.chat.delete({ where: { id } });
};

