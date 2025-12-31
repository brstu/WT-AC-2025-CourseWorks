import { prisma } from "../../lib/prisma";

export function listSla() {
  return prisma.sLA.findMany({
    orderBy: { createdAt: "asc" },
    include: { queue: true },
  });
}

export function listSlaForUser(userId: string) {
  return prisma.sLA.findMany({
    orderBy: { createdAt: "asc" },
    where: {
      queue: {
        members: {
          some: { userId },
        },
      },
    },
    include: { queue: true },
  });
}

export function getSlaById(id: string) {
  return prisma.sLA.findUnique({
    where: { id },
    include: { queue: true },
  });
}

export function getSlaByIdForUser(id: string, userId: string) {
  return prisma.sLA.findFirst({
    where: {
      id,
      queue: {
        members: {
          some: { userId },
        },
      },
    },
    include: { queue: true },
  });
}

export async function createSla(data: {
  queueId: string;
  reactionTimeMinutes: number;
  resolutionTimeMinutes: number;
}) {
  // проверяем что очередь существует
  await prisma.queue.findUniqueOrThrow({ where: { id: data.queueId } });

  return prisma.sLA.create({
    data,
    include: { queue: true },
  });
}

export async function updateSla(
  id: string,
  data: { reactionTimeMinutes?: number; resolutionTimeMinutes?: number }
) {
  return prisma.sLA.update({
    where: { id },
    data,
    include: { queue: true },
  });
}
