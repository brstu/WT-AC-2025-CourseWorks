import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { buildPagination } from "../../lib/pagination.js";
import { requireMembership } from "../groups/groups.service.js";
import { MembershipRole } from "@prisma/client";

export const getPolls = async (
  groupId: string,
  userId: string,
  page?: number | string,
  pageSize?: number | string
) => {
  const { skip, take } = buildPagination(page, pageSize);
  await requireMembership(userId, groupId);

  const [items, total] = await Promise.all([
    prisma.poll.findMany({
      where: { groupId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        choices: {
          include: {
            votes: true
          },
          orderBy: { order: "asc" }
        }
      }
    }),
    prisma.poll.count({ where: { groupId } })
  ]);

  return { items, total };
};

export const getPoll = async (groupId: string, id: string, userId: string) => {
  await requireMembership(userId, groupId);

  const poll = await prisma.poll.findFirst({
    where: { id, groupId },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      choices: {
        include: {
          votes: true
        },
        orderBy: { order: "asc" }
      }
    }
  });

  if (!poll) {
    throw new AppError(404, "Poll not found", "not_found");
  }

  return poll;
};

export const createPoll = async (
  groupId: string,
  userId: string,
  data: { question: string; isAnonymous?: boolean; isMultipleChoice?: boolean; expiresAt?: string; choices: { text: string }[] }
) => {
  await requireMembership(userId, groupId, [MembershipRole.admin, MembershipRole.moderator, MembershipRole.member]);

  const poll = await prisma.poll.create({
    data: {
      groupId,
      creatorId: userId,
      question: data.question,
      isAnonymous: data.isAnonymous ?? false,
      isMultipleChoice: data.isMultipleChoice ?? false,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      choices: {
        create: data.choices.map((choice, index) => ({
          text: choice.text,
          order: index
        }))
      }
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      choices: {
        orderBy: { order: "asc" }
      }
    }
  });

  return poll;
};

export const vote = async (groupId: string, pollId: string, userId: string, choiceIds: string[]) => {
  await requireMembership(userId, groupId, [MembershipRole.admin, MembershipRole.moderator, MembershipRole.member]);

  const poll = await prisma.poll.findFirst({
    where: { id: pollId, groupId },
    include: { choices: true }
  });

  if (!poll) {
    throw new AppError(404, "Poll not found", "not_found");
  }

  if (poll.expiresAt && poll.expiresAt < new Date()) {
    throw new AppError(400, "Poll has expired", "bad_request");
  }

  if (!poll.isMultipleChoice && choiceIds.length > 1) {
    throw new AppError(400, "This poll allows only one choice", "bad_request");
  }

  const validChoiceIds = poll.choices.map((c) => c.id);
  if (!choiceIds.every((id) => validChoiceIds.includes(id))) {
    throw new AppError(400, "Invalid choice IDs", "bad_request");
  }

  // Удаляем предыдущие голоса пользователя
  await prisma.vote.deleteMany({
    where: {
      pollId,
      voterId: userId
    }
  });

  // Создаем новые голоса
  await prisma.vote.createMany({
    data: choiceIds.map((choiceId) => ({
      pollId,
      choiceId,
      voterId: userId
    }))
  });

  return getPoll(groupId, pollId, userId);
};

export const deletePoll = async (groupId: string, id: string, userId: string) => {
  const poll = await prisma.poll.findFirst({
    where: { id, groupId }
  });

  if (!poll) {
    throw new AppError(404, "Poll not found", "not_found");
  }

  const membership = await requireMembership(userId, groupId);
  if (poll.creatorId !== userId && membership !== MembershipRole.admin && membership !== MembershipRole.moderator) {
    throw new AppError(403, "You can only delete your own polls", "forbidden");
  }

  await prisma.poll.delete({ where: { id } });
};

