import { prisma } from "../../lib/prisma";

export function listQueues() {
  return prisma.queue.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      sla: true,
    },
  });
}

export function listQueuesForUser(userId: string) {
  return prisma.queue.findMany({
    orderBy: { createdAt: "asc" },
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      sla: true,
    },
  });
}

export function getQueueById(id: string) {
  return prisma.queue.findUnique({
    where: { id },
    include: { sla: true },
  });
}

export function getQueueByIdForUser(id: string, userId: string) {
  return prisma.queue.findFirst({
    where: {
      id,
      members: {
        some: { userId },
      },
    },
    include: { sla: true },
  });
}

export function createQueue(data: { name: string; description?: string }) {
  return prisma.queue.create({
    data,
    include: { sla: true },
  });
}

export function updateQueue(id: string, data: { name?: string; description?: string | null }) {
  return prisma.queue.update({
    where: { id },
    data,
    include: { sla: true },
  });
}

export function deleteQueue(id: string) {
  return prisma.queue.delete({
    where: { id },
  });
}

export function listQueueAgents(queueId: string) {
  return prisma.queueMember.findMany({
    where: { queueId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, email: true, role: true } },
    },
  });
}

export function addAgentToQueue(queueId: string, userId: string) {
  return prisma.queueMember.create({
    data: { queueId, userId },
    include: { user: { select: { id: true, email: true, role: true } } },
  });
}

export async function removeAgentFromQueue(queueId: string, userId: string) {
  return prisma.queueMember.deleteMany({
    where: { queueId, userId },
  });
}

export async function isUserInQueue(queueId: string, userId: string) {
  const count = await prisma.queueMember.count({ where: { queueId, userId } });
  return count > 0;
}
