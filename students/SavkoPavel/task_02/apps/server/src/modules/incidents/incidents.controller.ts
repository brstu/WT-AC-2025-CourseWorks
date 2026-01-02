import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import * as incidentsService from "./incidents.service";
import {
  IncidentPriority,
  IncidentStatus,
  isIncidentPriority,
  isIncidentStatus,
} from "./incidents.types";

function parseLimit(value: unknown) {
  const raw = typeof value === "string" ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(raw)) return 20;
  return Math.min(Math.max(raw, 1), 100);
}

function parseOffset(value: unknown) {
  const raw = typeof value === "string" ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(raw)) return 0;
  return Math.max(raw, 0);
}

function canReadIncident(user: { userId: string; role: string }, incident: { createdById: string }) {
  if (user.role === "ADMIN") return true;
  return incident.createdById === user.userId;
}

function canEditIncidentAsUser(user: { userId: string; role: string }, incident: { createdById: string }) {
  return user.role === "USER" && incident.createdById === user.userId;
}

export async function list(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  const statusRaw = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;
  const priorityRaw = Array.isArray(req.query.priority) ? req.query.priority[0] : req.query.priority;

  const status = isIncidentStatus(statusRaw) ? statusRaw : undefined;
  const priority = isIncidentPriority(priorityRaw) ? priorityRaw : undefined;
  const queueId = req.query.queueId as string | undefined;

  const incidents = await incidentsService.listIncidents({
    role: user.role,
    userId: user.userId,
    status,
    priority,
    queueId,
    limit: parseLimit(req.query.limit),
    offset: parseOffset(req.query.offset),
  });

  res.json({ status: "ok", data: incidents });
}

export async function getById(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  const incident = await incidentsService.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  if (user.role === "AGENT") {
    const inQueue = await prisma.queueMember.count({
      where: { queueId: incident.queueId, userId: user.userId },
    });
    if (!inQueue) return res.status(403).json({ error: "Forbidden" });
  } else if (!canReadIncident(user, incident)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.json({ status: "ok", data: incident });
}

export async function create(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  if (user.role === "AGENT") {
    return res.status(403).json({ error: "AGENT_CANNOT_CREATE_INCIDENT" });
  }

  const { title, description, priority, queueId } = req.body as {
    title?: string;
    description?: string;
    priority?: IncidentPriority;
    queueId?: string;
  };

  if (!title || !description) {
    return res.status(400).json({ error: "TITLE_AND_DESCRIPTION_REQUIRED" });
  }

  if (priority !== undefined && !isIncidentPriority(priority)) {
    return res.status(400).json({ error: "INVALID_PRIORITY" });
  }

  // очередь: либо заданная, либо первая очередь, где есть SLA
  const queue = queueId
    ? await prisma.queue.findUnique({ where: { id: queueId }, include: { sla: true } })
    : await prisma.queue.findFirst({
        where: { sla: { isNot: null } },
        orderBy: { createdAt: "asc" },
        include: { sla: true },
      });

  if (!queue) {
    return res.status(400).json({ error: "QUEUE_NOT_FOUND" });
  }
  if (!queue.sla) {
    return res.status(400).json({ error: "SLA_NOT_CONFIGURED_FOR_QUEUE" });
  }

  const incident = await incidentsService.createIncident({
    title,
    description,
    priority,
    queueId: queue.id,
    slaId: queue.sla.id,
    createdById: user.userId,
  });

  res.status(201).json({ status: "ok", data: incident });
}

export async function update(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  const incident = await incidentsService.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  // user не может менять инцидент
  if (user.role === "USER") {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (user.role === "AGENT") {
    const inQueue = await prisma.queueMember.count({
      where: { queueId: incident.queueId, userId: user.userId },
    });
    if (!inQueue) return res.status(403).json({ error: "Forbidden" });
  }

  const { status, priority, take } = req.body as {
    status?: IncidentStatus;
    priority?: IncidentPriority;
    take?: boolean;
  };

  if (status !== undefined && !isIncidentStatus(status)) {
    return res.status(400).json({ error: "INVALID_STATUS" });
  }
  if (priority !== undefined && !isIncidentPriority(priority)) {
    return res.status(400).json({ error: "INVALID_PRIORITY" });
  }

  const data: any = {};
  if (status) data.status = status;
  if (priority) data.priority = priority;

  // агент может “взять в работу”
  if (user.role === "AGENT" && take === true) {
    data.assignedToId = user.userId;
    data.status = "in_progress";
  }

  try {
    const updated = await incidentsService.updateIncident(req.params.id, data);
    res.json({ status: "ok", data: updated });
  } catch {
    res.status(400).json({ error: "UPDATE_FAILED" });
  }
}

export async function patch(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  const incident = await incidentsService.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  // USER может редактировать только свой инцидент и только поля карточки
  if (user.role === "USER") {
    if (!canEditIncidentAsUser(user, incident)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { title, description, priority } = req.body as {
      title?: string;
      description?: string;
      priority?: IncidentPriority;
    };

    const data: any = {};
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "INVALID_TITLE" });
      }
      data.title = title;
    }
    if (description !== undefined) {
      if (typeof description !== "string" || description.trim().length === 0) {
        return res.status(400).json({ error: "INVALID_DESCRIPTION" });
      }
      data.description = description;
    }
    if (priority !== undefined) {
      if (!isIncidentPriority(priority)) {
        return res.status(400).json({ error: "INVALID_PRIORITY" });
      }
      data.priority = priority;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "NO_FIELDS_TO_UPDATE" });
    }

    try {
      const updated = await incidentsService.updateIncident(req.params.id, data);
      return res.json({ status: "ok", data: updated });
    } catch {
      return res.status(400).json({ error: "UPDATE_FAILED" });
    }
  }

  if (user.role === "AGENT") {
    const inQueue = await prisma.queueMember.count({
      where: { queueId: incident.queueId, userId: user.userId },
    });
    if (!inQueue) return res.status(403).json({ error: "Forbidden" });
  }

  // ADMIN/AGENT: workflow updates (status/priority/take + optional title/description for ADMIN)
  const { status, priority, take, title, description, assignedToId } = req.body as {
    status?: IncidentStatus;
    priority?: IncidentPriority;
    take?: boolean;
    title?: string;
    description?: string;
    assignedToId?: string | null;
  };

  if (status !== undefined && !isIncidentStatus(status)) {
    return res.status(400).json({ error: "INVALID_STATUS" });
  }
  if (priority !== undefined && !isIncidentPriority(priority)) {
    return res.status(400).json({ error: "INVALID_PRIORITY" });
  }

  const data: any = {};
  if (status) data.status = status;
  if (priority) data.priority = priority;

  if (user.role === "AGENT") {
    if (take === true) {
      data.assignedToId = user.userId;
      data.status = "in_progress";
    }
  } else {
    // ADMIN
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "INVALID_TITLE" });
      }
      data.title = title;
    }
    if (description !== undefined) {
      if (typeof description !== "string" || description.trim().length === 0) {
        return res.status(400).json({ error: "INVALID_DESCRIPTION" });
      }
      data.description = description;
    }
    if (assignedToId !== undefined) {
      if (assignedToId !== null && typeof assignedToId !== "string") {
        return res.status(400).json({ error: "INVALID_ASSIGNED_TO" });
      }
      data.assignedToId = assignedToId;
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "NO_FIELDS_TO_UPDATE" });
  }

  try {
    const updated = await incidentsService.updateIncident(req.params.id, data);
    return res.json({ status: "ok", data: updated });
  } catch {
    return res.status(400).json({ error: "UPDATE_FAILED" });
  }
}

export async function remove(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };
  if (user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    await incidentsService.deleteIncident(req.params.id);
    return res.json({ status: "ok" });
  } catch {
    return res.status(404).json({ error: "Incident not found" });
  }
}

export async function listComments(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  const incident = await prisma.incident.findUnique({
    where: { id: req.params.id },
    select: { id: true, createdById: true },
  });
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  if (!canReadIncident(user, incident)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const comments = await incidentsService.listComments(incident.id);
  res.json({ status: "ok", data: comments });
}

export async function addComment(req: Request, res: Response) {
  const user = (req as any).user as { userId: string; role: "ADMIN" | "AGENT" | "USER" };

  const incident = await prisma.incident.findUnique({
    where: { id: req.params.id },
    select: { id: true, createdById: true },
  });
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  if (!canReadIncident(user, incident)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { message } = req.body as { message?: string };
  if (!message) {
    return res.status(400).json({ error: "MESSAGE_REQUIRED" });
  }

  const comment = await incidentsService.addComment({
    incidentId: incident.id,
    authorId: user.userId,
    message,
  });

  res.status(201).json({ status: "ok", data: comment });
}
