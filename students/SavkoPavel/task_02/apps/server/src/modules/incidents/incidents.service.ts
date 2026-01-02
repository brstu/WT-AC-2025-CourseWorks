import { prisma } from "../../lib/prisma";
import { IncidentPriority, IncidentStatus } from "./incidents.types";

export async function listIncidents(params: {
  role: "ADMIN" | "AGENT" | "USER";
  userId: string;
  status?: IncidentStatus;
  priority?: IncidentPriority;
  queueId?: string;
  limit: number;
  offset: number;
}) {
  const where: any = {};

  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.queueId) where.queueId = params.queueId;

  if (params.role === "USER") {
    where.createdById = params.userId;
  }

  if (params.role === "AGENT") {
    // агент видит только инциденты из очередей, где он состоит
    where.queue = {
      members: {
        some: { userId: params.userId },
      },
    };
  }

  return prisma.incident.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: params.offset,
    take: params.limit,
    include: {
      queue: true,
      sla: true,
      createdBy: { select: { id: true, email: true, role: true } },
      assignedTo: { select: { id: true, email: true, role: true } },
    },
  });
}

export function getIncidentById(id: string) {
  return prisma.incident.findUnique({
    where: { id },
    include: {
      queue: true,
      sla: true,
      createdBy: { select: { id: true, email: true, role: true } },
      assignedTo: { select: { id: true, email: true, role: true } },
    },
  });
}

export function createIncident(data: {
  title: string;
  description: string;
  priority?: IncidentPriority;
  queueId: string;
  slaId: string;
  createdById: string;
}) {
  return prisma.incident.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      queueId: data.queueId,
      slaId: data.slaId,
      createdById: data.createdById,
    },
    include: {
      queue: true,
      sla: true,
      createdBy: { select: { id: true, email: true, role: true } },
      assignedTo: { select: { id: true, email: true, role: true } },
    },
  });
}

export function updateIncident(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: IncidentStatus;
    priority?: IncidentPriority;
    assignedToId?: string | null;
  }
) {
  return prisma.incident.update({
    where: { id },
    data,
    include: {
      queue: true,
      sla: true,
      createdBy: { select: { id: true, email: true, role: true } },
      assignedTo: { select: { id: true, email: true, role: true } },
    },
  });
}

export async function deleteIncident(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({ where: { incidentId: id } });
    return tx.incident.delete({ where: { id } });
  });
}

export function listComments(incidentId: string) {
  return prisma.comment.findMany({
    where: { incidentId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, email: true, role: true } },
    },
  });
}

export function addComment(data: { incidentId: string; authorId: string; message: string }) {
  return prisma.comment.create({
    data,
    include: { author: { select: { id: true, email: true, role: true } } },
  });
}
